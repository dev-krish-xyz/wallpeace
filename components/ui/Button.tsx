import Link from "next/link";

type Variant = "primary" | "secondary" | "plain" | "destructive";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-[0_0.5px_1px_rgb(0_0_0/0.2),inset_0_0.5px_0_rgb(255_255_255/0.25)] hover:brightness-110 active:brightness-95",
  secondary: "bg-surface text-label shadow-card hover:bg-fill active:bg-fill-2",
  plain: "text-accent hover:bg-fill active:bg-fill-2",
  destructive: "text-danger hover:bg-fill active:bg-fill-2",
};

const sizes = {
  // Matches the Segmented control's height and type.
  xs: "h-[26px] px-3 text-[12px] rounded-[8px]",
  sm: "h-7 px-3 text-[13px] rounded-[7px]",
  md: "h-9 px-4 text-[14px] rounded-[9px]",
  lg: "h-11 px-5 text-[15px] rounded-[11px]",
};

export function buttonClass(variant: Variant = "secondary", size: keyof typeof sizes = "md") {
  return `inline-flex select-none items-center justify-center gap-1.5 font-medium transition-[filter,background-color,opacity] duration-150 disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${sizes[size]}`;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof sizes };

export function Button({ variant, size, className = "", ...props }: ButtonProps) {
  return <button {...props} className={`${buttonClass(variant, size)} ${className}`} />;
}

export function ButtonLink({
  variant,
  size,
  className = "",
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant; size?: keyof typeof sizes }) {
  return <Link {...props} className={`${buttonClass(variant, size)} ${className}`} />;
}
