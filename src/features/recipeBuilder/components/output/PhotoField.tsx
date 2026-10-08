import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { validatePhotoFile } from "../../../../core/logic/media/mediaLogic";

export interface PhotoFieldProps {
  label: string;
  file: File | null;
  hasExisting: boolean;
  onPick: (file: File | null) => void;
}

export const PhotoField = ({ label, file, hasExisting, onPick }: PhotoFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!picked) return;
    const invalid = validatePhotoFile(picked);
    setError(invalid ?? "");
    if (!invalid) onPick(picked);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-wide">{label}</span>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-subtle text-sm text-slate-600 hover:border-orange-300 transition-colors"
      >
        <ImagePlus className="w-4 h-4 shrink-0 text-slate-400" />
        <span className="truncate">
          {file ? file.name : hasExisting ? "Remplacer la photo actuelle" : "Choisir une image"}
        </span>
      </button>
      {file && (
        <button type="button" onClick={() => onPick(null)} className="self-start text-xs text-slate-400 hover:text-red-500">
          Retirer
        </button>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
