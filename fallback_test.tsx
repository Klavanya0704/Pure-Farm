import React, { useState } from 'react';

export function FallbackImage({ title, className }: { title: string, className?: string }) {
  // Generate a random-ish subtle color based on title length or hash
  const colors = ["bg-emerald-50", "bg-teal-50", "bg-green-50", "bg-cyan-50", "bg-[#f4fbf7]"];
  const bgColor = colors[title.length % colors.length];

  return (
    <div className={lex flex-col items-center justify-center h-full w-full p-4 text-center select-none  border-b border-black/5 }>
      <div className="w-12 h-12 rounded-full bg-white/60 shadow-sm flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-emerald-700/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-emerald-900/80 line-clamp-2 leading-tight">
        {title}
      </p>
    </div>
  );
}
