"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MapPin, Phone, CalendarDays, Menu, X } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
export function Brand({
  logo = "",
  name = "Copenhagen Service and Repair",
}: {
  logo?: string;
  name?: string;
}) {
  return (
    <Link href="/" className="brand" aria-label={name}>
      {logo && (
        <span className="brand-image">
          <SafeImage src={logo} alt={name} sizes="80px" />
        </span>
      )}
      <span>
        <strong>
          {name === "Copenhagen Service and Repair" ? "COPENHAGEN" : name}
        </strong>
        <small>SERVICE & REPAIR</small>
      </span>
    </Link>
  );
}
export function Header({
  site,
}: {
  site: {
    logo: string;
    businessName: string;
    serviceArea: string;
    phone: string;
  };
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="utility">
        <div className="container utility-inner">
          <span>
            <MapPin size={14} /> SERVING {site.serviceArea.toUpperCase()}
          </span>
          <a
            href={
              "tel:+" + site.phone.replace(/\D/g, "").replace(/^(?!1)/, "1")
            }
          >
            <Phone size={14} />
            {site.phone}
          </a>
        </div>
      </div>
      <div className="container nav">
        <Brand
          logo={site.logo || "/images/brand/copenhagen-logo.png"}
          name={site.businessName}
        />
        <button
          className="mobile-menu"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="main-navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="main-navigation"
          className={open ? "nav-links open" : "nav-links"}
        >
          {[
            ["/", "Home"],
            ["/services", "Services"],
            ["/about", "About Us"],
            ["/contact", "Contact"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={path === href ? "active" : ""}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/booking"
            className="button"
            onClick={() => setOpen(false)}
          >
            <CalendarDays size={18} />
            Book a Service
          </Link>
        </nav>
      </div>
    </header>
  );
}
