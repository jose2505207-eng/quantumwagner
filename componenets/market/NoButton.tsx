"use client"

import React from "react";

type ButtonProps = {
    onClick?: () => void;
}

export default function NoButton({ onClick }: ButtonProps) {
    return
    (
        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium transition-colors" onClick={onClick}>
            Bet NO
        </button>
    )
} 