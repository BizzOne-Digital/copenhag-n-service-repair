import { Credentials } from "@/components/site/Credentials";
import Link from "next/link";
import { ArrowRight, Factory, Warehouse, Wrench, MapPin } from "lucide-react";
import { pageContent, pageMetadata, settings } from "@/lib/content";
import { PageHero } from "@/components/site/Sections";
import { SafeImage } from "@/components/ui/SafeImage";
export async function generateMetadata() {
  return pageMetadata("about", "/about");
}
export default async function About() {
  const [c, site, home] = await Promise.all([
    pageContent("about"),
    settings(),
    pageContent("home"),
  ]);
  return (
    <>
      <PageHero eyebrow="ABOUT COPENHAGEN" title={c.title} intro={c.intro} />
      <Credentials content={home} />
      <section className="section">
        <div className="container about-page-grid">
          <div className="editorial-photo">
            <SafeImage
              src={c.image}
              alt="Tools and equipment in a repair workshop"
            />
            <span className="photo-label">SERVICE. REPAIR. PREVENTION.</span>
          </div>
          <div>
            <p className="eyebrow">YOUR LIFT TRUCK SPECIALIST</p>
            <h2>GOOD EQUIPMENT DESERVES GOOD CARE.</h2>
            <p className="prose">{c.body}</p>
            <p>
              From lift trucks and scissor lifts to boom trucks, telehandlers
              and small engines, we help equipment owners take the next step
              with repairs, inspections and planned maintenance.
            </p>
            <Link href="/contact" className="button">
              Speak with Claude
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section light-section">
        <div className="container">
          <p className="eyebrow">WHO WE WORK WITH</p>
          <h2>FROM THE WAREHOUSE TO THE WORKSHOP.</h2>
          <div className="audience-grid">
            {[
              [
                Factory,
                "Factories",
                "Keep production equipment and material handling moving.",
              ],
              [
                Warehouse,
                "Warehouses",
                "Support for the lift trucks your operation depends on.",
              ],
              [
                Wrench,
                "Small Engine Owners",
                "Practical service and repair for the general public.",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Factory;
              return (
                <article key={String(title)}>
                  <I size={33} />
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="container service-area">
        <MapPin size={46} />
        <div>
          <p className="eyebrow">LOCAL SERVICE. PRACTICAL SUPPORT.</p>
          <h2>SERVING {site.serviceArea.toUpperCase()}.</h2>
          <p>
            Tell us where your equipment is located and the service you need.
          </p>
        </div>
        <Link href="/booking" className="text-link">
          Request service
          <ArrowRight size={19} />
        </Link>
      </section>
    </>
  );
}
