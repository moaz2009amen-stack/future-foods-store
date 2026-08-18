"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function SearchTracker({ query }: { query: string }) {
  useEffect(() => {
    if (query.trim()) trackEvent("Search", { search_string: query });
  }, [query]);

  return null;
}
