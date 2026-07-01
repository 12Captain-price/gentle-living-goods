import { useSyncExternalStore, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const EDIT_MODE_KEY = "sc_edit_mode";

// ============================================================
// site_content table cache — key/value store for editable text and
// hero/feature images, synced live via Supabase Realtime so an
// admin edit on one device shows up everywhere.
// ============================================================
let cache = new Map<string, string>();
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function refresh() {
  const { data, error } = await supabase.from("site_content").select("key,value");
  if (!error && data) {
    cache = new Map(data.map((row) => [row.key, row.value]));
    loaded = true;
    emit();
  }
}

if (typeof window !== "undefined") {
  refresh();
  supabase
    .channel("public:site_content")
    .on("postgres_changes", { event: "*", schema: "public", table: "site_content" }, () => refresh())
    .subscribe();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return cache;
}
function getServerSnapshot() {
  return new Map<string, string>();
}

function writeValue(key: string, value: string) {
  // Optimistic local update so the UI feels instant.
  cache = new Map(cache);
  cache.set(key, value);
  emit();
  supabase.from("site_content").upsert({ key, value }).then(({ error }) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error("Zozo: failed to save content", key, error);
    }
  });
}

export function useContent(key: string, defaultValue: string): [string, (v: string) => void] {
  const map = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = map.get(key) ?? defaultValue;
  return [value, (v: string) => writeValue(key, v)];
}

export function useContentList<T>(key: string, defaultValue: T[]): [T[], (v: T[]) => void] {
  const map = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const raw = map.get(key);
  let value: T[] = defaultValue;
  if (raw) {
    try { value = JSON.parse(raw) as T[]; } catch { /* ignore */ }
  }
  return [value, (v: T[]) => writeValue(key, JSON.stringify(v))];
}

// ---- Edit mode is a local (not device-synced) flag, but stored in
// localStorage rather than sessionStorage so that toggling it ON in
// the Admin tab is visible immediately when you open the storefront
// in a separate tab of the same browser.
const editModeListeners = new Set<() => void>();
function useEditModeSnapshot() {
  return typeof window !== "undefined" ? window.localStorage.getItem(EDIT_MODE_KEY) : null;
}
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === EDIT_MODE_KEY) editModeListeners.forEach((l) => l());
  });
}
export function useEditMode(): [boolean, (v: boolean) => void] {
  const snap = useSyncExternalStore(
    (cb) => { editModeListeners.add(cb); return () => editModeListeners.delete(cb); },
    () => useEditModeSnapshot() ?? "",
    () => "",
  );
  const on = snap === "1";
  const set = (v: boolean) => {
    if (v) window.localStorage.setItem(EDIT_MODE_KEY, "1");
    else window.localStorage.removeItem(EDIT_MODE_KEY);
    editModeListeners.forEach((l) => l());
  };
  return [on, set];
}

interface EditableProps {
  k: string;
  defaultValue: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children?: ReactNode;
}

export function Editable({ k, defaultValue, as: As = "span", className }: EditableProps) {
  const [value, setValue] = useContent(k, defaultValue);
  const [editing, setEditing] = useState(false);
  const [editMode] = useEditMode();
  const [draft, setDraft] = useState(value);

  if (!editMode) {
    return <As className={className}>{value}</As>;
  }

  if (editing) {
    return (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { setValue(draft); setEditing(false); }}
        className={cn(className, "outline-none border-2 border-dashed border-gold bg-gold/5 p-1 w-full")}
        rows={Math.max(1, Math.ceil(draft.length / 60))}
      />
    );
  }

  return (
    <As
      className={cn(className, "outline outline-2 outline-dashed outline-gold/60 cursor-text hover:bg-gold/10")}
      onClick={() => { setDraft(value); setEditing(true); }}
    >
      {value}
    </As>
  );
}

interface EditableImageProps {
  k: string;
  defaultSrc: string;
  alt: string;
  className?: string;
}

export function EditableImage({ k, defaultSrc, alt, className }: EditableImageProps) {
  const [src, setSrc] = useContent(k, defaultSrc);
  const [editing, setEditing] = useState(false);
  const [editMode] = useEditMode();
  const [draft, setDraft] = useState(src);

  if (!editMode) return <img src={src} alt={alt} className={className} />;

  // The wrapping div (not the <img>) carries the click handler and the
  // dashed outline. Some images (e.g. a parallax hero) are deliberately
  // oversized and clipped by an ancestor's overflow-hidden, which pushes
  // the img's own box edges outside the visible area — so an outline or
  // click target on the img itself can end up invisible or unreachable.
  // The wrapper always matches the visible container, so it stays clickable.
  return (
    <div
      className="relative w-full h-full cursor-pointer"
      onClick={() => { setDraft(src); setEditing(true); }}
    >
      <img src={src} alt={alt} className={className} />
      <div className="absolute inset-0 outline outline-2 outline-dashed outline-gold/70 pointer-events-none" aria-hidden="true" />
      {editing && (
        <div
          className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur p-3 flex gap-2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <input value={draft} onChange={(e) => setDraft(e.target.value)} className="flex-1 border px-2 py-1 text-sm" placeholder="Paste image URL" />
          <button onClick={() => { setSrc(draft); setEditing(false); }} className="bg-navy text-white px-3 py-1 text-sm">Save</button>
          <button onClick={() => setEditing(false)} className="border px-3 py-1 text-sm">Cancel</button>
        </div>
      )}
    </div>
  );
}