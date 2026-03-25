"use client";

import Link, { type LinkProps } from "next/link";
import { type MouseEvent, type ReactNode } from "react";
import { saveContactReturnLocation } from "./contactReturn";

type ContactLinkProps = LinkProps & {
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  returnPath: string;
  returnSectionId?: string;
};

export default function ContactLink({
  className,
  children,
  onClick,
  returnPath,
  returnSectionId,
  ...props
}: ContactLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    saveContactReturnLocation({
      path: returnPath,
      sectionId: returnSectionId,
    });
  };

  return (
    <Link {...props} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
