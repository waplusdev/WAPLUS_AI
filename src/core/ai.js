// Groq api key may be supported — added
let geminiModel = null;

async function generate(prompt, options = {}) {
  const provider = (options.provider || process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const system = options.system || process.env.AI_SYSTEM_PROMPT || 'You are WaPlus AI, a concise helpful WhatsApp assistant.';
  const input = String(prompt).slice(0, 8000);

  // › GEMINI
  if (provider === 'gemini') {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    if (!geminiModel) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      geminiModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        systemInstruction: system
      });
    }
    const r = await geminiModel.generateContent(input);
    return r.response.text().trim();
  }

  // › OPENAI
  if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');
    const r = await fetch(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'system', content: system }, { role: 'user', content: input }],
        temperature: options.temperature?? 0.7
      })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || `OpenAI HTTP ${r.status}`);
    return d.choices?.[0]?.message?.content?.trim() || '';
  }

  // › GROQ - OpenAI compatible
  if (provider === 'groq') {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');
    const r = await fetch(process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: system }, { role: 'user', content: input }],
        temperature: options.temperature?? 0.7,
        max_tokens: options.max_tokens?? 1024
      })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || `Groq HTTP ${r.status}`);
    return d.choices?.[0]?.message?.content?.trim() || '';
  }

  // › fallback: auto-detect available key
  if (provider === 'auto') {
    if (process.env.GROQ_API_KEY) return generate(prompt, {...options, provider: 'groq' });
    if (process.env.GEMINI_API_KEY) return generate(prompt, {...options, provider: 'gemini' });
    if (process.env.OPENAI_API_KEY) return generate(prompt, {...options, provider: 'openai' });
    throw new Error('No AI key found: set GROQ_API_KEY / GEMINI_API_KEY / OPENAI_API_KEY');
  }

  throw new Error(`Unsupported AI_PROVIDER: ${provider} (use: gemini | openai | groq | auto)`);
}

module.exports = { generate };