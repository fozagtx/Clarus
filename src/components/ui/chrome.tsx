import { cn } from "@/lib/cn";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "font-mono text-sm tracking-[0.5px] text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Pill({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "h-8 rounded-2xl px-3 text-sm font-semibold tracking-[-0.5px] transition-colors hover:opacity-90 disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function MockupShell({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--mockup-shell-radius)] border border-border bg-[color-mix(in_srgb,var(--card)_72%,transparent)] shadow-[inset_0_1px_0_rgba(251,251,249,0.08)] backdrop-blur-2xl",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border px-3 py-2">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff6568]" />
          <span className="size-2.5 rounded-full bg-[#e8c07a]" />
          <span className="size-2.5 rounded-full bg-[#c8d4a1]" />
        </div>
        <p className="font-mono text-[11px] tracking-[0.4px] text-muted-foreground">{title}</p>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

export function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "pass" | "fail" | "brand";
}) {
  const color =
    tone === "pass" ? "text-pass" : tone === "fail" ? "text-destructive" : tone === "brand" ? "text-brand-light" : "text-foreground";
  return (
    <div className="bg-card p-4">
      <dt className="font-mono text-[11px] font-medium tracking-[0.5px] text-muted-foreground">{label}</dt>
      <dd className={cn("mt-2 text-2xl font-semibold tracking-[-0.5px]", color)}>{value}</dd>
    </div>
  );
}
