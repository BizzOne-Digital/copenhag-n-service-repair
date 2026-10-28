import { Award, ShieldCheck, GraduationCap } from "lucide-react";
export function Credentials({ content }: { content: Record<string, string> }) {
  const items = [
    { Icon: Award, label: content.experienceLabel },
    { Icon: ShieldCheck, label: content.licensedLabel },
    { Icon: GraduationCap, label: content.trainingLabel },
  ];
  return (
    <section className="credentials" aria-label="Experience and qualifications">
      <div className="container credentials-grid">
        {items
          .filter((item) => item.label)
          .map(({ Icon, label }) => (
            <div className="credential" key={label}>
              <span className="credential-icon">
                <Icon size={26} strokeWidth={1.7} />
              </span>
              <h3>{label}</h3>
            </div>
          ))}
      </div>
    </section>
  );
}
