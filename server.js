const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./DB/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");
const cookieParser = require("cookie-parser");
dotenv.config();

const app = express();

// Configure session middleware
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

app.use(limiter);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());
app.use(express.static("public"));
app.use("/uploads", express.static("public/uploads"));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Use the routes
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/blogs", blogRoutes);
// app.get("/", (req, res) => {
//   res.render("index.ejs");
// });

// --------------app.listen -------------

const PORT = 3000;
connectDB().then(() => {
  app.listen(PORT, console.log(`Server is up on port ${PORT}`));
});
