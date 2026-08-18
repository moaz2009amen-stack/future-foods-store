"use client";

import { Star } from "lucide-react";

export default function RatingStars({
  value,
  onChange,
  size = "w-5 h-5",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: string;
}) {
  const interactive = !!onChange;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} نجوم`}
        >
          <Star
            className={`${size} ${n <= value ? "fill-warning text-warning" : "text-border"}`}
          />
        </button>
      ))}
    </div>
  );
}
