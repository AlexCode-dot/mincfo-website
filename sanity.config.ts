import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "@/sanity/schemas";
import { structure } from "@/sanity/studio/structure";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export default defineConfig({
  name: "mincfo-studio",
  title: "MinCFO Innehåll",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  schema: { types: schemaTypes },
});
