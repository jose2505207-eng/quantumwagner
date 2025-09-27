"use client"

import React from "react";

type ButtonProps = {
    onClick?: () => void;
}

export default function YesButton({ onClick }: ButtonProps) {
    return (
        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium transition-colors" onClick={onClick}>
            Bet YES
        </button>
    );
} 