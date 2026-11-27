"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useLoginUser, useSelectCompany, CompanyPrompt } from "@/hooks/useLoginUser";
import Select from "@/components/form/Select";
import { useBranding } from "@/hooks/useBranding";

export default function SignInForm() {
  const branding = useBranding();
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState(""); // Can be email or username
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [prompt, setPrompt] = useState<CompanyPrompt | null>(null);
  const [companyId, setCompanyId] = useState("");
  const { mutate, error, isPending } = useLoginUser({ onNeedsCompany: setPrompt });
  const pick = useSelectCompany();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Safely check for token on client mount
  useEffect(() => {
    // The app stores its session token in sessionStorage (see authSlice);
    // checking localStorage here caused a "/" <-> "/signin" redirect loop.
    const token = sessionStorage.getItem("token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  // Autofocus first input on mount
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // The desktop EXE (its preload exposes window.electronAPI) has no password reset,
  // so the "Forgot password?" link shows only in a plain browser. null = not checked yet.
  const [inExe, setInExe] = useState<boolean | null>(null);
  useEffect(() => {
    setInExe(!!window.electronAPI);
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
      const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/.test(trimmed);
      if (!isValidEmail) {
        setInputError(true);
        setErrorMessage("Enter your username (for staff: name@code, e.g. rahul@2026) or a valid email.");
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
          const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/.test(value.trim());
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

  // Step 2: a user with several companies picks the one to work in.
  if (prompt) {
    const err = (pick.error as Error | null)?.message;
    return (
      <div className="flex w-full flex-1 flex-col lg:w-full">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <h1 className="mb-2 text-2xl font-semibold text-gray-800 sm:text-3xl dark:text-white/90">Select company</h1>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            You have access to more than one company. Choose the one you want to work in.
          </p>
          {err && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-500 dark:bg-red-950/30 dark:text-red-400">{err}</div>
          )}
          <Label>Company <span className="text-red-500">*</span></Label>
          <Select
            searchable
            options={prompt.companies.map((c) => ({ label: c.name, value: c.id }))}
            placeholder="Select company"
            value={companyId}
            onChange={setCompanyId}
          />
          <div className="mt-6 flex gap-3">
            <Button
              className="w-full disabled:cursor-not-allowed disabled:opacity-60"
              size="sm"
              disabled={!companyId || pick.isPending}
              onClick={() =>
                pick.mutate({ email: prompt.email, selectionToken: prompt.selectionToken, companyId })
              }
            >
              {pick.isPending ? "Opening..." : "Continue"}
            </Button>
            <button
              type="button"
              onClick={() => { setPrompt(null); setCompanyId(""); setPassword(""); pick.reset(); }}
              className="rounded-lg px-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            {(branding.logoSrc || branding.instituteName) && (
              <div className="mb-4 flex items-center gap-3">
                {branding.logoSrc && <img src={branding.logoSrc} alt="" className="h-12 w-auto max-w-[160px] object-contain" />}
                {branding.instituteName && <span className="text-lg font-semibold text-gray-700 dark:text-white/80">{branding.instituteName}</span>}
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
                  {inExe === false && (
                    <Link
                      href="/reset-password"
                      className="text-brand-500 hover:text-brand-600 dark:text-brand-400 text-sm font-medium"
                    >
                      Forgot password?
                    </Link>
                  )}
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