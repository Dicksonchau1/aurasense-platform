import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost";
}

export default function Button({ children, variant = "primary", className, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        "aura-btn",
        variant === "ghost" && "aura-btn-ghost",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
