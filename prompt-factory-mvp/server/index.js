const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit"); // 1. Import
const { generatePrompts } = require("./services/promptEngine");

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Trust Proxy (Required for hosting on Vercel/Render/Heroku)
app.set('trust proxy', 1);

// 3. Configure Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20, // Limit each IP to 10 requests per day
  message: {
    success: false,
    error: "Daily generation limit reached. Please come back tomorrow!"
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Allow requests ONLY from your frontend
const allowedOrigins = [
  "http://localhost:3000", 
  "https://prompt-factory.vercel.app",
  "https://chikoochi.com",
];

// Middleware
app.use(cors({
  origin: allowedOrigins
}));

app.use(express.json());

// 4. Apply the rate limiter specifically to the generate route
app.use("/api/generate", apiLimiter);

// Health Check
app.get("/", (req, res) => {
  res.send("PromptFactory API is running...");
});

// POST /api/generate
app.post("/api/generate", (req, res) => {
  try {
    const userInput = req.body;

    // Basic Validation (MVP-level)
    if (!userInput.application_type || !userInput.experience_level) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: application_type, experience_level"
      });
    }

    console.log("Generating prompts for:", userInput.application_type);

    // Call the core engine
    const prompts = generatePrompts(userInput);

    return res.status(200).json({
      success: true,
      data: prompts
    });

  } catch (error) {
    console.error("Generation Error:", error.message);

    return res.status(500).json({
      success: false,
      error: "Internal Server Error: Failed to generate prompts"
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
