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
            className="border border-gray-600 px-8 py-3 rounded-lg font-medium hover:border-gray-500 transition-colors cursor-pointer"
        >
            {children || "Click Me"}
        </button>
    );
}
