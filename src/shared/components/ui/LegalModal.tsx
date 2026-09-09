import { useState } from "react";
import { X } from "lucide-react";
import { formatDateMedium } from "../../utils/dateUtils";
import { LEGAL_DOCUMENTS, LegalDocument } from "./legalContent";

export interface LegalModalProps {
  onClose: () => void;
  initialDoc?: LegalDocument["id"];
}

export const LegalModal = ({ onClose, initialDoc = "privacy" }: LegalModalProps) => {
  const [activeId, setActiveId] = useState<LegalDocument["id"]>(initialDoc);
  const doc = LEGAL_DOCUMENTS.find((d) => d.id === activeId) ?? LEGAL_DOCUMENTS[0];

  return (
    <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-100 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-black text-slate-900">Informations légales</h2>
          <button aria-label="Fermer" onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="px-5 pt-4 shrink-0">
          <div className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-200 p-1">
            {LEGAL_DOCUMENTS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveId(d.id)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  d.id === activeId
                    ? "bg-white dark:bg-slate-100 text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-black text-slate-900">{doc.title}</h3>
            <p className="text-xs text-slate-400">Dernière mise à jour : {formatDateMedium(doc.updatedAt)}</p>
          </div>

          {doc.intro && <p className="text-sm text-slate-600 leading-relaxed">{doc.intro}</p>}

          {doc.sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-1.5">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wide">{section.heading}</h4>
              {section.body.map((paragraph, i) => (
                <p key={`${section.heading}-${i}`} className="text-sm text-slate-600 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
