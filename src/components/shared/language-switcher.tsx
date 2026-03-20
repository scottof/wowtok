"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useTransition, useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  locales,
  localeNames,
  type Locale,
} from "@/i18n/config";
import { ChevronDown } from "lucide-react";

interface LanguageSwitcherProps {
  direction?: "up" | "down";
}

export function LanguageSwitcher({ direction = "up" }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const sortedLocales = [...locales].sort((a, b) =>
    localeNames[a].localeCompare(localeNames[b], undefined, {
      sensitivity: "base",
    })
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(newLocale: Locale) {
    setOpen(false);
    startTransition(() => {
      const query = searchParams.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      router.replace(href, { locale: newLocale });
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        disabled={isPending}
      >
        <span>{localeNames[locale]}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className={`absolute right-0 z-50 min-w-[160px] rounded-lg border border-border/60 bg-background p-1 shadow-lg ${direction === "down" ? "top-full mt-1" : "bottom-full mb-1"}`}>
          {sortedLocales.map((l) => (
            <button
              key={l}
              onClick={() => handleSelect(l)}
              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${
                l === locale
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <span>{localeNames[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
