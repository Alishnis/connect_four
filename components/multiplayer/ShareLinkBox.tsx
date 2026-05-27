"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  url: string;
}

export default function ShareLinkBox({ url }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-0">
      <div
        className="flex-1 px-4 py-3 font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ background: "rgba(0,0,0,0.5)", border: "2px solid #2D1B4E", borderRight: "none", color: "#00FFFF" }}
      >
        {url}
      </div>
      <motion.button
        onClick={copy}
        whileTap={{ scale: 0.95 }}
        className="px-5 py-3 font-mono text-xs uppercase tracking-widest cursor-pointer"
        style={{
          background: copied ? "#00FFFF" : "transparent",
          border: "2px solid #00FFFF",
          color: copied ? "#000" : "#00FFFF",
          transition: "all 0.15s",
          minWidth: 90,
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </motion.button>
    </div>
  );
}
