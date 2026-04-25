const Prescription = require("../models/Prescription.model");

const symptomMedications = {
  fever: ["Paracetamol", "Ibuprofen", "Aspirin"],
  headache: ["Paracetamol", "Ibuprofen", "Aspirin"],
  cough: ["Dextromethorphan", "Guaifenesin", "Codeine"],
  cold: ["Cetirizine", "Loratadine", "Pseudoephedrine"],
  infection: ["Amoxicillin", "Azithromycin", "Ciprofloxacin"],
  pain: ["Ibuprofen", "Paracetamol", "Diclofenac"],
  allergy: ["Cetirizine", "Loratadine", "Fexofenadine"],
  diabetes: ["Metformin", "Glibenclamide", "Insulin"],
  hypertension: ["Amlodipine", "Enalapril", "Losartan"],
  acidity: ["Omeprazole", "Pantoprazole", "Ranitidine"],
};

exports.getRecommendations = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ success: false, message: "Symptoms are required" });
    }

    const recommended = new Set();
    symptoms.forEach((symptom) => {
      const key = symptom.toLowerCase();
      if (symptomMedications[key]) {
        symptomMedications[key].forEach((med) => recommended.add(med));
      }
    });

    const historical = await Prescription.aggregate([
      { $unwind: "$medications" },
      { $group: { _id: "$medications.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        recommended: Array.from(recommended),
        historical: historical.map((h) => ({ name: h._id, count: h.count })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.chat = async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    // Build Gemini conversation format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: geminiMessages,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.error?.message || "AI service error",
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({ success: false, message: "No response from AI" });
    }

    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
