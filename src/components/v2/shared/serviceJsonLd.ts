const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://mincfo.com";

export function serviceJsonLd(input: {
  name: string;
  serviceType: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    serviceType: input.serviceType,
    description: input.description,
    url: `${SITE_URL}${input.url}`,
    areaServed: { "@type": "Country", name: "Sweden" },
    provider: {
      "@type": "Organization",
      name: "MinCFO",
      url: SITE_URL,
    },
  };
}
