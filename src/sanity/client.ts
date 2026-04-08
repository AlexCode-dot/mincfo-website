import { createClient, type SanityClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "./env";

export const sanityClient: SanityClient | null =
  projectId
    ? createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: false,
      })
    : null;
