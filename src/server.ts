import app from "./app";
import config from "./config/config";
import { prisma } from "./shared";

const main = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

main();

// For Vercel deployment, export the app only
export default app;

// Run server locally only when NOT on Vercel
if (process.env.VERCEL !== "1") {
  const port = Number(config.port);
  app.listen(port, () => {
    console.log(`Server is running successfully on http://localhost:${port}`);
  });
}
