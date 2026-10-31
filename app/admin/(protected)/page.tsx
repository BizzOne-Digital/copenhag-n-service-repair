import Link from "next/link";
import { CalendarDays, Mail, Wrench, ArrowUpRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Booking, Enquiry, Service } from "@/models";
export default async function Dashboard() {
  await connectDB();
  const [counts, bookings, enquiries] = await Promise.all([
    Promise.all([
      Booking.countDocuments(),
      Enquiry.countDocuments(),
      Service.countDocuments(),
    ]),
    Booking.find().sort({ createdAt: -1 }).limit(5).lean(),
    Enquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  return (
    <>
      <div className="admin-title">
        <div>
          <p className="eyebrow">YOUR BUSINESS AT A GLANCE</p>
          <h1>WORKSPACE OVERVIEW.</h1>
          <p>Keep up with bookings, enquiries and services.</p>
        </div>
        <Link href="/" className="small-button" target="_blank">
          View website
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="stats-grid">
        {[
          [CalendarDays, "Bookings", counts[0], "/admin/bookings"],
          [Mail, "Enquiries", counts[1], "/admin/enquiries"],
          [Wrench, "Services", counts[2], "/admin/services"],
        ].map(([Icon, title, count, href]) => {
          const I = Icon as typeof Mail;
          return (
            <Link className="stat-card" href={String(href)} key={String(title)}>
              <I size={23} />
              <strong>{String(count)}</strong>
              <span>{String(title)}</span>
            </Link>
          );
        })}
      </div>
      <div className="dashboard-columns">
        {[
          ["Recent bookings", bookings, "/admin/bookings"],
          ["Recent enquiries", enquiries, "/admin/enquiries"],
        ].map(([title, records, href]) => (
          <section className="admin-panel" key={String(title)}>
            <div className="panel-heading">
              <h2>{String(title)}</h2>
              <Link className="text-link" href={String(href)}>
                View all
                <ArrowUpRight size={15} />
              </Link>
            </div>
            {(records as any[]).length ? (
              (records as any[]).map((row) => (
                <Link
                  className="recent-row"
                  key={String(row._id)}
                  href={String(href)}
                >
                  <div>
                    <strong>{row.name}</strong>
                    <small>{row.service}</small>
                  </div>
                  <span className="badge">{row.status}</span>
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <Mail size={30} />
                <h3>No requests yet</h3>
                <p>New submissions will appear here.</p>
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
