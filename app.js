const express = require("express");
const morgan = require("morgan");
const rateLimiter = require("express-rate-limit");
// const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const AppError = require(`${__dirname}/utils/appError`);
const globalErrorHandler = require(`${__dirname}/controllers/errorController`);
const userRouter = require(`${__dirname}/routes/userRoutes`);
const productRoutes = require(`${__dirname}/routes/productsRoutes`);
const offerRoutes = require(`${__dirname}/routes/offerRoutes`);
const authController = require(`${__dirname}/controllers/authController`);

const app = express();

app.use(bodyParser.json());

app.use(cookieParser());

app.disable("x-powered-by");

// Serving static files
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
// app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use(cors());

// Limit request from same API
const generalUserLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    return next(
      new AppError(
        "Too many requests from this IP, please try again after 5 minutes.",
        429
      )
    );
  },
});
const searchLimiter = rateLimiter({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    return next(
      new AppError(
        "Too many requests from this IP, please try again after 30 minutes.",
        429
      )
    );
  },
});
app.use(
  "/api/v1/users",
  (req, res, next) => {
    if (req.path === "/me") {
      next();
    } else {
      generalUserLimiter(req, res, next);
    }
  },
  userRouter
);
app.use("/api/v1/products/search", searchLimiter);

app.use("/login", (req, res, next) => {
  res.sendFile(`${__dirname}/public/login.html`);
});
app.use("/forgotPassword", (req, res, next) => {
  res.sendFile(`${__dirname}/public/forgotPassword.html`);
});
app.use("/resetPassword/:token", (req, res, next) => {
  const token = req.params.token;
  res.sendFile(`${__dirname}/public/resetPassword.html`, { token });
});
app.use(
  "/signup",
  // authController.protect,
  // authController.restrictTo("admin", "cashier"),
  (req, res, next) => {
    res.sendFile(`${__dirname}/public/signup.html`);
  }
);

app.use(
  "/offers/create-offer",
  authController.protect,
  authController.restrictTo("admin", "cashier"),
  (req, res, next) => {
    res.sendFile(`${__dirname}/public/createOffer.html`);
  }
);
app.use(
  "/offers/edit-offer",
  authController.protect,
  authController.restrictTo("admin", "cashier"),
  (req, res, next) => {
    res.sendFile(`${__dirname}/public/editOffer.html`);
  }
);
app.use("/offers", (req, res, next) => {
  res.sendFile(`${__dirname}/public/offers.html`);
});

app.use("/api/v1/products", productRoutes);

app.use("/api/v1/offers", offerRoutes);

app.all("*", (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = "fail";
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
