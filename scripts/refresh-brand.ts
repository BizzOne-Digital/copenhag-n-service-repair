import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import { PageContent, Service } from "../models";
import { defaultPages, defaultServices } from "../lib/defaults";
async function main() {
  await connectDB();
  for (const item of defaultServices) {
    await Service.updateOne(
      {
        slug: item.slug,
        image: { $regex: "^https://images[.]unsplash[.]com/" },
      },
      { $set: { image: item.image } },
    );
  }
  const fields: Record<string, string[]> = {
    home: ["heroImage", "aboutImage"],
    services: ["heroImage"],
    about: ["image"],
  };
  for (const [key, names] of Object.entries(fields)) {
    for (const field of names) {
      await PageContent.updateOne(
        {
          key,
          [`data.${field}`]: { $regex: "^https://images[.]unsplash[.]com/" },
        },
        { $set: { [`data.${field}`]: defaultPages[key][field] } },
      );
    }
  }
  for (const field of ["experienceLabel", "licensedLabel", "trainingLabel"]) {
    await PageContent.updateOne(
      { key: "home" },
      { $set: { [`data.${field}`]: defaultPages.home[field] } },
    );
  }
  console.log(
    "Generated images and client qualifications updated. Custom uploaded images and other text were preserved.",
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
