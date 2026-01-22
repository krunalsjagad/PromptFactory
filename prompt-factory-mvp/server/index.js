const express = require("express");
const cors = require("cors");
const { generatePrompts } = require("./services/promptEngine");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
