"use client";
import React from "react";

interface PhoneInputProps {
  placeholder?: string;
  value?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement> | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tabIndex?: number;
}

const PhoneNumberInput: React.FC<PhoneInputProps> = ({
  placeholder = "+1 (555) 000-0000",
  value,
  onChange,
  tabIndex,
  onKeyDown,
}) => {
  return (
    <div className="relative flex">
      {/* Input field */}
      <input
        type="tel"
        value={value}
        onKeyDown={onKeyDown || undefined} 
        onChange={onChange}
        placeholder={placeholder}
        tabIndex={tabIndex} 
        className="dark:bg-dark-900 h-11 w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
      />
    </div>
  );
};

export default PhoneNumberInput;