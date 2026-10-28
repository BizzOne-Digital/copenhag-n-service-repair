import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, ArrowLeft, Check } from "lucide-react";
import { services } from "@/lib/content";
import { PageHero } from "@/components/site/Sections";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = (await services()).find((s) => s.slug === slug);
  return {
    title: item
      ? item.title + " | Copenhagen Service and Repair"
      : "Service not found",
    description: item?.summary,
    alternates: { canonical: "/services/" + slug },
  };
}
export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = (await services()).find((s) => s.slug === slug);
  if (!item) notFound();
  return (
    <>
      <PageHero
        eyebrow="EQUIPMENT SERVICES"
        title={item.title}
        intro={item.summary}
        image={item.image}
      />
      <section className="section">
        <div className="container detail-layout">
          <div>
            <Link href="/services" className="text-link">
              <ArrowLeft size={17} />
              All services
            </Link>
            <h2>LET’S GET THE JOB SORTED.</h2>
            <p className="prose">{item.description}</p>
            <ul className="plain-checks">
              {[
                "Serving Southwest Ontario",
                "Discuss your equipment and service needs",
                "Preferred dates confirmed directly",
              ].map((x) => (
                <li key={x}>
                  <Check size={18} />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <aside className="service-aside">
            <p className="eyebrow">TAKE THE NEXT STEP</p>
            <h3>YOUR EQUIPMENT. OUR ATTENTION.</h3>
            <p>{item.pricingNote}</p>
            <Link
              className="button"
              href={"/booking?service=" + encodeURIComponent(item.title)}
            >
              <CalendarDays size={18} />
              {item.cta}
            </Link>
            <Link href="/contact" className="text-link">
              Have a question?
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
