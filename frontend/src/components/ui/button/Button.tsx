import { RootState } from "@/store";
import React, { ReactNode } from "react";
import { useSelector } from "react-redux";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline" | "destructive" | "nobg"; // 👈 add 'destructive'; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Disabled state
  tabIndex?: number;
  onKeyDown?: any | null;

  allowedRoles?: string[]; // 👈 NEW
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  onKeyDown,
  className = "",
  disabled = false,
  tabIndex,
  allowedRoles,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);

  // 🔐 Hide button if user role is not allowed
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }
  // Size Classes
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-sm",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-brand-500 text-gray-800 dark:text-white hover:text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
    destructive: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300", // ✅ Add this
    nobg: "", // ✅ Add this
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
      tabIndex={tabIndex}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
