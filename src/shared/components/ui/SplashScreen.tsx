export interface SplashScreenProps {
  isExiting: boolean;
}

export const SplashScreen = ({ isExiting }: SplashScreenProps) => {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 ${isExiting ? "splash-exit" : ""}`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center overflow-hidden shadow-lg shadow-orange-200 select-none">
          <img
            src="/artemis-foodlab/assets/logo/logo-256.png"
            alt="Artemis Foodlab"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Artemis Foodlab</h1>
          <p className="text-sm text-slate-400 font-medium">Chargement en cours…</p>
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-orange-400"
              style={{ animation: `splashDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
