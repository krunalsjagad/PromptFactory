const fs = require("fs");
const path = require("path");

// 1. Load the template ONCE at the top level
const templatePath = path.join(__dirname, "../templates/universal_app_builder_v1.json");
let TEMPLATE_CACHE = null;

try {
  const fileData = fs.readFileSync(templatePath, "utf8");
  TEMPLATE_CACHE = JSON.parse(fileData);
} catch (err) {
  console.error("Failed to load prompt template:", err);
  process.exit(1); // Kill server if critical file is missing
}

const interpolate = (text, data) => {
  if (!text) return "";
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data[key] ?? `{{${key}}}`;
  });
};

const generatePrompts = (userInput) => {
  if (!userInput || !userInput.application_type || !userInput.experience_level) {
    throw new Error("Invalid user input");
  }

  // 2. Use the cached variable instead of reading the file again
  const template = TEMPLATE_CACHE;

  const {
    application_type,
    experience_level,
    technology_preference,
    selected_stack
  } = userInput;

  // Resolve experience modifier
  const experienceMod =
    template.context_template.experience_modifier?.[experience_level] || "";

  // Resolve technology instruction
  let techInstruction = "";
  if (technology_preference === "let_ai_decide") {
    techInstruction = template.global_rules.technology_selection_rule.then;
  } else {
    techInstruction = `User selected tech: ${
      selected_stack || "As defined in architecture"
    }. ${template.global_rules.technology_selection_rule.else}`;
  }

  // Build context string
  let contextString = [
    template.context_template.base,
    experienceMod,
    techInstruction,
    template.context_template.constraints_modifier || ""
  ].join(" ");

  contextString = interpolate(contextString, { application_type });

  // Generate prompts
  return template.prompt_sequence.map((step) => {
    const instructionsList = step.instructions.map(i => `- ${i}`).join("\n");
    const constraintsList = step.constraints.map(c => `- ${c}`).join("\n");
    const outputFormatList = step.output_format.map(o => `- ${o}`).join("\n");

    const stepData = {
      role: step.role,
      context: contextString,
      objective: step.objective,
      instructions: instructionsList,
      constraints: constraintsList,
      output_format: outputFormatList
    };

    const promptText = template.prompt_wrapper.structure.join("\n");

    return {
      step_number: step.step,
      stage: step.stage,
      role: step.role,
      content: interpolate(promptText, stepData)
    };
  });
};

module.exports = { generatePrompts };
