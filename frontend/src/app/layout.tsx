"use client";
import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AppProvider } from "@/context/AppContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ReduxProvider } from "@/providers/ReduxProvider";
import GlobalEscBack from "./utils/GlobalEscBack";
import ReactQueryProvider from "./ReactQueryProvider";
import GlobalDisableSignin from "./utils/GlobalDisableSignin";
import GlobalDateYearGuard from "./utils/GlobalDateYearGuard";
import ClientKeyGate from "@/components/subscription/ClientKeyGate";
import { DialogProvider } from "@/components/common/AppDialog";
import ConnectionStatus from "@/components/common/ConnectionStatus";
import ActivationGate from "@/components/subscription/ActivationGate";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        tabIndex={-1}
        className={`${outfit.className} bg-white dark:bg-gray-900`}
      >
        <ReduxProvider>
          <ReactQueryProvider>
            <ThemeProvider>
              <SidebarProvider>
                <NotificationProvider><DialogProvider>{children}</DialogProvider></NotificationProvider>
                <GlobalDisableSignin />
                <ActivationGate />
                <ClientKeyGate />
                <ConnectionStatus />
                <GlobalDateYearGuard />
              </SidebarProvider>
              <GlobalEscBack />
            </ThemeProvider>
          </ReactQueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
