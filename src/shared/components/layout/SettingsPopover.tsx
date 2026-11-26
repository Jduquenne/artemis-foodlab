import { lazy, Suspense, useState } from "react";
import { Settings, Bell, UserCircle, ScrollText, Users, Soup, RotateCcw, MessageSquareHeart } from "lucide-react";
import { useLocation } from "react-router-dom";
import { usePlanningPreferencesStore } from "../../store/usePlanningPreferencesStore";
import { ThemeToggle } from "./ThemeToggle";
import { SettingsMenuItem } from "./SettingsMenuItem";

const NotificationSettingsModal = lazy(() => import("../ui/NotificationSettingsModal").then(m => ({ default: m.NotificationSettingsModal })));
const AccountModal = lazy(() => import("../ui/AccountModal").then(m => ({ default: m.AccountModal })));
const ProfilesModal = lazy(() => import("../ui/profiles/ProfilesModal").then(m => ({ default: m.ProfilesModal })));
const AccompanimentsModal = lazy(() => import("../../../features/accompaniments/AccompanimentsModal").then(m => ({ default: m.AccompanimentsModal })));
const FeedbackSheet = lazy(() => import("../ui/FeedbackSheet").then(m => ({ default: m.FeedbackSheet })));
const LegalModal = lazy(() => import("../ui/LegalModal").then(m => ({ default: m.LegalModal })));

export const SettingsPopover = () => {
  const [open, setOpen] = useState(false);
  const [notifSettingsOpen, setNotifSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [profilesOpen, setProfilesOpen] = useState(false);
  const [accompanimentsOpen, setAccompanimentsOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const location = useLocation();
  const dessertMove = usePlanningPreferencesStore((s) => s.dessertMove);
  const setDessertMove = usePlanningPreferencesStore((s) => s.setDessertMove);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          title="Paramètres"
          className={`p-2.5 tablet:p-3 rounded-xl transition-colors ${
            open
              ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600"
              : "text-slate-400 hover:bg-muted hover:text-slate-600"
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute bottom-0 left-full ml-3 z-50 bg-surface border border-slate-200 rounded-2xl shadow-xl overflow-hidden w-52">
              <SettingsMenuItem icon={<UserCircle className="w-4 h-4 text-slate-400 shrink-0" />} label="Compte" divided={false} onClick={() => { setAccountOpen(true); setOpen(false); }} />
              <SettingsMenuItem icon={<Users className="w-4 h-4 text-slate-400 shrink-0" />} label="Profils" onClick={() => { setProfilesOpen(true); setOpen(false); }} />
              <SettingsMenuItem icon={<Soup className="w-4 h-4 text-slate-400 shrink-0" />} label="Accompagnements" onClick={() => { setAccompanimentsOpen(true); setOpen(false); }} />
              {dessertMove !== "ask" && (
                <SettingsMenuItem icon={<RotateCcw className="w-4 h-4 text-slate-400 shrink-0" />} label="Redemander pour les desserts" onClick={() => { setDessertMove("ask"); setOpen(false); }} />
              )}
              <SettingsMenuItem icon={<Bell className="w-4 h-4 text-slate-400 shrink-0" />} label="Notifications" onClick={() => { setNotifSettingsOpen(true); setOpen(false); }} />
              <SettingsMenuItem icon={<MessageSquareHeart className="w-4 h-4 text-orange-500 shrink-0" />} label="Donner mon avis" onClick={() => { setFeedbackOpen(true); setOpen(false); }} />
              <SettingsMenuItem icon={<ScrollText className="w-4 h-4 text-slate-400 shrink-0" />} label="Informations légales" onClick={() => { setLegalOpen(true); setOpen(false); }} />
              <div className="flex items-center justify-between px-4 py-1.5 border-t border-slate-100">
                <span className="text-sm text-slate-700">Thème</span>
                <ThemeToggle />
              </div>
              <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Artemis Foodlab</span>
                <span className="text-xs font-mono text-slate-400">v{__APP_VERSION__}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <Suspense>
        {notifSettingsOpen && <NotificationSettingsModal onClose={() => setNotifSettingsOpen(false)} />}

        {accountOpen && <AccountModal onClose={() => setAccountOpen(false)} />}

        {profilesOpen && <ProfilesModal onClose={() => setProfilesOpen(false)} />}

        {accompanimentsOpen && <AccompanimentsModal onClose={() => setAccompanimentsOpen(false)} />}

        {legalOpen && <LegalModal onClose={() => setLegalOpen(false)} />}

        {feedbackOpen && <FeedbackSheet screen={location.pathname} onClose={() => setFeedbackOpen(false)} />}
      </Suspense>
    </>
  );
};
