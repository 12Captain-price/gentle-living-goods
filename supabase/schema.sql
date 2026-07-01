-- ============================================================
-- ZOZO — Supabase schema
-- Run this once in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- ---------- categories ----------
create table if not exists public.categories (
  id text primary key,
  name text not null
);

-- ---------- products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  collection text not null references public.categories(id) on delete restrict,
  price numeric not null default 0,
  description text not null default '',
  long_description text not null default '',
  materials text not null default '',
  dimensions text,
  images text[] not null default '{}',
  featured boolean not null default false,
  is_new boolean not null default false,
  stock integer not null default 0,
  sale_price numeric,
  sale_end_date date,
  created_at timestamptz not null default now()
);

-- ---------- delivery zones ----------
create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fee_usd numeric not null default 0
);

-- ---------- coupons ----------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  value numeric not null default 0,
  active boolean not null default true
);

-- ---------- testimonials ----------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  role text not null default '',
  quote text not null
);

-- ---------- about page gallery ----------
create table if not exists public.about_gallery (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  caption text not null default '',
  sort_order integer not null default 0
);

-- ---------- about page brand logos ----------
create table if not exists public.about_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  src text not null,
  url text,
  sort_order integer not null default 0
);

-- ---------- company settings (single row) ----------
create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  vat_number text not null default '',
  tin text not null default '',
  bank_name text not null default '',
  account_name text not null default '',
  account_number text not null default '',
  branch text not null default '',
  ecocash_number text not null default '',
  usd_to_zwl_rate numeric not null default 27000,
  whatsapp1 text not null default '263774098174',
  whatsapp2 text not null default '263775863002'
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ---------- editable site text / hero & feature images ----------
create table if not exists public.site_content (
  key text primary key,
  value text not null
);

-- ============================================================
-- Row Level Security
-- Admin login in this app is a client-side flag only (no Supabase
-- Auth wired up yet), so these policies allow the public anon key
-- full read/write access — same trust model as the old localStorage
-- version, just shared across devices now. Tighten these once real
-- auth is added.
-- ============================================================
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.coupons enable row level security;
alter table public.testimonials enable row level security;
alter table public.about_gallery enable row level security;
alter table public.about_logos enable row level security;
alter table public.settings enable row level security;
alter table public.site_content enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'categories','products','delivery_zones','coupons','testimonials',
    'about_gallery','about_logos','settings','site_content'
  ])
  loop
    execute format('drop policy if exists "public_all_%1$s" on public.%1$s', t);
    execute format(
      'create policy "public_all_%1$s" on public.%1$s for all using (true) with check (true)', t
    );
  end loop;
end $$;

-- ============================================================
-- Realtime — so admin edits on one device show up live everywhere
-- ============================================================
alter publication supabase_realtime add table
  public.categories,
  public.products,
  public.delivery_zones,
  public.coupons,
  public.testimonials,
  public.about_gallery,
  public.about_logos,
  public.settings,
  public.site_content;

-- ============================================================
-- Storage — product-images bucket policies
-- Create the "product-images" bucket first (Storage → New bucket →
-- Public), then run this to allow uploads via the anon key.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public_read_product_images" on storage.objects;
create policy "public_read_product_images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "public_write_product_images" on storage.objects;
create policy "public_write_product_images" on storage.objects
  for insert with check (bucket_id = 'product-images');

drop policy if exists "public_update_product_images" on storage.objects;
create policy "public_update_product_images" on storage.objects
  for update using (bucket_id = 'product-images');

drop policy if exists "public_delete_product_images" on storage.objects;
create policy "public_delete_product_images" on storage.objects
  for delete using (bucket_id = 'product-images');
