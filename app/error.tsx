"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="standalone">
      <p className="eyebrow red">SOMETHING WENT WRONG</p>
      <h1>PLEASE TRY AGAIN.</h1>
      <p>We couldn’t load this page. Call 519-281-6100 if you need service.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
