import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

const baseClasses =
  "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition";

const variantClasses = {
  primary: "bg-white text-slate-950 hover:bg-slate-200",
  ghost: "border border-slate-700 text-slate-100 hover:border-slate-500"
};

type ButtonProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: keyof typeof variantClasses;
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <Link
      className={`${baseClasses} ${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
