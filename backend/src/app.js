import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/health-routes.js";
import authRoutes from "./routes/auth-routes.js";
import productRoutes from "./routes/product-routes.js";
import cartRoutes from "./routes/cart-routes.js";
import globalErrorHandler from "./controllers/globalError-controller.js";
import AppError from "./utils/appError-utils.js";
import orderRoutes from "./routes/order-routes.js";
import paymentRoutes from "./routes/payment-routes.js";

const app = express();

const configuredOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (configuredOrigins.includes("*") || configuredOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
// MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// SERVING STATIC FILES
app.use(express.static("public"));
app.use(express.json({ limit: "10kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);
app.use(cookieParser());

//API HEALTH CHECKER
app.use("/api/v1/healthcheck", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

//UNHANDLED ERROR ROUTES
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//GLOBAL ERROR ROUTES
app.use(globalErrorHandler);

export default app;
