import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  Check,
  Phone,
  Mail,
  Facebook,
  MapPin,
  Cog,
} from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { Brand } from "@/components/site/Header";
import { type ServiceData } from "@/lib/defaults";
export function ServiceCard({ service }: { service: ServiceData }) {
  return (
    <article className="service-card">
      <Link href={"/services/" + service.slug} className="service-image">
        <SafeImage
          src={service.image}
          alt={service.imageAlt}
          sizes="(max-width: 700px) 100vw, 33vw"
        />
        <span className="image-arrow">
          <ArrowUpRight size={20} />
        </span>
      </Link>
      <div className="service-content">
        <h3>
          <Link href={"/services/" + service.slug}>{service.title}</Link>
        </h3>
        <p>{service.summary}</p>
        <Link className="text-link" href={"/services/" + service.slug}>
          Learn more <ArrowRight size={17} />
        </Link>
      </div>
    </article>
  );
}
export function BookingBanner({
  title = "LET’S GET YOU BACK TO WORK.",
}: {
  title?: string;
}) {
  return (
    <section className="booking-banner">
      <Cog className="blueprint" size={290} strokeWidth={0.35} />
      <div className="container banner-inner">
        <div>
          <p className="eyebrow light">SERVICE WHEN YOU NEED IT</p>
          <h2>{title}</h2>
        </div>
        <Link href="/booking" className="button">
          <CalendarDays size={19} />
          Request a Booking
        </Link>
      </div>
    </section>
  );
}
export function AboutSplit({ content }: { content: Record<string, string> }) {
  return (
    <section className="about-split">
      <div className="about-photo">
        <SafeImage src={content.aboutImage} alt={content.aboutAlt} />
        <span className="photo-label">EQUIPMENT SERVICE & REPAIR</span>
      </div>
      <div className="about-copy">
        <p className="eyebrow red">COPENHAGEN SERVICE AND REPAIR</p>
        <h2>
          {content.aboutTitle} <span>{content.aboutHighlight}</span>
        </h2>
        <p>{content.aboutText}</p>
        <ul className="check-list">
          {[
            "Emergency breakdown repair",
            "Preventative maintenance plans",
            "New & used lift truck sales",
          ].map((x) => (
            <li key={x}>
              <Check size={15} />
              {x}
            </li>
          ))}
        </ul>
        <Link href="/about" className="text-link light">
          Get to know us <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  image?: string;
}) {
  return (
    <section className={"page-hero " + (image ? "with-photo" : "")}>
      {image && (
        <div className="page-hero-photo">
          <SafeImage
            src={image}
            alt="Industrial equipment and workshop"
            priority
          />
        </div>
      )}
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-intro">{intro}</p>
      </div>
    </section>
  );
}
export function Footer({ site }: { site: any }) {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <Brand logo={site.logo} name={site.businessName} />
        <div className="footer-contact">
          <a href={"tel:+1" + site.phone.replace(/\D/g, "")}>
            <Phone size={18} />
            {site.phone}
          </a>
          <a href={"mailto:" + site.email}>
            <Mail size={18} />
            {site.email}
          </a>
        </div>
        <div className="footer-social">
          {site.facebook ? (
            <a href={site.facebook} target="_blank" rel="noopener noreferrer">
              <Facebook size={21} />
              Follow us on Facebook
            </a>
          ) : (
            <span>
              <Facebook size={21} />
              Copenhagen Service and Repair
            </span>
          )}
          <small>Contact for pricing.</small>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          Copyright {new Date().getFullYear()} {site.businessName}.
        </span>
        <nav>
          {[
            ["/services", "Services"],
            ["/about", "About"],
            ["/contact", "Contact"],
            ["/booking", "Booking"],
          ].map(([h, t]) => (
            <Link href={h} key={h}>
              {t}
            </Link>
          ))}
        </nav>
        <span>
          <MapPin size={13} />
          {site.serviceArea}
        </span>
      </div>
    </footer>
  );
}
