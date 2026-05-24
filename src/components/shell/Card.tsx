import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export default function Card({ children, title, className }: CardProps) {
  return (
    <div className={cn("aura-card", className)}>
      {title && <p className="aura-label mb-3">{title}</p>}
      {children}
    </div>
  );
}
