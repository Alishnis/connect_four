import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  accentColor?: "cyan" | "magenta";
}

export default function GlowCard({ children, className = "", accentColor = "cyan" }: Props) {
  const borderColor = accentColor === "cyan" ? "#00FFFF" : "#FF00FF";
  return (
    <div
      className={`backdrop-blur-md p-6 ${className}`}
      style={{
        background: "rgba(26, 16, 60, 0.8)",
        border: `1px solid ${borderColor}33`,
        borderTop: `2px solid ${borderColor}`,
      }}
    >
      {children}
    </div>
  );
}
