"use client";

import React from "react";

type ButtonProps = {
    onClick?: () => void;
    children?: React.ReactNode;
};

export function Button({ onClick, children }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className="
        relative px-6 py-2 rounded-lg
        text-white font-semibold
        bg-black/30 backdrop-blur-sm
        border border-cyan-400/50
        shadow-[0_0_15px_rgba(0,212,255,0.4),0_0_25px_rgba(255,0,150,0.3)]
        hover:shadow-[0_0_20px_rgba(0,212,255,0.7),0_0_35px_rgba(255,0,150,0.6)]
        transition-all duration-300
        cursor-pointer
      "
        >
            {children || "Click Me"}
        </button>
    );
}
