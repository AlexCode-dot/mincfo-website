"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./TextType.module.scss";

type TextTypeProps = {
  text: string;
  className?: string;
  typingSpeed?: number;
  initialDelay?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  cursorClassName?: string;
};

export default function TextType({
  text,
  className = "",
  typingSpeed = 26,
  initialDelay = 0,
  showCursor = true,
  cursorCharacter = "|",
  cursorClassName = "",
}: TextTypeProps) {
  const [displayedText, setDisplayedText] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (displayedText === text) return;

    timeoutRef.current = setTimeout(() => {
      setDisplayedText(text.slice(0, displayedText.length + 1));
    }, displayedText.length === 0 ? initialDelay : typingSpeed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayedText, initialDelay, text, typingSpeed]);

  return (
    <span className={`${styles.textType} ${className}`.trim()}>
      <span className={styles.content}>{displayedText}</span>
      {showCursor ? (
        <span
          className={`${styles.cursor} ${displayedText === text ? styles.cursorDone : ""} ${cursorClassName}`.trim()}
          aria-hidden="true"
        >
          {cursorCharacter}
        </span>
      ) : null}
    </span>
  );
}
