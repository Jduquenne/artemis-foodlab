import { useMenuStore } from "../../../shared/store/useMenuStore";

export const WeekTransitionModal = () => {
  const { isTransitionPopupOpen, setTransitionPopup } = useMenuStore();

  if (!isTransitionPopupOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
        <h2 className="text-2xl font-black mb-4">Nouvelle semaine !</h2>
        <p className="text-slate-600 mb-6">Voulez-vous réinitialiser le menu pour attaquer cette nouvelle semaine du bon pied ?</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setTransitionPopup(false)}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200"
          >
            Nouveau menu
          </button>
          <button
            onClick={() => setTransitionPopup(false)}
            className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold"
          >
            Garder l'actuel
          </button>
        </div>
      </div>
    </div>
  )
};
