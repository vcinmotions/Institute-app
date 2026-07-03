"use client";

import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen w-full bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="flex min-h-screen w-full flex-col lg:flex-row">
          
          {/* LEFT PANEL: Dynamic Form Injector Area (e.g., SignInForm) */}
          <div className="flex w-full flex-1 flex-col justify-center px-6 py-12 lg:w-full sm:px-12 xl:px-24 bg-white dark:bg-gray-900">
            {children}
          </div>

          {/* RIGHT PANEL: Rich Visual ERP System Showcase Side Panel */}
          <div className="relative hidden w-1/2 flex-col items-center justify-center bg-gray-950 lg:flex overflow-hidden border-l border-gray-200 dark:border-gray-800">
            
            {/* Abstract Background Design Assets & Matrix Lines */}
            <div className="absolute inset-0 z-0 bg-gradient-to-tr from-brand-950 via-gray-950 to-slate-900 opacity-95" />
            <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
            
            {/* Interactive Component Grid Overlay Decoration */}
            <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Content Container Area */}
            <div className="relative z-10 w-full max-w-lg px-8 text-center xl:px-12">
              
              {/* Common Decorative Layout Shapes */}
              <div className="absolute inset-0 pointer-events-none scale-110 opacity-40">
                <GridShape />
              </div>

              {/* Central System Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium tracking-wide text-gray-300 uppercase">
                  Institute ERP System v4.0
                </span>
              </div>

              {/* Brand Title Pitch Header */}
              <h2 className="mt-8 text-3xl font-extrabold tracking-tight text-white xl:text-4xl leading-tight">
                Simplify Campus Management with <span className="text-brand-400">vcinmotions</span>
              </h2>
              
              <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
                Automate academic grading workflows, coordinate multitenant department structures, manage multi-year finance ledgers, and secure student analytics natively inside an integrated administrative console.
              </p>

              {/* Graphic Feature Summary Cards */}
              {/* <div className="mt-10 grid grid-cols-2 gap-4 text-left">
                <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm hover:bg-white/10 transition duration-200">
                  <div className="text-lg">📊</div>
                  <h4 className="mt-2 text-sm font-semibold text-white">Advanced Analytics</h4>
                  <p className="mt-1 text-xs text-gray-400 leading-normal">Real-time student metrics and performance matrix tracking.</p>
                </div>
                
                <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm hover:bg-white/10 transition duration-200">
                  <div className="text-lg">🛡️</div>
                  <h4 className="mt-2 text-sm font-semibold text-white">Role-Based RBAC</h4>
                  <p className="mt-1 text-xs text-gray-400 leading-normal">Strict cryptographically partitioned dashboard access profiles.</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm hover:bg-white/10 transition duration-200">
                  <div className="text-lg">💼</div>
                  <h4 className="mt-2 text-sm font-semibold text-white">Automated Ledgers</h4>
                  <p className="mt-1 text-xs text-gray-400 leading-normal">Configurable single-click standard financial statement auditing.</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm hover:bg-white/10 transition duration-200">
                  <div className="text-lg">⚡</div>
                  <h4 className="mt-2 text-sm font-semibold text-white">Instant Sync</h4>
                  <p className="mt-1 text-xs text-gray-400 leading-normal">Direct notifications and centralized institutional data distribution.</p>
                </div>
              </div> */}

              {/* System Compliance Label */}
              <div className="mt-12 text-xs text-gray-500">
                &copy; 2026 vcinmotions Inc. All institutional data processing remains encrypted under standard compliance mandates.
              </div>

            </div>
          </div>

        </div>

        {/* Global Floating Configuration Controls */}
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </ThemeProvider>
  );
}