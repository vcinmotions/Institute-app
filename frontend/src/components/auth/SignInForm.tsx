"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useLoginUser } from "@/hooks/useLoginUser";

export default function SignInForm() {
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState(""); // Can be email or username
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate, error, isPending } = useLoginUser();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Safely check for token on client mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  // Autofocus first input on mount
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Handle Input Validation (Supports both Username and Email styles)
  const validateInput = (value: string) => {
    const trimmed = value.trim();
    
    if (!trimmed) {
      setInputError(true);
      setErrorMessage("Username or Email is required.");
      return false;
    }

    // If it looks like an email address (contains '@'), validate the structure
    if (trimmed.includes("@")) {
      const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed);
      if (!isValidEmail) {
        setInputError(true);
        setErrorMessage("Please enter a valid email address.");
        return false;
      }
    }

    setInputError(false);
    setErrorMessage("");
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdentifier(value);
    
    if (inputError) {
      // Clear or adjust validation state dynamically as they type
      if (value.trim()) {
        if (value.includes("@")) {
          const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim());
          if (isValidEmail) setInputError(false);
        } else {
          setInputError(false);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput(identifier)) {
      return;
    }

    // Passes clean, lowered data value down to your backend mutation process
    mutate({ email: identifier.trim().toLowerCase(), password });
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:w-full">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="w-full">
          <div className="mb-5 sm:mb-8">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-500 dark:bg-red-950/30 dark:text-red-400">
                {typeof error === "string"
                  ? error
                  : error instanceof Error
                    ? error.message
                    : ((error as any)?.error ?? "Something went wrong.")}
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl mb-2 font-semibold text-gray-800 dark:text-white/90">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your account details below to access your dashboard.
            </p>
          </div>

          <div>
            {/* Form Fields Container */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label>Username or Email <span className="text-red-500">*</span></Label>
                  <Input
                    ref={firstInputRef}
                    type="text"
                    value={identifier}
                    onChange={handleInputChange}
                    onBlur={(e) => validateInput(e.target.value)}
                    placeholder="username or info@gmail.com"
                    className={inputError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {inputError && (
                    <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
                  )}
                </div>

                <div>
                  <Label>
                    Password <span className="text-red-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-4 z-20 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeIcon className="h-5 w-5 fill-current" />
                      ) : (
                        <EyeCloseIcon className="h-5 w-5 fill-current" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="text-sm font-normal text-gray-700 dark:text-gray-400 select-none">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400 text-sm font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full disabled:opacity-60 disabled:cursor-not-allowed" 
                    size="sm"
                    disabled={isPending}
                  >
                    {isPending ? "Signing In..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

            {/* <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="text-center text-sm font-normal text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-brand-500 font-medium hover:text-brand-600 dark:text-brand-400 transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}