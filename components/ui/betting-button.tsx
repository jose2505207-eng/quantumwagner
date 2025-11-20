import React from "react";
import { cn } from "@/lib/utils";

interface BettingButtonProps {
  children: React.ReactNode;
  variant: "yes" | "no";
  size?: "sm" | "lg";
  className?: string;
  onClick?: () => void;
}

const BettingButton = ({
  children,
  variant,
  size = "lg",
  className,
  onClick,
}: BettingButtonProps) => {
  const baseClasses =
    "relative font-semibold transition-all duration-300 ease-out rounded-lg overflow-hidden group";

  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    lg: "px-6 py-3 text-sm",
  };

  const variantClasses = {
    yes: "text-white hover:text-white",
    no: "text-white hover:text-white",
  };

  const gradientClasses = {
    yes: "before:bg-gradient-to-b before:from-neutral-700/80 before:to-neutral-950",
    no: "before:bg-gradient-to-b before:from-neutral-700/80 before:to-neutral-950",
  };

  const afterClasses = {
    yes: "after:bg-[#10B981] hover:after:bg-[#059669]",
    no: "after:bg-[#EF4444] hover:after:bg-[#DC2626]",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        // Border gradient effect
        "before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-lg before:content-['']",
        gradientClasses[variant],
        // Button background
        "after:absolute after:inset-[1px] after:-z-10 after:rounded-[6px] after:transition-all after:duration-300 after:content-['']",
        afterClasses[variant],
        // Hover effects
        "hover:scale-[1.02] hover:shadow-lg",
        variant === "yes"
          ? "hover:shadow-[#10B981]/25"
          : "hover:shadow-[#EF4444]/25",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default BettingButton;
