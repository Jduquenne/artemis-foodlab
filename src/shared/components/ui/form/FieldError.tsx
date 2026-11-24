export interface FieldErrorProps {
  message: string;
}

export const FieldError = ({ message }: FieldErrorProps) => (
  <span className="text-xs text-red-500">{message}</span>
);
