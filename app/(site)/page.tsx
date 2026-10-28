import {
  EquipmentOverview,
  MaintenanceOverview,
  ServiceProcess,
  BreakdownCallout,
  ServiceAreaOverview,
  HomeFAQs,
} from "@/components/home-details";
import { Credentials } from "@/components/site/Credentials";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Forklift,
  ClipboardCheck,
  Wrench,
} from "lucide-react";
import { pageContent, pageMetadata, services, settings } from "@/lib/content";
import { SafeImage } from "@/components/ui/SafeImage";
import { AboutSplit, ServiceCard } from "@/components/site/Sections";
export async function generateMetadata() {
  return pageMetadata("home", "/");
}
export default async function Home() {
  const [c, items, site] = await Promise.all([
    pageContent("home"),
    services(),
    settings(),
  ]);
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.businessName,
    telephone: site.phone,
    email: site.email,
    areaServed: site.serviceArea,
    url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <section className="hero">
        <div className="hero-photo">
          <SafeImage src={c.heroImage} alt={c.heroAlt} priority sizes="100vw" />
        </div>
        <div className="hero-grid" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">{c.eyebrow}</p>
            <h1>
              {c.heroLine1}
              <br />
              <span>{c.heroLine2}</span>
              <br />
              {c.heroLine3}
            </h1>
            <p className="hero-description">{c.heroText}</p>
            <div className="hero-actions">
              <Link href="/booking" className="button">
                <CalendarDays size={19} />
                Book a Service
              </Link>
              <Link href="/services" className="button outline">
                Explore Services
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
          <div className="hero-caption">
            <span className="status-dot" />
            MATERIAL HANDLING. HANDLED.
          </div>
        </div>
      </section>
      <section className="benefits">
        <div className="container benefits-grid">
          {[Forklift, ClipboardCheck, Wrench].map((Icon, i) => (
            <div className="benefit" key={i}>
              <Icon size={43} strokeWidth={1.6} />
              <div>
                <h3>{c[`benefit${i + 1}Title`]}</h3>
                <p>{c[`benefit${i + 1}Text`]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Credentials content={c} />
      <section className="section expertise">
        <div className="container">
          <div className="section-top">
            <div>
              <p className="eyebrow">OUR EXPERTISE</p>
              <h2>{c.servicesTitle}</h2>
            </div>
            <Link href="/services" className="text-link desktop-link">
              All services <ArrowUpRightIcon />
            </Link>
          </div>
          <p className="section-intro">{c.servicesText}</p>
          <div className="service-grid">
            {items.slice(0, 3).map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </div>
      </section>
      <EquipmentOverview content={c} />
      <AboutSplit content={c} />
      <MaintenanceOverview content={c} />
      <ServiceProcess content={c} />
      <BreakdownCallout content={c} site={site} />
      <ServiceAreaOverview content={c} site={site} />
      <HomeFAQs content={c} />
    </>
  );
}
function ArrowUpRightIcon() {
  return <ArrowRight size={17} />;
}
