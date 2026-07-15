import { cn } from "@/lib/utils";

/**
 * Emblema de marca. Recrea el espíritu del logo (medallón circular, tipografía
 * cálida, guiño gastronómico) sin copiar el original pixel a pixel.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-10 w-10", className)}
      role="img"
      aria-label="El Gusto de mi Pueblo"
    >
      <circle cx="32" cy="32" r="30" fill="var(--cocoa)" />
      <circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        stroke="var(--caramel-soft)"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      {/* gorro */}
      <path
        d="M22 30c-3 0-5-2-5-5s2-5 5-5c0-3 3-6 10-6s10 3 10 6c3 0 5 2 5 5s-2 5-5 5z"
        fill="var(--cream)"
      />
      <rect x="22" y="30" width="20" height="4" rx="1" fill="var(--caramel-soft)" />
      {/* bigote */}
      <path
        d="M24 40c2-2 5-1 8 1 3-2 6-3 8-1-2 3-5 3-8 1-3 2-6 2-8-1z"
        fill="var(--cream)"
      />
    </svg>
  );
}

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-9" />
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[0.95rem] font-semibold tracking-tight text-cocoa">
            El Gusto de mi Pueblo
          </span>
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-caramel-deep">
            Postres artesanales
          </span>
        </span>
      )}
    </span>
  );
}
