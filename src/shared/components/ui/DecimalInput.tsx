import { ComponentProps, useState } from "react";
import { parseDecimal } from "../../utils/numberUtils";

export interface DecimalInputProps
  extends Omit<ComponentProps<"input">, "value" | "onChange" | "type" | "inputMode" | "min"> {
  value: number | null;
  onValueChange: (value: number | null) => void;
  min?: number;
  integer?: boolean;
}

export const DecimalInput = ({
  value,
  onValueChange,
  min = 0,
  integer = false,
  onBlur,
  ...rest
}: DecimalInputProps) => {
  const [draft, setDraft] = useState<string | null>(null);

  const handleChange = (raw: string) => {
    setDraft(raw);
    if (raw.trim() === "") {
      onValueChange(null);
      return;
    }
    const parsed = parseDecimal(raw);
    if (parsed === null || parsed < min) return;
    if (integer && !Number.isInteger(parsed)) return;
    onValueChange(parsed);
  };

  return (
    <input
      {...rest}
      type="text"
      inputMode={integer ? "numeric" : "decimal"}
      value={draft ?? (value === null ? "" : String(value))}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={(e) => {
        setDraft(null);
        onBlur?.(e);
      }}
    />
  );
};
