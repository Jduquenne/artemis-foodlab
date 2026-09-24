import { Check } from "lucide-react";
import { PROFILE_COLORS } from "../../../../core/domain/profileConfig";

export interface ProfileColorPickerProps {
  value: string;
  onChange: (colorId: string) => void;
  disabled?: boolean;
}

export const ProfileColorPicker = ({ value, onChange, disabled = false }: ProfileColorPickerProps) => (
  <div className="flex flex-wrap items-center gap-2">
    {PROFILE_COLORS.map((c) => (
      <button
        key={c.id}
        type="button"
        onClick={() => onChange(c.id)}
        disabled={disabled}
        aria-label={c.id}
        aria-pressed={value === c.id}
        className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 disabled:opacity-50"
        style={{ backgroundColor: c.hex }}
      >
        {value === c.id && <Check className="w-3.5 h-3.5 text-white" />}
      </button>
    ))}
  </div>
);
