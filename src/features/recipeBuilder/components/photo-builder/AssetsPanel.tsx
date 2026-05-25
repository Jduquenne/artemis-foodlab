import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Upload, X, Download, FolderDown, Loader2 } from "lucide-react";
import { RecipeBuilderState } from "../../../../core/domain/recipeBuilderTypes";
import { computeDraftTotal, formatIngredientsForIngredientCard, buildRecipeId } from "../../../../core/utils/recipeBuilderUtils";
import { SvgCard } from "./SvgCard";
import { SmallCardData, IngredientsCardData, RecetteCardData } from "./photoBuilderTypes";
import { getCardColors } from "./photoBuilderColors";
import { buildPhotoSvg, buildIngredientsSvg, buildRecetteSvg } from "./photoBuilderSvg";
import { downloadSingleCard, downloadCardPack } from "./photoBuilderExport";

type CardId = "photo" | "ingredients" | "recette";

const CARD_IDS: CardId[] = ["photo", "ingredients", "recette"];
const CARD_LABELS: Record<CardId, string> = { photo: "Photo", ingredients: "Ingrédients", recette: "Recette" };
const CARD_DIMS: Record<CardId, { w: number; h: number }> = {
  photo: { w: 189, h: 208 },
  ingredients: { w: 189, h: 208 },
  recette: { w: 559, h: 397 },
};

export interface AssetsPanelProps {
  state: RecipeBuilderState;
}

export const AssetsPanel = ({ state }: AssetsPanelProps) => {
  const thumbsRowRef = useRef<HTMLDivElement>(null);
  const expandAreaRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [thumbH, setThumbH] = useState(140);
  const [thumbW, setThumbW] = useState(800);
  const [expandH, setExpandH] = useState(280);
  const [expandW, setExpandW] = useState(800);
  const [selected, setSelected] = useState<CardId | null>(null);
  const [imageBase64, setImageBase64] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const thumbEl = thumbsRowRef.current;
    const expandEl = expandAreaRef.current;
    if (!thumbEl || !expandEl) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === thumbEl) {
          setThumbH(entry.contentRect.height);
          setThumbW(entry.contentRect.width);
        } else {
          setExpandH(entry.contentRect.height);
          setExpandW(entry.contentRect.width);
        }
      }
    });
    ro.observe(thumbEl);
    ro.observe(expandEl);
    return () => ro.disconnect();
  }, []);

  const loadImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageBase64((ev.target?.result as string) ?? "");
    reader.readAsDataURL(file);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImageFile(file);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadImageFile(file);
  };

  const handlePaste = useCallback((e: React.ClipboardEvent | ClipboardEvent) => {
    const item = Array.from(e.clipboardData?.items ?? []).find(
      i => i.kind === "file" || i.type.startsWith("image/")
    );
    if (!item) return;
    const file = item.getAsFile();
    if (file) loadImageFile(file);
  }, [loadImageFile]);

  const { macros } = useMemo(() => computeDraftTotal(state.ingredients), [state.ingredients]);
  const portions = Math.max(state.defaultPortions, 1);
  const colors = useMemo(() => getCardColors(state.categoryId), [state.categoryId]);

  const smallData = useMemo<SmallCardData>(
    () => ({
      imageHref: imageBase64,
      recipeName: state.name || "Nom de la recette",
      recipeNumber: parseInt(state.recipeNumber, 10) || 0,
      fibres: Math.round(macros.fibers / portions),
      glucides: Math.round(macros.carbohydrates / portions),
      lipides: Math.round(macros.lipids / portions),
      proteines: Math.round(macros.proteins / portions),
      kcal: Math.round(macros.kcal / portions),
      colors,
    }),
    [imageBase64, state.name, state.recipeNumber, macros, portions, colors]
  );

  const ingredientLines = useMemo(() => formatIngredientsForIngredientCard(state.ingredients), [state.ingredients]);

  const ingredientsData = useMemo<IngredientsCardData>(
    () => ({
      recipeNumber: parseInt(state.recipeNumber, 10) || 0,
      portions,
      ingredientLines,
      colors,
    }),
    [state.recipeNumber, portions, ingredientLines, colors]
  );

  const recetteData = useMemo<RecetteCardData>(
    () => ({
      imageHref: imageBase64,
      recipeName: state.name || "Nom de la recette",
      recipeNumber: parseInt(state.recipeNumber, 10) || 0,
      portions,
      ingredients: ingredientLines,
      instructions: state.instructions ?? [],
      colors,
    }),
    [imageBase64, state.name, state.recipeNumber, portions, ingredientLines, state.instructions, colors]
  );

  const photoSvg = useMemo(() => buildPhotoSvg(smallData), [smallData]);
  const ingredientsSvg = useMemo(() => buildIngredientsSvg(ingredientsData), [ingredientsData]);
  const recetteSvg = useMemo(() => buildRecetteSvg(recetteData), [recetteData]);

  const baseName = buildRecipeId(state.categoryId, state.recipeNumber);

  const handleDownload = useCallback(async (id: CardId) => {
    setDownloading(true);
    try {
      const { w, h } = CARD_DIMS[id];
      const svg = id === "photo" ? photoSvg : id === "ingredients" ? ingredientsSvg : recetteSvg;
      await downloadSingleCard(svg, w, h, `${baseName}_${id}`);
    } finally {
      setDownloading(false);
    }
  }, [photoSvg, ingredientsSvg, recetteSvg, baseName]);

  const handleDownloadPack = useCallback(async () => {
    setDownloading(true);
    try {
      await downloadCardPack([
        { svg: photoSvg, w: 189, h: 208, suffix: "photo" },
        { svg: ingredientsSvg, w: 189, h: 208, suffix: "ingredients" },
        { svg: recetteSvg, w: 559, h: 397, suffix: "recette" },
      ], baseName);
    } finally {
      setDownloading(false);
    }
  }, [photoSvg, ingredientsSvg, recetteSvg, baseName]);

  const thumbCellW = (thumbW - 16) / 3;

  const thumbScale = (id: CardId) => {
    const { w, h } = CARD_DIMS[id];
    return Math.max(Math.min((thumbH - 8) / h, (thumbCellW - 8) / w), 0.05);
  };

  const expandScale = (id: CardId) => {
    const { w, h } = CARD_DIMS[id];
    return Math.max(Math.min((expandH - 16) / h, (expandW - 16) / w), 0.05);
  };

  const renderCard = (id: CardId, scale: number) => {
    const { w, h } = CARD_DIMS[id];
    const svg = id === "photo" ? photoSvg : id === "ingredients" ? ingredientsSvg : recetteSvg;
    return <SvgCard svgContent={svg} width={w} height={h} scale={scale} />;
  };

  return (
    <div
      className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden outline-none"
      tabIndex={0}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      <div className="shrink-0 flex items-center gap-2">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-wide shrink-0">Création assets</h2>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {imageBase64 ? (
          <div className="flex-1 flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-200 rounded-lg">
            <img src={imageBase64} alt="" className="w-5 h-5 object-cover rounded shrink-0" />
            <span className="flex-1 min-w-0 text-[11px] text-slate-600 truncate">Image chargée</span>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="shrink-0 text-[11px] font-bold text-slate-400 hover:text-orange-500 transition-colors"
            >
              Changer
            </button>
            <button
              type="button"
              onClick={() => setImageBase64("")}
              className="shrink-0 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="flex-1 flex items-center gap-1.5 px-2 py-0.5 border border-dashed border-slate-300 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-lg transition-colors group"
          >
            <Upload className="w-3 h-3 text-slate-400 group-hover:text-orange-500 transition-colors shrink-0" />
            <span className="text-[11px] text-slate-400 group-hover:text-orange-500 transition-colors">
              Parcourir / glisser / Ctrl+V
            </span>
            <span className="ml-auto text-[10px] text-slate-300 group-hover:text-orange-400 transition-colors shrink-0">
              max 5 Mo
            </span>
          </button>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-1.5">
        {CARD_IDS.map((id) => (
          <button
            key={id}
            type="button"
            disabled={downloading}
            onClick={() => handleDownload(id)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-200 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:text-orange-600 text-slate-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
            ) : (
              <Download className="w-3 h-3 shrink-0" />
            )}
            <span className="text-[11px] font-medium">{CARD_LABELS[id]}</span>
          </button>
        ))}
        <button
          type="button"
          disabled={downloading}
          onClick={handleDownloadPack}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {downloading ? (
            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
          ) : (
            <FolderDown className="w-3 h-3 shrink-0" />
          )}
          <span className="text-[11px] font-medium">Pack</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden relative">
        {dragging && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-orange-50/80 dark:bg-orange-900/20 rounded-xl border-2 border-orange-400 pointer-events-none">
            <p className="text-sm font-bold text-orange-500">Déposer l'image ici</p>
          </div>
        )}
        <div ref={thumbsRowRef} className="shrink-0 flex gap-2" style={{ height: "33%" }}>
          {CARD_IDS.map(id => (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(s => (s === id ? null : id))}
              className={`flex-1 flex items-center justify-center overflow-hidden rounded-xl border-2 transition-colors ${
                selected === id
                  ? "border-orange-400 bg-orange-50 dark:bg-orange-900/10"
                  : "border-slate-200 hover:border-orange-300"
              }`}
              title={CARD_LABELS[id]}
            >
              <div className="pointer-events-none">{renderCard(id, thumbScale(id))}</div>
            </button>
          ))}
        </div>

        <div ref={expandAreaRef} className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
          {selected ? (
            renderCard(selected, expandScale(selected))
          ) : (
            <p className="text-xs text-slate-400 text-center select-none">
              Clique sur une carte pour l'agrandir
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

