"use client";

import { useRouter } from "next/navigation";

export default function BackLink({
  href = "/",
  label = "Tillbaka",
}: {
  href?: string;
  label?: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(href);
  };

  return (
    <button type="button" className="bl-back" onClick={handleBack}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.5 3L4.5 7l4 4"
        />
      </svg>
      {label}
    </button>
  );
}
