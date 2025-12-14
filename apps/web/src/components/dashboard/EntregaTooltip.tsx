'use client';
import { useState } from 'react';

export function Hint({ text, children }: { text: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <span className="absolute z-20 left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs bg-black text-white rounded">
          {text}
        </span>
      )}
    </span>
  );
}