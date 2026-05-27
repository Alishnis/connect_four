"use client";
export default function CRTOverlay() {
  return (
    <>
      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
        }}
      />
      {/* RGB chromatic aberration */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-30"
        style={{
          background: 'linear-gradient(90deg, rgba(255,0,0,0.03), rgba(0,255,0,0.01), rgba(0,0,255,0.03))',
        }}
      />
      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(9,0,20,0.8) 100%)',
        }}
      />
    </>
  );
}
