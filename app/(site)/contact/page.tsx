import { Mail, Phone, MapPin, Facebook } from "lucide-react";
import { pageContent, pageMetadata, services, settings } from "@/lib/content";
import { PageHero } from "@/components/site/Sections";
import { RequestForm } from "@/components/forms/RequestForm";
import { torontoDate } from "@/lib/validation";
export async function generateMetadata() {
  return pageMetadata("contact", "/contact");
}
export default async function Contact() {
  const [c, site, items] = await Promise.all([
    pageContent("contact"),
    settings(),
    services(),
  ]);
  return (
    <>
      <PageHero eyebrow="GET IN TOUCH" title={c.title} intro={c.intro} />
      <section className="section">
        <div className="container contact-layout">
          <aside className="contact-sidebar">
            <p className="eyebrow">LET’S CONNECT</p>
            <h2>REAL SUPPORT STARTS WITH A CONVERSATION.</h2>
            <div className="contact-item">
              <Phone />
              <div>
                <span>CALL CLAUDE ST.ONGE</span>
                <a href={"tel:+1" + site.phone.replace(/\D/g, "")}>
                  {site.phone}
                </a>
              </div>
            </div>
            <div className="contact-item">
              <Mail />
              <div>
                <span>SEND AN EMAIL</span>
                <a href={"mailto:" + site.email}>{site.email}</a>
              </div>
            </div>
            <div className="contact-item">
              <MapPin />
              <div>
                <span>SERVICE AREA</span>
                <p>{site.serviceArea}</p>
                {site.address && <p>{site.address}</p>}
              </div>
            </div>
            {site.hours && <p>Hours: {site.hours}</p>}
            {site.facebook && (
              <a
                className="text-link"
                href={site.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={20} />
                Follow us on Facebook
              </a>
            )}
            <div className="pricing-box">
              <h3>EVERY JOB IS DIFFERENT.</h3>
              <p>Contact us to discuss your equipment and pricing.</p>
            </div>
          </aside>
          <RequestForm
            services={items.map((x) => x.title)}
            today={torontoDate()}
          />
        </div>
      </section>
    </>
  );
}
