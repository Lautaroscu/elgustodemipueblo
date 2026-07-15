import { Hero } from "@/components/shop/landing/hero";
import { Historia } from "@/components/shop/landing/historia";
import { Destacados } from "@/components/shop/landing/destacados";
import { Promos } from "@/components/shop/landing/promos";
import { Testimonios } from "@/components/shop/landing/testimonios";
import { Faq } from "@/components/shop/landing/faq";
import { site } from "@/lib/site";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: site.name,
    description: site.description,
    url: site.url,
    servesCuisine: "Postres",
    priceRange: "$$",
    sameAs: [site.instagram],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Benito Juárez",
      addressRegion: "Buenos Aires",
      addressCountry: "AR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Destacados />
      <Historia />
      <Promos />
      <Testimonios />
      <Faq />
    </>
  );
}
