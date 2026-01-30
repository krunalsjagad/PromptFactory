"use client";
import { useState, useEffect } from "react";

// 1. Mapping Object for Dynamic Tech Stacks
const TECH_STACKS = {
  website: [
    "Next.js", "React", "Vue", "Angular", "HTML/CSS", 
    "JavaScript (Vanilla)", "Bootstrap", "Django (Python)", 
    "Spring Boot (Java)", "PHP", "Laravel"
  ],
  mobile_app: [
    "Flutter", "React Native", "Swift (iOS)", 
    "Kotlin (Android)", "Java (Android)", "Xamarin"
  ],
  desktop_app: [
    "Electron", "Tauri", "C# (.NET)", "Python (Qt)", 
    "JavaFX", "Swing", "GTK (C/C++)", "WPF (.NET)"
  ],
};

export default function GeneratorForm() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [formData, setFormData] = useState({
    application_type: "website",
    experience_level: "student",
    technology_preference: "let_ai_decide",
    selected_stack: "", // Now will hold the dropdown value
    target_ai: "chatgpt",
    ui_style: "basic",
    architecture_style: "monolithic",
  });

  // 2. Reset tech selection when app type changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, selected_stack: "" }));
  }, [formData.application_type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.application_type) {
      alert("Please select an application type.");
      return;
    }
    // Validation: if user wants to choose, they must pick one
    if (formData.technology_preference === "user_selected" && !formData.selected_stack) {
        alert("Please select a technology stack.");
        return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, userId: "guest_user" };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 429) { // 429 is the standard code for Too Many Requests
      alert(data.error); // Shows "Daily generation limit reached..."
      return;
      }

      if (data.success) {
        setResults(data.data);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const RadioChip = ({ name, value, label, current }) => (
    <label className={`cursor-pointer px-6 py-2 rounded-full border-2 text-sm font-medium transition-all select-none ${
      current === value 
        ? "bg-indigo-500 border-indigo-500 text-white shadow-md" 
        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"
    }`}>
      <input type="radio" name={name} value={value} checked={current === value} onChange={handleChange} className="hidden" />
      {label}
    </label>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4 font-sans relative">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden p-8 md:p-12 transition-all duration-300">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">PromptFactory</h1>
          <p className="text-gray-500 mt-2">Design the perfect AI engineering prompt.</p>
        </div>

        {!results ? (
          <div className="space-y-8">
            {/* 1. App Type */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">What are you building?</label>
              <div className="relative">
                <select name="application_type" value={formData.application_type} onChange={handleChange} className="w-full appearance-none bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all">
                  <option value="website">Website</option>
                  <option value="mobile_app">Mobile App</option>
                  <option value="desktop_app">Desktop Application</option>
                </select>
              </div>
            </div>

            {/* 2. Experience Level */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3">Your Experience Level</label>
              <div className="flex flex-wrap gap-3">
                <RadioChip name="experience_level" value="student" label="Student" current={formData.experience_level} />
                <RadioChip name="experience_level" value="beginner" label="Beginner" current={formData.experience_level} />
                <RadioChip name="experience_level" value="professional" label="Professional" current={formData.experience_level} />
              </div>
            </div>

            {/* 3. Tech Strategy - UPDATED FOR DYNAMIC DROPDOWN */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3">Technology Preference</label>
              <div className="flex flex-wrap gap-3 mb-4">
                <RadioChip name="technology_preference" value="let_ai_decide" label="Let AI Decide" current={formData.technology_preference} />
                <RadioChip name="technology_preference" value="user_selected" label="I will choose" current={formData.technology_preference} />
              </div>

              {formData.technology_preference === "user_selected" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <select 
                    name="selected_stack" 
                    value={formData.selected_stack} 
                    onChange={handleChange} 
                    className="w-full bg-gray-50 border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  >
                    <option value="">-- Select a Stack --</option>
                    {TECH_STACKS[formData.application_type].map((tech) => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 4. UI Style */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3">UI Design Style</label>
              <div className="flex flex-wrap gap-3">
                <RadioChip name="ui_style" value="basic" label="Basic / Minimal" current={formData.ui_style} />
                <RadioChip name="ui_style" value="modern" label="Modern" current={formData.ui_style} />
                <RadioChip name="ui_style" value="professional" label="Corporate" current={formData.ui_style} />
              </div>
            </div>

            {/* 5. Target AI */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Target AI Model</label>
              <select name="target_ai" value={formData.target_ai} onChange={handleChange} className="w-full bg-gray-50 border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-lg focus:outline-none focus:border-indigo-500">
                <option value="chatgpt">ChatGPT (OpenAI)</option>
                <option value="gemini">Gemini (Google)</option>
                <option value="claude">Claude (Anthropic)</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transform transition hover:-translate-y-0.5 ${
                loading ? "bg-indigo-300 cursor-wait" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30"
              }`}
            >
              {loading ? "Engineering Prompts..." : "Generate Blueprints 🚀"}
            </button>
          </div>
        ) : (
          /* RESULTS VIEW REMAINS SAME AS YOURS */
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Your Blueprints</h2>
              <button onClick={() => setResults(null)} className="text-sm text-gray-500 hover:text-indigo-600 underline decoration-2 underline-offset-4">
                ← Edit Choices
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {results.map((prompt, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-indigo-700 text-sm tracking-wide uppercase">Step {prompt.step_number}: {prompt.stage}</span>
                    <button onClick={() => handleCopy(prompt.content, index)} className="text-xs bg-white border border-gray-300 hover:border-indigo-500 text-gray-600 hover:text-indigo-600 px-3 py-1 rounded-md transition-colors">{copiedIndex === index ? "Copied" : "Copy"}</button>
                  </div>
                  <pre className="text-xs md:text-sm text-gray-600 whitespace-pre-wrap font-mono leading-relaxed bg-white p-4 rounded border border-gray-100">{prompt.content}</pre>
                </div>
              ))}
            </div>

            <button onClick={() => setResults(null)} className="w-full py-3 mt-4 rounded-xl font-semibold text-gray-600 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">Generate New Project</button>
          </div>
        )}
      </div>
    </div>
  );
}