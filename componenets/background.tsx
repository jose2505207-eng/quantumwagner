"use client";

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden">
      {/* Deep dark base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0f16] to-[#0a0a0f]" />

      {/* Neon orb 1 – Cyan glow */}
      <div
        className="
          absolute top-1/3 left-1/4 h-[450px] w-[450px] rounded-full
          bg-[radial-gradient(circle_at_center,_rgba(0,212,255,0.35),_transparent_70%)]
          blur-3xl
        "
      />

      {/* Neon orb 2 – Pink glow */}
      <div
        className="
          absolute bottom-1/3 right-1/4 h-[550px] w-[550px] rounded-full
          bg-[radial-gradient(circle_at_center,_rgba(255,0,150,0.25),_transparent_70%)]
          blur-3xl
        "
      />

      {/* Subtle overlay to keep contrast high */}
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}
