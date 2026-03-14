import { Send, Download } from "lucide-react";

export interface RoleSelectProps {
    onSend: () => void;
    onReceive: () => void;
}

export const RoleSelect = ({ onSend, onReceive }: RoleSelectProps) => (
    <div className="flex flex-col gap-3">
        <p className="text-slate-500 text-sm text-center">
            Choisis le rôle de cet appareil. La synchronisation remplacera les données de l'appareil qui reçoit.
        </p>
        <button
            onClick={onSend}
            className="flex items-center gap-3 w-full p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-colors text-left"
        >
            <Send size={20} className="shrink-0" />
            <div>
                <p className="font-black">Envoyer</p>
                <p className="text-xs font-normal opacity-80">Cet appareil envoie ses données vers l'autre</p>
            </div>
        </button>
        <button
            onClick={onReceive}
            className="flex items-center gap-3 w-full p-4 bg-slate-100 dark:bg-slate-200 hover:bg-slate-200 dark:hover:bg-slate-300 text-slate-700 rounded-2xl font-bold transition-colors text-left"
        >
            <Download size={20} className="shrink-0" />
            <div>
                <p className="font-black">Recevoir</p>
                <p className="text-xs font-normal text-slate-500">Cet appareil reçoit les données de l'autre</p>
            </div>
        </button>
    </div>
);
