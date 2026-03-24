"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const ENDING_RETURN_OFFSET = 280;

export default function HomeReturnScroll() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const contactReturn = searchParams.get("contactReturn");
    if (contactReturn !== "ending") {
      return;
    }

    const target = document.getElementById("kontakt");
    if (!target) {
      return;
    }

    const scrollPaddingTop = Number.parseFloat(
      window.getComputedStyle(document.documentElement).scrollPaddingTop,
    ) || 0;
    const targetY =
      target.getBoundingClientRect().top + window.scrollY - scrollPaddingTop - ENDING_RETURN_OFFSET;

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: Math.max(0, targetY),
        left: 0,
        behavior: "auto",
      });

      const url = new URL(window.location.href);
      url.searchParams.delete("contactReturn");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    });
  }, [searchParams]);

  return null;
}
