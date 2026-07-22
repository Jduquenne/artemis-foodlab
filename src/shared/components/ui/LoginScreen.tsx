import { useState } from "react";
import { login } from "../../../core/services/authService";
import { useAuthStore } from "../../store/useAuthStore";

export const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      setUser(user);
      setStatus("authenticated");
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-90 flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
          <span className="text-white font-black text-xl tracking-tight select-none">AFL</span>
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
            disabled={isSubmitting}
            className="w-full py-3 mt-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {isSubmitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
};
