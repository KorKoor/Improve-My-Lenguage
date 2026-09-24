import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "soft";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[14px] font-semibold transition-[background,box-shadow,transform,color] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary shadow-[0_6px_16px_rgb(91_95_214/0.28)] hover:bg-primary-hover",
  secondary: "bg-surface text-primary border border-border hover:bg-surface-muted",
  ghost: "text-primary hover:bg-primary-soft",
  soft: "bg-primary-soft text-primary hover:brightness-95",
  danger: "bg-danger text-white hover:brightness-95",
  success: "bg-success text-white hover:brightness-95",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-[52px] px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
