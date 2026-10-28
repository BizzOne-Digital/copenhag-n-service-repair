"use client";
import { useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { bookingSchema, enquirySchema } from "@/lib/validation";
export function RequestForm({
  booking = false,
  services,
  selected = "",
  today,
}: {
  booking?: boolean;
  services: string[];
  selected?: string;
  today: string;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const checked = (booking ? bookingSchema : enquirySchema).safeParse(data);
    if (!checked.success) {
      setErrors(checked.error.flatten().fieldErrors);
      toast.error("Please check the form fields.");
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      const res = await fetch(
        "/api/submissions/" + (booking ? "bookings" : "enquiries"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checked.data),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.fields || {});
        throw new Error(json.error);
      }
      setResult(json.reference);
      toast.success("Your request has been received.");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send your request.",
      );
    } finally {
      setBusy(false);
    }
  }
  function field(name: string, label: string, type = "text", optional = false) {
    return (
      <label className="field">
        {label}
        {!optional && <span className="required"> *</span>}
        <input
          name={name}
          type={type}
          required={!optional}
          maxLength={name === "email" ? 254 : 300}
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? name + "-error" : undefined}
        />
        {errors[name] && (
          <small id={name + "-error"} className="field-error">
            {errors[name]?.[0]}
          </small>
        )}
      </label>
    );
  }
  return result ? (
    <div className="success-panel" role="status">
      <CheckCircle2 size={44} />
      <p className="eyebrow">REQUEST RECEIVED</p>
      <h2>THANK YOU. WE’LL BE IN TOUCH.</h2>
      <p>
        Your reference is <strong>{result}</strong>.
      </p>
      <p>
        {booking
          ? "Your preferred date is a request. The business will contact you to confirm availability."
          : "Your enquiry has been saved for the business to review."}
      </p>
      <button className="button" onClick={() => setResult("")}>
        Send another request
      </button>
    </div>
  ) : (
    <form onSubmit={submit} className="request-form" noValidate>
      <div className="form-heading">
        <span className="eyebrow">
          {booking ? "REQUEST A SERVICE" : "SEND AN ENQUIRY"}
        </span>
        <h2>
          {booking ? "TELL US WHAT NEEDS ATTENTION." : "HOW CAN WE HELP?"}
        </h2>
        <p>Fields marked * are required.</p>
      </div>
      <div className="form-grid">
        {field("name", "Full name")}
        {field("company", "Company", "text", true)}
        {field("email", "Email", "email")}
        {field("phone", "Phone", "tel")}
        <label className="field full">
          Service of interest <span className="required">*</span>
          <select name="service" defaultValue={selected} required>
            <option value="">Select a service</option>
            {services.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          {errors.service && (
            <small className="field-error">{errors.service[0]}</small>
          )}
        </label>
        {booking && (
          <>
            {field("equipment", "Equipment type")}
            {field("makeModel", "Make / model", "text", true)}
            {field("location", "Service location")}
            <label className="field">
              Preferred date <span className="required">*</span>
              <input
                type="date"
                name="date"
                min={today}
                required
                aria-invalid={!!errors.date}
              />
              {errors.date && (
                <small className="field-error">{errors.date[0]}</small>
              )}
            </label>
            <label className="field">
              Preferred time window
              <select name="timeWindow" defaultValue="Flexible">
                <option>Flexible</option>
                <option>Morning</option>
                <option>Afternoon</option>
              </select>
            </label>
            <label className="field">
              Urgency
              <select name="urgency" defaultValue="Routine">
                <option>Routine</option>
                <option>Soon</option>
                <option>Breakdown</option>
              </select>
            </label>
          </>
        )}
        <label className="field full">
          {booking ? "Problem description" : "Message"}{" "}
          <span className="required">*</span>
          <textarea
            name="message"
            rows={5}
            minLength={10}
            maxLength={5000}
            required
            placeholder="Tell us about your equipment and the service you need."
            aria-invalid={!!errors.message}
          />
          {errors.message && (
            <small className="field-error">{errors.message[0]}</small>
          )}
        </label>
        <div className="honeypot" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>
      {booking && (
        <p className="form-note">
          This is a booking request. We will contact you to confirm
          availability. For urgent breakdowns,{" "}
          <a href="tel:+15192816100">call 519-281-6100</a>.
        </p>
      )}
      <button type="submit" className="button" disabled={busy}>
        {busy ? (
          <LoaderCircle size={18} className="spin" />
        ) : (
          <ArrowRight size={18} />
        )}
        {busy ? "Sending..." : booking ? "Request a Booking" : "Send Enquiry"}
      </button>
      <p className="privacy-note">
        Your details are used to respond to this service request.
      </p>
    </form>
  );
}
