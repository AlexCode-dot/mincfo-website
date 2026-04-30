import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url";
import { urlForImage } from "@/sanity/lib/imageUrl";
import styles from "./page.module.scss";

type ImageValue = SanityImageSource & { alt?: string; caption?: string };

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className={styles.bodyP}>{children}</p>,
    h2: ({ children }) => <h2 className={styles.bodyH2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.bodyH3}>{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className={styles.bodyQuote}>{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className={styles.bodyList}>{children}</ul>,
    number: ({ children }) => <ol className={styles.bodyListNum}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code className={styles.bodyCode}>{children}</code>,
    link: ({ value, children }) => {
      const href = (value?.href as string) ?? "#";
      const external = /^https?:\/\//i.test(href);
      return (
        <a
          href={href}
          className={styles.bodyLink}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: { value: ImageValue }) => {
      const builder = urlForImage(value);
      if (!builder) return null;
      const src = builder.width(1400).fit("max").auto("format").url();
      return (
        <figure className={styles.bodyFigure}>
          <Image
            src={src}
            alt={value.alt ?? ""}
            width={1400}
            height={900}
            sizes="(min-width: 800px) 760px, 100vw"
            className={styles.bodyImage}
          />
          {value.caption && <figcaption>{value.caption}</figcaption>}
        </figure>
      );
    },
  },
};

export default function PostBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
