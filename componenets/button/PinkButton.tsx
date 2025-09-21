"use client"

import { ArrowRight } from "lucide-react"
import React from "react";

type ButtonProps = {
    onClick?: () => void;
    children?: React.ReactNode;
}

export default function PinkButton({ onClick, children }: ButtonProps) {
    return (

        <button
            onClick={onClick}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
            {children || "Click Me"}
            <ArrowRight className="w-4 h-4" />
        </button>
    )
}