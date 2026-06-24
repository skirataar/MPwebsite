import { loadEnvConfig } from "@next/env";
import path from "path";

// Load environment variables from apps/web (forcing dev loading to read .env.local)
const projectRoot = process.cwd();
loadEnvConfig(path.join(projectRoot, "apps/web"), true);

async function run() {
  try {
    console.log("Running manual database seed...");
    // Dynamically import seed module after environment variables are loaded
    const { seedDB } = await import("./seed");
    await seedDB();
    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

run();
