"use client";

import { useEffect } from "react";
import { set, useFormValue, type SlugInputProps } from "sanity";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/å|ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

/**
 * Auto-genererar slug från `title` så fort titeln finns och slug är tom.
 * Skriver inte över ett befintligt värde — då skulle publicerade URL:er
 * brytas om någon redigerar titeln efter publicering. Renderar Sanitys
 * default slug-input så att editorn kan se och justera URL:en manuellt.
 */
export function AutoSlugInput(props: SlugInputProps) {
  const title = useFormValue(["title"]) as string | undefined;
  const currentSlug = props.value?.current;
  const { onChange } = props;

  useEffect(() => {
    if (!title) return;
    if (currentSlug) return;
    const next = slugify(title);
    if (!next) return;
    onChange(set({ _type: "slug", current: next }));
  }, [title, currentSlug, onChange]);

  return props.renderDefault(props);
}
