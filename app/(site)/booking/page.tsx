import {
  Phone,
  ClipboardList,
  MessagesSquare,
  CalendarCheck,
} from "lucide-react";
import { pageContent, pageMetadata, services, settings } from "@/lib/content";
import { PageHero } from "@/components/site/Sections";
import { RequestForm } from "@/components/forms/RequestForm";
import { torontoDate } from "@/lib/validation";
export async function generateMetadata() {
  return pageMetadata("booking", "/booking");
}
export default async function Booking({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const [c, items, query, site] = await Promise.all([
    pageContent("booking"),
    services(),
    searchParams,
    settings(),
  ]);
  const selected = items.some((x) => x.title === query.service)
    ? query.service
    : "";
  return (
    <>
      <PageHero eyebrow="BOOK A SERVICE" title={c.title} intro={c.intro} />
      <section className="section">
        <div className="container contact-layout">
          <aside className="contact-sidebar">
            <p className="eyebrow">A SIMPLE NEXT STEP</p>
            <h2>REQUEST. DISCUSS. GET SORTED.</h2>
            <div className="booking-steps">
              {[
                [
                  ClipboardList,
                  "01",
                  "Tell us about the job",
                  "Share your equipment details and service needs.",
                ],
                [
                  MessagesSquare,
                  "02",
                  "We’ll get in touch",
                  "Discuss the work, pricing and availability.",
                ],
                [
                  CalendarCheck,
                  "03",
                  "Confirm your service",
                  "Agree on the next step directly with the business.",
                ],
              ].map(([Icon, n, title, copy]) => {
                const I = Icon as typeof Phone;
                return (
                  <div key={String(n)}>
                    <span className="step-icon">
                      <I size={22} />
                    </span>
                    <div>
                      <small>STEP {String(n)}</small>
                      <h3>{String(title)}</h3>
                      <p>{String(copy)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="urgent-box">
              <p className="eyebrow red">EQUIPMENT BROKEN DOWN?</p>
              <h3>GIVE US A CALL.</h3>
              <a href={"tel:+1" + site.phone.replace(/\D/g, "")}>
                <Phone size={19} />
                {site.phone}
              </a>
              <p>Call to discuss the issue and service availability.</p>
            </div>
          </aside>
          <RequestForm
            booking
            services={items.map((x) => x.title)}
            selected={selected}
            today={torontoDate()}
          />
        </div>
      </section>
    </>
  );
}
