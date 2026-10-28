import mongoose, { Schema } from "mongoose";
const model = (name: string, schema: Schema): mongoose.Model<any> =>
  mongoose.models[name] || mongoose.model(name, schema);
const options = { timestamps: true };
export const AdminUser = model(
  "AdminUser",
  new Schema(
    {
      email: { type: String, unique: true, required: true },
      passwordHash: { type: String, required: true },
    },
    options,
  ),
);
export const AdminSession = model(
  "AdminSession",
  new Schema(
    {
      tokenHash: { type: String, unique: true },
      adminId: { type: Schema.Types.ObjectId, required: true },
      expiresAt: { type: Date, expires: 0 },
    },
    options,
  ),
);
export const Service = model(
  "Service",
  new Schema(
    {
      title: String,
      slug: { type: String, unique: true },
      summary: String,
      description: String,
      image: String,
      imageAlt: String,
      pricingNote: String,
      cta: String,
      order: Number,
      published: Boolean,
    },
    options,
  ),
);
export const PageContent = model(
  "PageContent",
  new Schema(
    { key: { type: String, unique: true }, data: Schema.Types.Mixed },
    options,
  ),
);
export const SiteSettings = model(
  "SiteSettings",
  new Schema(
    { key: { type: String, unique: true }, data: Schema.Types.Mixed },
    options,
  ),
);
const submission = {
  reference: { type: String, unique: true },
  name: String,
  email: String,
  phone: String,
  company: String,
  service: String,
  message: String,
  status: String,
  notes: { type: String, default: "" },
};
export const Booking = model(
  "Booking",
  new Schema(
    {
      ...submission,
      equipment: String,
      makeModel: String,
      location: String,
      date: String,
      timeWindow: String,
      urgency: String,
    },
    options,
  ),
);
export const Enquiry = model("Enquiry", new Schema(submission, options));
const uploadSchema = new Schema(
  {
    folder: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: String,
    size: Number,
    data: { type: Buffer, select: false },
    ownerId: Schema.Types.ObjectId,
  },
  options,
);
uploadSchema.index({ folder: 1, filename: 1 }, { unique: true });
export const StoredUpload = model("StoredUpload", uploadSchema);
const sessionSchema = new Schema(
  {
    ownerId: Schema.Types.ObjectId,
    folder: String,
    mimeType: String,
    size: Number,
    count: Number,
    state: { type: String, default: "open" },
    result: Schema.Types.Mixed,
    filename: String,
    expiresAt: { type: Date, expires: 0 },
  },
  options,
);
export const UploadSession = model("UploadSession", sessionSchema);
const chunkSchema = new Schema(
  {
    sessionId: Schema.Types.ObjectId,
    index: Number,
    data: Buffer,
    size: Number,
    expiresAt: { type: Date, expires: 0 },
  },
  options,
);
chunkSchema.index({ sessionId: 1, index: 1 }, { unique: true });
export const UploadChunk = model("UploadChunk", chunkSchema);
const rateSchema = new Schema({
  key: { type: String, unique: true },
  count: Number,
  expiresAt: { type: Date, expires: 0 },
});
export const RateLimit = model("RateLimit", rateSchema);
