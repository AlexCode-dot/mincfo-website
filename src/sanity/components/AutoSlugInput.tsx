"use client";

import { useEffect } from "react";
import { set, useFormValue, type FieldProps, type SlugInputProps } from "sanity";

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
 * brytas om någon redigerar titeln efter publicering.
 *
 * Renderas som null — chefen ska aldrig se eller röra detta fält. Effekten
 * körs ändå när komponenten mountas, så att slug fylls i innan publicering.
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

  return null;
}

/**
 * Döljer hela slug-fältets layout (label, beskrivning, validation-ikon)
 * men renderar fortfarande input-komponenten ovan, så att auto-genereringen
 * kör när dokumentet öppnas.
 */
export function HiddenSlugField(props: FieldProps) {
  return <div style={{ display: "none" }}>{props.children}</div>;
}
