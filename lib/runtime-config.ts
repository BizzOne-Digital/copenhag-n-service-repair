/** Database-backed features are explicitly opt-in. The default is a shareable code-content website. */
export function databaseEnabled() {
  return (
    process.env.DATABASE_ENABLED === "true" &&
    Boolean(process.env.MONGODB_URI?.trim())
  );
}
export class DatabaseDisabledError extends Error {
  constructor() {
    super(
      "Online requests are not enabled yet. Please call 519-281-6100 to discuss your service.",
    );
    this.name = "DatabaseDisabledError";
  }
}
