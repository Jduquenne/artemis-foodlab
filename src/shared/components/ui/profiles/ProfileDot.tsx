import { getProfileColorHex } from "../../../../core/logic/profile/profileLogic";

export interface ProfileDotProps {
  color: string;
  className?: string;
}

export const ProfileDot = ({ color, className = "w-2.5 h-2.5" }: ProfileDotProps) => (
  <span
    className={`inline-block rounded-full shrink-0 ${className}`}
    style={{ backgroundColor: getProfileColorHex(color) }}
  />
);
