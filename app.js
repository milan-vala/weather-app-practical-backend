const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

function generateToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
}

app.post("/api/signup", (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (
    !username ||
    !password ||
    !confirmPassword ||
    password !== confirmPassword
  ) {
    res.status(400).json({ message: "Bad request." });
  } else {
    const token = generateToken({ username: req.body.username });
    res.json(token);
  }
});

app.get("/api/login", (req, res) => {
  const authToken = req.headers.authorization;
  if (authToken)
    res.status(200).json({ success: true, message: "Login successful" });
  else res.status(401).json({ success: false, error: "Unauthorized" });
});

app.get("/api/weather", (req, res) => {
  const response = require("./mock/data.json");
  console.log("response =>", response);
  res.status(200).json(response);
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
