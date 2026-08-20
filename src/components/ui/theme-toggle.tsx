"use client";

import { useTheme } from "next-themes";
import { useIsMounted } from "@/lib/use-client-value";
import { SunIcon, MoonIcon } from "@/components/icons";

/**
 * Light/dark switch. Renders a fixed-size placeholder until mounted so the
 * header never changes width on hydration — a swap here would be a visible
 * layout shift right next to the primary CTA.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      // 44x44 minimum touch target.
      className="grid h-11 w-11 shrink-0 place-items-center border-2 border-rule text-lg transition-none hover:bg-on-ground hover:text-ground active:translate-x-[2px] active:translate-y-[2px]"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        mounted
          ? `Switch to ${isDark ? "light" : "dark"} theme`
          : "Switch colour theme"
      }
    >
      {mounted ? isDark ? <SunIcon /> : <MoonIcon /> : <span className="block h-[1em] w-[1em]" />}
    </button>
  );
}
