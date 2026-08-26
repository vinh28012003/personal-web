"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Light is the committed default — it is the better ground for a recruiter
 * skim on an unknown display. Dark is available via the toggle.
 *
 * enableSystem is off, and that is what makes the sentence above true. With
 * it on, a visitor whose OS prefers dark was served dark on arrival no
 * matter what defaultTheme said. Nothing is lost by turning it off: the
 * toggle only ever sets "light" or "dark" and can never return to "system",
 * so the setting decided the first paint and nothing else.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
