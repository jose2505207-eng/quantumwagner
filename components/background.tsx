"use client";

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden">
      {/* Solid black base */}
      <div className="absolute inset-0 bg-[#000000]" />

      {/* Top gradient (subtle purple fade) */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[#1a0b2e] via-[#120822]/60 to-transparent" />

      {/* Narrow purple glow (centered at top) */}
      <div
        className="
          absolute top-0 left-1/2 -translate-x-1/2
          h-[250px] w-[800px]
          bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.35),_transparent_70%)]
          blur-[120px]
        "
      />
    </div>
  );
}
