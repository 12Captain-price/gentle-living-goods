import { useSyncExternalStore, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

const STORAGE_PREFIX = "sc_content:";
const EDIT_MODE_KEY = "sc_edit_mode";

const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

function subscribe(cb: () => void) {
  listeners.add(cb);
  const s = () => cb();
  window.addEventListener("storage", s);
  return () => { listeners.delete(cb); window.removeEventListener("storage", s); };
}

function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_PREFIX + key);
}
function writeRaw(key: string, value: string) {
  window.localStorage.setItem(STORAGE_PREFIX + key, value);
  emit();
}

export function useContent(key: string, defaultValue: string): [string, (v: string) => void] {
  const snap = useSyncExternalStore(subscribe, () => readRaw(key) ?? "", () => "");
  const value = snap || defaultValue;
  return [value, (v: string) => writeRaw(key, v)];
}

export function useContentList<T>(key: string, defaultValue: T[]): [T[], (v: T[]) => void] {
  const snap = useSyncExternalStore(subscribe, () => readRaw(key) ?? "", () => "");
  let value: T[] = defaultValue;
  if (snap) { try { value = JSON.parse(snap) as T[]; } catch { /* ignore */ } }
  return [value, (v: T[]) => writeRaw(key, JSON.stringify(v))];
}

export function useEditMode(): [boolean, (v: boolean) => void] {
  const snap = useSyncExternalStore(
    (cb) => {
      const s = () => cb();
      window.addEventListener("storage", s);
      listeners.add(cb);
      return () => { window.removeEventListener("storage", s); listeners.delete(cb); };
    },
    () => (typeof window !== "undefined" ? window.sessionStorage.getItem(EDIT_MODE_KEY) : null) ?? "",
    () => "",
  );
  const on = snap === "1";
  const set = (v: boolean) => {
    if (v) window.sessionStorage.setItem(EDIT_MODE_KEY, "1");
    else window.sessionStorage.removeItem(EDIT_MODE_KEY);
    emit();
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

  return (
    <div className="relative w-full h-full">
      <img src={src} alt={alt} className={cn(className, "outline outline-2 outline-dashed outline-gold/70 cursor-pointer")} onClick={() => { setDraft(src); setEditing(true); }} />
      {editing && (
        <div className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur p-3 flex gap-2 z-20">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} className="flex-1 border px-2 py-1 text-sm" placeholder="Paste image URL" />
          <button onClick={() => { setSrc(draft); setEditing(false); }} className="bg-navy text-white px-3 py-1 text-sm">Save</button>
          <button onClick={() => setEditing(false)} className="border px-3 py-1 text-sm">Cancel</button>
        </div>
      )}
    </div>
  );
}