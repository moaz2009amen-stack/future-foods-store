import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { HomeSection } from "@/types";

export default function HomeSectionCard({ section }: { section: HomeSection }) {
  const href = section.section_type === "categories" ? "/categories" : `/section/${section.id}`;

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-border block h-40 sm:h-48 md:h-56"
    >
      {section.image_url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={section.image_url}
            alt={section.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 hero-gradient" />
      )}

      <div className={`absolute inset-0 p-5 flex flex-col justify-end ${section.image_url ? "text-white" : "text-text"}`}>
        <h3 className="text-lg sm:text-xl font-extrabold">{section.title}</h3>
        {section.description && (
          <p className={`text-xs sm:text-sm mt-1 line-clamp-1 ${section.image_url ? "text-white/85" : "text-muted"}`}>
            {section.description}
          </p>
        )}
        <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold mt-3 text-accent">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          تصفح دلوقتي
        </span>
      </div>
    </Link>
  );
}
