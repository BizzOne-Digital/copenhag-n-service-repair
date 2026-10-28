import Link from "next/link";
export default function NotFound() {
  return (
    <main className="standalone">
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>LET’S GET YOU BACK ON TRACK.</h1>
      <p>The page you requested could not be found.</p>
      <Link href="/" className="button">
        Back to Home
      </Link>
    </main>
  );
}
