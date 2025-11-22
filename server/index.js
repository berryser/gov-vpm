import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import vendorRoutes from "./routes/vendors.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();
// CORS: allow all in dev; restrict in prod if CLIENT_ORIGIN is set
const clientOrigin = process.env.CLIENT_ORIGIN;
if (clientOrigin) {
  app.use(
    cors({
      origin: clientOrigin,
      credentials: true,
    })
  );
} else {
  app.use(cors());
}
app.use(express.json());

// Simple rate limit on AI routes (avoid accidental API spam)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/ai", aiLimiter);

app.use("/api/vendors", vendorRoutes);
app.use("/api/ai", aiRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
