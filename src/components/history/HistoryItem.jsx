import React from "react";
import { Link } from "react-router-dom";

export default function HistoryItem({
  icon,
  iconColor,
  title,
  subtitle,
  time,
  id,
}) {
  return (
    <Link to={`/chat/${id}`} className="block">
      <article className="group flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#1b162b] p-4 transition hover:border-violet-400/20 hover:bg-white/5 sm:p-5">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-3xl ${iconColor} text-white shadow-[0_16px_40px_-24px_rgba(124,58,237,0.85)]`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white">
              {title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>
          </div>
        </div>
        <time className="shrink-0 text-xs uppercase tracking-[0.24em] text-slate-500">
          {time}
        </time>
      </article>
    </Link>
  );
}
