import { LOGO_URL } from "../../utils/assetUrl";

export const SidebarLogo = () => {
  return (
    <div className="w-9 h-9 tablet:w-12 tablet:h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden select-none">
      <img
        src={LOGO_URL}
        alt="Artemis Foodlab"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
};
