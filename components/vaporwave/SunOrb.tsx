"use client";
import { useTheme } from "@/lib/theme";

export default function SunOrb() {
  const { theme } = useTheme();

  if (theme === "light") {
    // Subtle warm glow in light mode
    return (
      <div className="fixed inset-0 pointer-events-none z-0 flex items-start justify-center">
        <div
          className="absolute"
          style={{
            top: '5%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(120, 80, 200, 0.08) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 flex items-start justify-center">
      {/* Sun orb */}
      <div
        className="absolute"
        style={{
          top: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, #FF9900 0%, #FF00FF 40%, transparent 70%)',
          filter: 'blur(80px)',
          opacity: 0.15,
        }}
      />
      {/* Horizontal stripe overlay on sun */}
      <div
        className="absolute"
        style={{
          top: '5%',
          width: '500px',
          height: '500px',
          background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 10px, #090014 10px, #090014 12px)',
          opacity: 0.6,
        }}
      />
    </div>
  );
}
