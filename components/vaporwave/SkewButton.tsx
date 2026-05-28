"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  href?: string;
}

export default function SkewButton({ children, variant = "primary", onClick, className = "", type = "button", disabled, href }: Props) {
  const variants = {
    primary: {
      border: "2px solid #FF00FF",
      background: "#FF00FF",
      color: "#000",
    },
    secondary: {
      border: "2px solid #00FFFF",
      background: "transparent",
      color: "#00FFFF",
    },
    outline: {
      border: "2px solid #FF00FF",
      background: "transparent",
      color: "#FF00FF",
    },
  };

  const style = variants[variant];

  const content = (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      initial={{ skewX: -10 }}
      whileHover={{ skewX: 0, boxShadow: variant === "primary" ? "0 0 30px #FF00FF" : "0 0 30px #00FFFF" }}
      transition={{ duration: 0.15, ease: "linear" }}
      className={`relative px-8 py-3 font-mono font-bold uppercase tracking-widest text-sm cursor-pointer skew-btn-${variant} ${className}`}
      style={style}
    >
      <motion.span
        initial={{ skewX: 10 }}
        whileHover={{ skewX: 0 }}
        transition={{ duration: 0.15, ease: "linear" }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </motion.button>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }
  return content;
}
