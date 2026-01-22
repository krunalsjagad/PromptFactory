const express = require("express");
const router = express.Router();
const { generatePrompts } = require("../services/promptEngine");

router.post("/generate", (req, res) => {
  try {
    const prompts = generatePrompts(req.body);
    res.json({ success: true, data: prompts });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
