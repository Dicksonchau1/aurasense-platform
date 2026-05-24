import { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Field({ label, id, ...rest }: FieldProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="w-full">
      <label htmlFor={inputId} className="aura-label">{label}</label>
      <input id={inputId} className="aura-field" {...rest} />
    </div>
  );
}
