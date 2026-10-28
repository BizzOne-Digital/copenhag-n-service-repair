import test from "node:test";
import assert from "node:assert/strict";
import { databaseEnabled, DatabaseDisabledError } from "../lib/runtime-config";
import { connectDB } from "../lib/db";
test("database remains disabled even with an invalid URI until explicitly enabled", async () => {
  const enabled = process.env.DATABASE_ENABLED;
  const uri = process.env.MONGODB_URI;
  try {
    delete process.env.DATABASE_ENABLED;
    process.env.MONGODB_URI = "mongodb://127.0.0.1:1/not-connected";
    assert.equal(databaseEnabled(), false);
    await assert.rejects(connectDB(), DatabaseDisabledError);
    process.env.DATABASE_ENABLED = "false";
    assert.equal(databaseEnabled(), false);
    process.env.DATABASE_ENABLED = "true";
    assert.equal(databaseEnabled(), true);
    process.env.MONGODB_URI = "";
    assert.equal(databaseEnabled(), false);
  } finally {
    if (enabled === undefined) delete process.env.DATABASE_ENABLED;
    else process.env.DATABASE_ENABLED = enabled;
    if (uri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = uri;
  }
});
