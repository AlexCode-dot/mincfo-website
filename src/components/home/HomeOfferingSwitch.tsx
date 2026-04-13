"use client";

import { useHomeOffering } from "./HomeOfferingProvider";
import styles from "./HomeOfferingSwitch.module.scss";

type HomeOfferingSwitchProps = {
  className?: string;
  compact?: boolean;
  variant?: "pill" | "inline" | "drawer";
  onSelect?: () => void;
};

export default function HomeOfferingSwitch({
  className = "",
  compact = false,
  variant = "pill",
  onSelect,
}: HomeOfferingSwitchProps) {
  const { offering, options, setOffering, shared } = useHomeOffering();

  if (options.length < 2) {
    return null;
  }

  return (
    <div
      className={`${styles.switch} ${compact ? styles.compact : ""} ${
        variant === "inline" ? styles.inline : ""
      } ${variant === "drawer" ? styles.drawer : ""} ${className}`.trim()}
      aria-label={shared.offering.ariaLabel}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={offering === option.id}
          className={`${styles.option} ${offering === option.id ? styles.optionActive : ""}`}
          onClick={() => {
            setOffering(option.id);
            window.scrollTo({ top: 0, behavior: "smooth" });
            onSelect?.();
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
