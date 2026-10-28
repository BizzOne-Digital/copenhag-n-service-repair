import Link from "next/link";
import {
  ArrowRight,
  Phone,
  MapPin,
  Factory,
  Warehouse,
  Wrench,
  Forklift,
  Check,
  ClipboardList,
  MessagesSquare,
  CalendarCheck,
  Plus,
  Mail,
} from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
type Content = Record<string, string>;
type Site = { phone: string; email: string; serviceArea: string };
const phoneURL = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return "tel:+" + (digits.length === 10 ? "1" : "") + digits;
};
export function EquipmentOverview({ content: c }: { content: Content }) {
  return (
    <section className="section equipment-overview">
      <div className="container equipment-layout">
        <div>
          <p className="eyebrow">EQUIPMENT WE WORK ON</p>
          <h2>{c.equipmentTitle}</h2>
          <p className="home-section-copy">{c.equipmentText}</p>
          <div className="equipment-list">
            {[Forklift, ClipboardList, Wrench, Factory].map((Icon, i) => (
              <div key={i}>
                <Icon size={25} strokeWidth={1.6} />
                <div>
                  <h3>{c[`equipment${i + 1}Title`]}</h3>
                  <p>{c[`equipment${i + 1}Text`]}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/services" className="text-link">
            Explore equipment services
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="equipment-visual">
          <SafeImage src={c.equipmentImage} alt={c.equipmentImageAlt} />
          <div className="equipment-caption">
            <span>FROM GROUND LEVEL TO THE JOB ABOVE.</span>
            <p>Lift trucks. Aerial equipment. Small engines.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
export function MaintenanceOverview({ content: c }: { content: Content }) {
  return (
    <section className="section">
      <div className="container maintenance-layout">
        <div className="maintenance-visual">
          <SafeImage src={c.maintenanceImage} alt={c.maintenanceImageAlt} />
          <span className="photo-label">PREVENTION STARTS WITH A PLAN</span>
        </div>
        <div className="maintenance-copy">
          <p className="eyebrow">PREVENTATIVE MAINTENANCE</p>
          <h2>{c.maintenanceTitle}</h2>
          <p className="home-section-copy">{c.maintenanceText}</p>
          <ul className="home-checks">
            {[1, 2, 3].map((i) => (
              <li key={i}>
                <Check size={19} />
                <span>{c[`maintenancePoint${i}`]}</span>
              </li>
            ))}
          </ul>
          <p className="maintenance-note">{c.maintenanceNote}</p>
          <div className="home-inline-actions">
            <Link
              className="button"
              href="/booking?service=Preventative%20Maintenance%20Plans"
            >
              Discuss a PM Plan
              <ArrowRight size={18} />
            </Link>
            <Link className="text-link" href="/services/equipment-inspections">
              Yearly inspections
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
export function ServiceProcess({ content: c }: { content: Content }) {
  return (
    <section className="section home-process">
      <div className="container">
        <div className="home-heading">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>{c.processTitle}</h2>
          <p className="home-section-copy">{c.processText}</p>
        </div>
        <div className="process-grid">
          {[ClipboardList, MessagesSquare, CalendarCheck].map((Icon, i) => (
            <article key={i}>
              <div className="process-step-top">
                <span>0{i + 1}</span>
                <Icon size={27} strokeWidth={1.6} />
              </div>
              <h3>{c[`step${i + 1}Title`]}</h3>
              <p>{c[`step${i + 1}Text`]}</p>
            </article>
          ))}
        </div>
        <p className="process-note">{c.processNote}</p>
      </div>
    </section>
  );
}
export function BreakdownCallout({
  content: c,
  site,
}: {
  content: Content;
  site: Site;
}) {
  return (
    <section className="home-breakdown">
      <div className="breakdown-visual">
        <SafeImage src={c.breakdownImage} alt={c.breakdownImageAlt} />
      </div>
      <div className="container breakdown-inner">
        <div>
          <p className="eyebrow red">EMERGENCY BREAKDOWN REPAIR</p>
          <h2>{c.breakdownTitle}</h2>
          <p>{c.breakdownText}</p>
          <a className="button" href={phoneURL(site.phone)}>
            <Phone size={19} />
            Call {site.phone}
          </a>
          <span className="breakdown-note">{c.breakdownNote}</span>
        </div>
      </div>
    </section>
  );
}
export function ServiceAreaOverview({
  content: c,
  site,
}: {
  content: Content;
  site: Site;
}) {
  return (
    <section className="section">
      <div className="container home-area-layout">
        <div>
          <p className="eyebrow">WHO WE HELP / WHERE WE WORK</p>
          <h2>{c.areaTitle}</h2>
          <p className="home-section-copy">{c.areaText}</p>
          <div className="home-audiences">
            {[Factory, Warehouse, Wrench].map((Icon, i) => (
              <article key={i}>
                <Icon size={25} strokeWidth={1.6} />
                <h3>{c[`audience${i + 1}Title`]}</h3>
                <p>{c[`audience${i + 1}Text`]}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="home-area-card">
          <MapPin size={35} strokeWidth={1.4} />
          <p className="eyebrow light">OUR SERVICE AREA</p>
          <h3>{site.serviceArea}</h3>
          <p>{c.areaNote}</p>
          <a href={phoneURL(site.phone)}>
            <Phone size={17} />
            {site.phone}
          </a>
          <a className="area-email" href={"mailto:" + site.email}>
            <Mail size={17} />
            {site.email}
          </a>
          <Link href="/contact" className="text-link light">
            Talk about your location
            <ArrowRight size={17} />
          </Link>
        </aside>
      </div>
    </section>
  );
}
export function HomeFAQs({ content: c }: { content: Content }) {
  return (
    <section className="section home-faq">
      <div className="container home-faq-layout">
        <div>
          <p className="eyebrow">BEFORE YOU GET IN TOUCH</p>
          <h2>{c.faqTitle}</h2>
          <p className="home-section-copy">{c.faqText}</p>
          <div className="home-offers">
            <span className="eyebrow">SPECIAL OFFERS</span>
            <h3>{c.specialOffers}</h3>
            <p>{c.offerText}</p>
            <Link href="/contact" className="text-link">
              Ask about your next service
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="home-faq-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <details key={i}>
              <summary>
                {c[`faq${i}Question`]}
                <Plus size={18} />
              </summary>
              <p>{c[`faq${i}Answer`]}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
