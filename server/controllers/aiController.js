const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const callGroq = async (prompt) => {
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    max_tokens: 1024,
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content || 'No response generated.';
};

// @POST /api/ai/chat
const chat = async (req, res) => {
  try {
    const { message, role, history } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const systemContext = role === 'hospital'
      ? `You are UnityCure AI, a smart assistant for hospital administrators. 
         Help with patient management, resource allocation, medical protocols, 
         emergency procedures, and healthcare operations.
         Be concise, professional, and medically accurate.`
      : `You are UnityCure AI, a friendly health assistant for patients.
         Help with general health queries, symptoms, medication information,
         appointment guidance, and wellness tips.
         Always recommend consulting a real doctor for serious concerns.`;

    let conversationPrompt = systemContext + '\n\n';

    if (history && history.length > 0) {
      history.slice(-6).forEach(msg => {
        conversationPrompt += (msg.role === 'user' ? 'User: ' : 'Assistant: ') + msg.content + '\n';
      });
    }

    conversationPrompt += 'User: ' + message + '\nAssistant:';

    const reply = await callGroq(conversationPrompt);
    res.json({ reply });
  } catch (err) {
    console.error('AI CHAT ERROR:', err.message);
    res.status(500).json({ message: 'AI service error', error: err.message });
  }
};

// @POST /api/ai/translate
const translateReport = async (req, res) => {
  try {
    const { text, direction } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const isEnToHi = direction === 'en-hi';
    const prompt = isEnToHi
      ? `Translate this medical text from English to Hindi. Provide ONLY the Hindi translation.\n\nText:\n${text}`
      : `Translate this medical text from Hindi to English. Provide ONLY the English translation.\n\nText:\n${text}`;

    const translated = await callGroq(prompt);
    res.json({ translated, direction });
  } catch (err) {
    console.error('TRANSLATE ERROR:', err.message);
    res.status(500).json({ message: 'Translation error', error: err.message });
  }
};

// @POST /api/ai/summarize
const summarizeReport = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const prompt = `Summarize this medical report in simple language for a patient.

Structure your response as:
**Key Findings:** (bullet points)
**What This Means:** (simple explanation)  
**Recommended Actions:** (what patient should do)

Medical Report:
${text}`;

    const summary = await callGroq(prompt);
    res.json({ summary });
  } catch (err) {
    console.error('SUMMARIZE ERROR:', err.message);
    res.status(500).json({ message: 'Summarization error', error: err.message });
  }
};

module.exports = { chat, translateReport, summarizeReport };