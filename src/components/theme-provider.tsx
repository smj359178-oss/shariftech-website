"use client";

// ===========================================================================
// ThemeProvider — مدیریت تم روشن/تیره با next-themes
// ذخیره در localStorage + رعایت ترجیح سیستم در اولین بازدید
// ===========================================================================
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="shariftech-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
