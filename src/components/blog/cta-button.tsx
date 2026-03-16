"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

interface BlogCtaButtonProps {
  slug: string;
  label: string;
}

export function BlogCtaButton({ slug, label }: BlogCtaButtonProps) {
  return (
    <Button
      className="mt-4 bg-white text-violet-700 hover:bg-white/90"
      asChild
      onClick={() => trackEvent("blog_cta_click", { slug })}
    >
      <Link href="/signup">{label}</Link>
    </Button>
  );
}
