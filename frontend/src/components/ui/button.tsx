"use client";

import { cn } from "@/lib/utils";
import { HTMLMotionProps, motion } from "framer-motion";
import { Loader2, LucideIcon } from "lucide-react";
import Link from "next/link";
import React, { forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline"
  | "destructive"
  | "highlight"
  | "ghost"
  | "white";

export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children?: React.ReactNode;
  fullWidth?: boolean;
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      fullWidth = false,
      href,
      onClick,
      ...props
    },
    ref
  ) => {
    const router = undefined;
    const baseStyles = "flex flex-row items-center text-nowrap w-full gap-2 capitalize justify-center cursor-pointer rounded-md font-bold transition-all duration-200 outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed font-sans";

    const variants: Record<ButtonVariant, string> = {
      primary: "bg-foreground text-background hover:opacity-90 shadow-none",
      secondary: "bg-muted text-muted-foreground hover:bg-muted/80 shadow-none",
      tertiary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "bg-transparent border border-border text-foreground hover:bg-accent hover:text-accent-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      highlight: "bg-primary text-primary-foreground hover:opacity-90 border border-primary",
      ghost: "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground shadow-none",
      white: "bg-white text-black hover:bg-zinc-100 shadow-none",
    };

    // Size styles
    const sizes: Record<ButtonSize, string> = {
      sm: "px-4 py-2 text-[10px]",
      md: "px-6 py-3 text-xs",
      lg: "px-8 py-4 text-sm",
      icon: "p-2.5 aspect-square",
      "icon-sm": "p-1.5 aspect-square",
    };

    const isButtonDisabled = disabled || isLoading;

    const content = (
      <>
        {isLoading ? (
          <Loader2 className={cn("animate-spin", size === "sm" ? "w-3 h-3" : "w-4 h-4")} />
        ) : (
          <React.Fragment>
            {LeftIcon && !isLoading && (
              <LeftIcon className={cn(size === "sm" ? "w-3 h-3" : "w-4 h-4")} />
            )}
            <span className={cn(isLoading ? "opacity-0" : "opacity-100", "flex items-center gap-2 w-fit")}>
              {children}
            </span>
            {RightIcon && !isLoading && (
              <RightIcon className={cn(size === "sm" ? "w-3 h-3" : "w-4 h-4")} />
            )}
          </React.Fragment>
        )}
      </>
    );

    const commonProps = {
      whileTap: !isButtonDisabled ? { scale: 0.98 } : undefined,
      className: cn(
        baseStyles,
        variants[variant as ButtonVariant],
        sizes[size as ButtonSize],
        fullWidth ? "w-full" : "w-fit",
        className
      ),
      ...props
    };

    if (href && !isButtonDisabled) {
      return (
        <Link href={href} className={commonProps.className}>
          <motion.span
            className="flex items-center gap-2"
            whileTap={commonProps.whileTap}
          >
            {content}
          </motion.span>
        </Link>
      );
    }

    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={isButtonDisabled}
        onClick={onClick}
        {...commonProps}
      >
        {content}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };

