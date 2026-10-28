import { Header } from "@/components/site/Header";
import { Footer, BookingBanner } from "@/components/site/Sections";
import { settings, pageContent } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [site, home] = await Promise.all([settings(), pageContent("home")]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header site={site} />
      <main id="main">{children}</main>
      <BookingBanner title={home.bannerTitle} />
      <Footer site={site} />
    </>
  );
}
