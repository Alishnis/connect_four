"use client";
import { useTheme } from "@/lib/theme";

export default function PerspectiveGrid() {
  const { theme } = useTheme();
  const lineColor = theme === "light"
    ? "rgba(120, 80, 200, 0.12)"
    : "rgba(255,0,255,0.3)";

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '60vh',
          backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          transform: 'perspective(600px) rotateX(70deg)',
          transformOrigin: 'bottom center',
          maskImage: 'linear-gradient(to top, black 20%, transparent 80%)',
          WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 80%)',
        }}
      />
    </div>
  );
}
