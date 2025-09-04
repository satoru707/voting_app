import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import electionRoutes from "./routes/elections";
import adminRoutes from "./routes/admin";
import superAdminRoutes from "./routes/super";
import { authMiddleware } from "./middleware/auth";
import { closeElection } from "./routes/admin";
import { Express } from "express";

const app: Express = express();
const prisma = new PrismaClient();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // limit auth requests
// });

// app.use(limiter);
// app.use("/api/auth", authLimiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", authMiddleware, userRoutes);
app.use("/api/elections", authMiddleware, electionRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);
app.use("/api/super", authMiddleware, superAdminRoutes);

// Error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Server error:", err);
    res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { error: err.message }),
    });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start the server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Schedule election auto-closure
  setInterval(async () => {
    console.log("Checking for elections to auto-close...");
    const electionsToEnd = await prisma.election.findMany({
      where: {
        status: "OPEN",
        endAt: { lt: new Date() }, // Elections where endAt is in the past
      },
    });

    for (const election of electionsToEnd) {
      console.log(`Auto-closing election: ${election.title}`);
      await closeElection(election.id);
    }
  }, 60 * 1000); // Check every minute
});

export default app;
export { prisma };
