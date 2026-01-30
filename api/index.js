require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const {
  CreatePaste,
  FetchPaste,
  ViewPasteHTML,
} = require("../backend/controllers/paste");

const app = express();
app.use(express.json());
const corsOptions = {
  origin: [
    "https://pastebinapp-five.vercel.app", // prod frontend
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/api/healthz", async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    return res.status(200).json({ ok: isConnected });
  } catch (error) {
    console.error("Health check error:", error);
    return res.status(500).json({ ok: false, error: "Health check failed" });
  }
});

app.post("/api/pastes", CreatePaste);
app.get("/api/pastes/:id", FetchPaste);
app.get("/p/:id", ViewPasteHTML);

const DatabaseConnection = async () => {
  console.log("Trying to connect to DB......");
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGOURL);
      console.log(`Database ${mongoose.connection.name} is connected`);
    } catch (error) {
      console.log("DB Connection failed", error);
      throw error;
    }
  }
};

const handler = serverless(app);

module.exports = async (req, res) => {
  try {
    await DatabaseConnection();
    return handler(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};