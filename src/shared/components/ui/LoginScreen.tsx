import { lazy, Suspense, useState } from "react";
import { FlaskConical } from "lucide-react";
import { login, startDemo } from "../../../core/services/authService";
import { AuthUser } from "../../../core/domain/user";
import { useAuthStore } from "../../store/useAuthStore";
import { useDelayedFlag } from "../../hooks/useDelayedFlag";
import { LOGO_URL } from "../../utils/assetUrl";

const LegalModal = lazy(() => import("./LegalModal").then((m) => ({ default: m.LegalModal })));

export const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingDemo, setIsStartingDemo] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);
  const busy = isSubmitting || isStartingDemo;
  const slowLogin = useDelayedFlag(busy, 5000);

  const authenticate = async (request: () => Promise<AuthUser>, setBusy: (value: boolean) => void) => {
    setBusy(true);
    try {
      setUser(await request());
      setStatus("authenticated");
    } catch {
      setBusy(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authenticate(() => login(email, password), setIsSubmitting);
  };

  const handleDemo = () => authenticate(startDemo, setIsStartingDemo);

  return (
    <div className="fixed inset-0 z-90 flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center overflow-hidden shadow-lg shadow-orange-200 select-none">
          <img
            src={LOGO_URL}
            alt="Artemis Foodlab"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Artemis Foodlab</h1>
          <p className="text-sm text-slate-400 font-medium">Connecte-toi pour continuer</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="email"
            required
            autoFocus
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-orange-400"
          />
          <input
            type="password"
            required
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-orange-400"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 mt-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {isSubmitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className="w-full flex items-center gap-3">
          <span className="flex-1 h-px bg-slate-200" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">ou</span>
          <span className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDemo}
            disabled={busy}
            className="w-full py-3 flex items-center justify-center gap-2 border border-orange-300 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 disabled:opacity-60 text-sm font-bold rounded-xl transition-colors"
          >
            <FlaskConical size={16} />
            {isStartingDemo ? "Préparation de la démo…" : "Essayer la démo"}
          </button>
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            Sans inscription : un compte pré-rempli rien que pour toi, effacé au bout de 2 heures.
          </p>
        </div>

        {slowLogin && (
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            Le serveur se réveille après une mise en veille. Ça peut prendre jusqu'à une minute — inutile
            de réessayer.
          </p>
        )}

        <button
          type="button"
          onClick={() => setLegalOpen(true)}
          className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
        >
          Informations légales
        </button>
      </div>

      <Suspense>
        {legalOpen && <LegalModal onClose={() => setLegalOpen(false)} />}
      </Suspense>
    </div>
  );
};
