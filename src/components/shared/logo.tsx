import { Link } from "@/i18n/navigation";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="gradient-bg flex h-8 w-8 items-center justify-center rounded-lg">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="6 3 20 12 6 21 6 3" />
        </svg>
      </div>
      <span className="text-lg font-semibold tracking-tight">WowTok</span>
    </Link>
  );
}
