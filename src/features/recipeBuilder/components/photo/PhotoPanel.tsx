import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, ImageOff, ImagePlus } from "lucide-react";
import { RecipeBuilderState } from "../../../../core/domain/recipeBuilderTypes";
import { buildImageName } from "../../../../core/logic/recipeBuilder/recipeCodeLogic";
import { useBuilderSourceRecipe } from "../../../../shared/hooks/useBuilderSourceRecipe";
import { AsyncImage } from "../../../../shared/components/ui/AsyncImage";
import { builderStateToRecetteCardData, builderStateToBookCardData } from "../../../../shared/utils/cards/cardAdapter";
import { downloadRecetteCard, downloadRecetteBookCard } from "../../../../shared/utils/cards/cardExport";
import { PhotoField } from "../output/PhotoField";
import { validatePhotoFile } from "../../../../core/logic/media/mediaLogic";

export interface PhotoPanelProps {
  state: RecipeBuilderState;
  mealPhoto: File | null;
  onPickMeal: (file: File | null) => void;
  bookPhoto: File | null;
  onPickBook: (file: File | null) => void;
}

export const PhotoPanel = ({ state, mealPhoto, onPickMeal, bookPhoto, onPickBook }: PhotoPanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const existing = useBuilderSourceRecipe(state);
  const existingUrl = existing?.assets?.mealPhoto?.url;

  const localUrl = useMemo(() => (mealPhoto ? URL.createObjectURL(mealPhoto) : null), [mealPhoto]);
  useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl); }, [localUrl]);

  const source: File | string | null = mealPhoto ?? existingUrl ?? null;
  const existingBookUrl = existing?.assets?.bookPhoto?.url;
  const bookSource: File | string | null = bookPhoto ?? existingBookUrl ?? null;

  const pickMeal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!picked) return;
    const invalid = validatePhotoFile(picked);
    setError(invalid ?? "");
    if (!invalid) onPickMeal(picked);
  };

  const handleDownload = async () => {
    if (!source) return;
    setDownloading(true);
    setError("");
    try {
      const filename = buildImageName(state.categoryId, state.recipeNumber, state.name || "recette");
      if (state.isFromBook && bookSource) {
        await downloadRecetteBookCard(builderStateToBookCardData(state, "", ""), source, bookSource, filename);
      } else {
        await downloadRecetteCard(builderStateToRecetteCardData(state, ""), source, filename);
      }
    } catch {
      setError("Le téléchargement de la recette a échoué.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Photo du plat <span className="text-orange-500">· obligatoire</span></h2>

      <div className="flex gap-3">
        <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-muted">
          {localUrl ? (
            <img src={localUrl} alt="Aperçu" className="absolute inset-0 w-full h-full object-cover" />
          ) : existingUrl ? (
            <AsyncImage asset={existing?.assets?.mealPhoto} alt={state.name} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
              <ImageOff className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pickMeal} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-subtle text-xs font-semibold text-slate-600 hover:border-orange-300 transition-colors"
          >
            <ImagePlus className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{mealPhoto ? mealPhoto.name : existingUrl ? "Remplacer" : "Choisir une image"}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!source || downloading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-subtle text-xs font-semibold text-slate-600 hover:border-orange-300 transition-colors disabled:opacity-40"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin text-slate-400" />
            ) : (
              <Download className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            )}
            <span className="truncate">Télécharger la recette</span>
          </button>
          {mealPhoto && (
            <button type="button" onClick={() => onPickMeal(null)} className="self-start text-[11px] text-slate-400 hover:text-red-500">
              Retirer
            </button>
          )}
        </div>
      </div>

      {error && <span className="text-[11px] text-red-500">{error}</span>}

      {state.isFromBook && (
        <PhotoField
          label="Photo du livre"
          file={bookPhoto}
          hasExisting={Boolean(existing?.assets?.bookPhoto)}
          onPick={onPickBook}
        />
      )}
    </div>
  );
};
