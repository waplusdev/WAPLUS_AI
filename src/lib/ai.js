/**
 * AI engine used by the .ai command.
 * Add ONE of these keys to your .env:
 *   GROQ_API_KEY    (free, fastest)  → https://console.groq.com/keys
 *   GEMINI_API_KEY  (free tier)      → https://aistudio.google.com/apikey
 *   OPENAI_API_KEY                   → https://platform.openai.com/api-keys
 *
 * Each chat keeps a short memory so the AI remembers the conversation.
 */
const config = require('../../config');

const memory = new Map();
const MAX_TURNS = 10;

const PROVIDERS = {
  groq: {
    key: 'GROQ_API_KEY',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
  openai: {
    key: 'OPENAI_API_KEY',
    url: 'https://api.openai.com/v1/chat/completions',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
};

function pickProvider() {
  const wanted = config.ai.provider.toLowerCase();
  if (wanted !== 'auto') return wanted;
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return null;
}

async function openAiCompatible(name, messages) {
  const p = PROVIDERS[name];
  const res = await fetch(p.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env[p.key]}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: p.model, messages, temperature: 0.7, max_tokens: 1024 }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || `${name} HTTP ${res.status}`);
  return json.choices?.[0]?.message?.content?.trim() || '';
}

async function gemini(messages) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const [system, ...chat] = messages;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system.content }] },
      contents: chat.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || `gemini HTTP ${res.status}`);
  return json.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim() || '';
}

async function ask(chatId, prompt) {
  const provider = pickProvider();
  if (!provider) throw new Error('No AI key found. Add GROQ_API_KEY, GEMINI_API_KEY or OPENAI_API_KEY to .env');

  const history = memory.get(chatId) || [];
  const messages = [{ role: 'system', content: config.ai.system }, ...history, { role: 'user', content: String(prompt).slice(0, 6000) }];

  const answer = provider === 'gemini' ? await gemini(messages) : await openAiCompatible(provider, messages);

  history.push({ role: 'user', content: prompt }, { role: 'assistant', content: answer });
  memory.set(chatId, history.slice(-MAX_TURNS * 2));
  return { answer, provider };
}

const reset = (chatId) => memory.delete(chatId);

module.exports = { ask, reset, pickProvider };
