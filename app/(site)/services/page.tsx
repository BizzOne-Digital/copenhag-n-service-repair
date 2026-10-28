import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";
import { pageContent, pageMetadata, services, settings } from "@/lib/content";
import { PageHero, ServiceCard } from "@/components/site/Sections";
export async function generateMetadata() {
  return pageMetadata("services", "/services");
}
export default async function Services() {
  const [c, items, site, home] = await Promise.all([
    pageContent("services"),
    services(),
    settings(),
    pageContent("home"),
  ]);
  return (
    <>
      <PageHero
        eyebrow="OUR SERVICES"
        title={c.title}
        intro={c.intro}
        image={c.heroImage}
      />
      <section className="section">
        <div className="container">
          <div className="section-top">
            <div>
              <p className="eyebrow">FROM REPAIR TO PREVENTION</p>
              <h2>THE RIGHT SERVICE. FOR YOUR EQUIPMENT.</h2>
            </div>
            <span className="price-note">Contact for pricing</span>
          </div>
          <div className="service-grid all-services">
            {items.map((s) => (
              <ServiceCard service={s} key={s.slug} />
            ))}
          </div>
        </div>
      </section>
      <section className="light-section section">
        <div className="container faq-layout">
          <div>
            <p className="eyebrow">GOOD TO KNOW</p>
            <h2>A FEW PRACTICAL ANSWERS.</h2>
            <div className="special-offer">
              <h3>SPECIAL OFFERS</h3>
              <p>{home.specialOffers}</p>
            </div>
            <p>Have a different question? We’re a phone call away.</p>
            <a
              className="text-link"
              href={"tel:+1" + site.phone.replace(/\D/g, "")}
            >
              <Phone size={18} />
              {site.phone}
            </a>
          </div>
          <div className="faqs">
            {[
              [
                "Where do you provide service?",
                "We serve equipment owners throughout Southwest Ontario. Share your location when you contact us.",
              ],
              [
                "What does a service cost?",
                "Pricing depends on the equipment and service required. Contact us to discuss your needs and pricing.",
              ],
              [
                "Can I arrange a yearly inspection?",
                "Yes. Request a booking for your lift truck, scissor lift, boom or other equipment and we will discuss the inspection.",
              ],
              [
                "What should I do if my equipment breaks down?",
                "Call " +
                  site.phone +
                  " to discuss the problem and current service availability.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="container emergency">
        <div>
          <p className="eyebrow red">UNEXPECTED DOWNTIME?</p>
          <h2>LET’S TALK ABOUT THE BREAKDOWN.</h2>
        </div>
        <a className="button" href={"tel:+1" + site.phone.replace(/\D/g, "")}>
          <Phone size={18} />
          Call {site.phone}
          <ArrowRight size={18} />
        </a>
      </section>
    </>
  );
}
