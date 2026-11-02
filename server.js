import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);

const DIGEN_BASE_URL =
  process.env.DIGEN_BASE_URL ||
  'https://api.digen.ai/v2/gateway/agent/openapi/v1';

const DIGEN_API_KEY = process.env.DIGEN_API_KEY;

app.use(cors());
app.use(express.json({ limit: '4mb' }));

function getDigenHeaders() {
  if (!DIGEN_API_KEY) {
    throw new Error('Missing DIGEN_API_KEY');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${DIGEN_API_KEY}`,
    'X-API-Key': DIGEN_API_KEY
  };
}

function fallbackProfile(payload = {}) {
  const {
    name = 'Arielle Voss',
    title = 'Princesse des ombres',
    archetype = 'Mystique',
    mood = 'romantique',
    setting = 'Penthouse à Paris',
    world = 'Royaume lunaire',
    energy = 3,
    prompt = ''
  } = payload;

  const fallbackPrompt =
    prompt ||
    [
      `Portrait of ${name}, ${title}, a breathtaking adult woman with elegant cinematic presence,`,
      `in ${world}, ${mood} mood, luxury noir palette, dramatic lighting, premium fashion composition,`,
      `dark romantic aesthetic, beautiful mature features, refined silhouette, cinematic texture,`,
      `soft gold and shadow contrast, emotional tension, strong feminine presence, intensity ${energy}.`
    ].join(' ');

  return {
    ok: true,
    source: 'fallback',
    name,
    title,
    archetype,
    mood,
    setting,
    world,
    energy,
    prompt: fallbackPrompt,
    backstory:
      `${name}, connue sous le nom de ${title}, inspire une présence presque surnaturelle dans ${setting}. ` +
      `Sa beauté est maîtrisée, élégante, presque inévitable, avec une énergie ${mood} et une aura de pouvoir discret. ` +
      `Elle sait dominer la scène sans effort, avec un mélange de mystère, de charme et de détermination.`
  };
}

async function createConversation() {
  const res = await fetch(`${DIGEN_BASE_URL}/conversations`, {
    method: 'POST',
    headers: getDigenHeaders(),
    body: JSON.stringify({
      title: 'Velvet Mirage character session',
      metadata: {
        app: 'velvet-mirage-studio'
      }
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`createConversation failed: ${res.status} ${text}`);
  }

  return res.json();
}

async function readSSE(response) {
  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    return text;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
  }

  const blocks = buffer
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  let result = '';

  for (const block of blocks) {
    const lines = block.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;

      const raw = line.replace(/^data:\s*/, '').trim();
      if (!raw || raw === '[DONE]') continue;

      try {
        const parsed = JSON.parse(raw);

        const candidate =
          parsed?.content ??
          parsed?.text ??
          parsed?.answer ??
          parsed?.message?.content ??
          parsed?.delta ??
          parsed?.data?.content ??
          parsed?.output ??
          parsed?.choices?.[0]?.delta?.content ??
          parsed?.choices?.[0]?.message?.content;

        if (candidate) {
          result += Array.isArray(candidate) ? candidate.join('') : String(candidate);
        }
      } catch {
        result += raw;
      }
    }
  }

  return result || buffer;
}

async function sendChat(conversationId, message, context = {}) {
  const res = await fetch(`${DIGEN_BASE_URL}/chat`, {
    method: 'POST',
    headers: getDigenHeaders(),
    body: JSON.stringify({
      conversation_id: conversationId,
      message,
      stream: true,
      context,
      role: 'user'
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`chat failed: ${res.status} ${text}`);
  }

  return readSSE(res);
}

function buildCharacterPrompt(payload) {
  const {
    name = 'Arielle Voss',
    title = 'Princesse des ombres',
    archetype = 'Mystique',
    mood = 'romantique',
    setting = 'Penthouse à Paris',
    world = 'Royaume lunaire',
    energy = 3,
    silhouette = 'royale',
    prompt = ''
  } = payload;

  if (prompt) return prompt;

  return [
    'Create a premium dark romantic cinematic heroine inspired by this profile:',
    `Name: ${name}`,
    `Title: ${title}`,
    `Archetype: ${archetype}`,
    `Mood: ${mood}`,
    `World: ${world}`,
    `Setting: ${setting}`,
    `Silhouette: ${silhouette}`,
    `Energy: ${energy}`,
    'Style: luxurious dark romance, mature elegance, cinematic lighting, dramatic shadows, premium fashion, refined sensuality, beautiful facial structure, natural beauty, emotional intensity.',
    'Avoid explicit sexual content, abuse, coercion, gore, and degrading scenes.',
    'Keep the character visually elegant, free, and believable.'
  ].join('\n');
}

function buildScenePrompt(payload) {
  const {
    name = 'Arielle',
    title = 'Princesse des ombres',
    archetype = 'Mystique',
    mood = 'romantique',
    setting = 'Penthouse à Paris',
    world = 'Royaume lunaire'
  } = payload;

  return [
    'Write one elegant cinematic scene in a dark romantic premium setting.',
    `Character: ${name}, ${title}, ${archetype}`,
    `Setting: ${setting}, ${world}`,
    `Mood: ${mood}`,
    'Tone: mature, elegant, emotional, sexy but tasteful, non-explicit, cinematic.',
    'Use atmospheric prose, rich romantic tension, refined dialogue, and strong visual detail.'
  ].join('\n');
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Velvet Mirage API running' });
});

app.post('/api/profile', async (req, res) => {
  try {
    const payload = req.body || {};
    const prompt = buildCharacterPrompt(payload);

    if (!DIGEN_API_KEY) {
      return res.json(fallbackProfile(payload));
    }

    const conversation = await createConversation();
    const output = await sendChat(conversation.id, prompt, {
      kind: 'profile',
      payload
    });

    return res.json({
      ok: true,
      source: 'digen',
      name: payload.name || 'Arielle Voss',
      title: payload.title || 'Princesse des ombres',
      archetype: payload.archetype || 'Mystique',
      prompt,
      backstory: output || `${payload.name || 'Arielle'} est une héroïne élégante, mystérieuse et magnétique.`
    });
  } catch (err) {
    console.error('PROFILE ERROR:', err);
    return res.json(fallbackProfile(req.body || {}));
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, character, history = [] } = req.body || {};
    const prompt = message || 'Parle-moi comme une héroïne mystérieuse et fascinante.';

    if (!DIGEN_API_KEY) {
      return res.json({
        ok: true,
        source: 'fallback',
        reply:
          `Je suis ${character?.name || 'Arielle'}, et je me souviens de toi. ` +
          `Continue en gardant le même ton, la même présence et la même intensité.`
      });
    }

    const conversation = await createConversation();
    const output = await sendChat(conversation.id, prompt, {
      character: character || {},
      history,
      tone: 'dark romantic premium, elegant and mature, non-explicit'
    });

    return res.json({
      ok: true,
      source: 'digen',
      reply: output || '...',
      message: prompt
    });
  } catch (err) {
    console.error('CHAT ERROR:', err);
    return res.json({
      ok: true,
      source: 'fallback',
      reply:
        `Je suis ${req.body?.character?.name || 'Arielle'}, et je me souviens de toi. ` +
        `Continue la conversation, je garde le même ton, la même présence et la même intensité.`,
      message: req.body?.message || ''
    });
  }
});

app.post('/api/scene', async (req, res) => {
  try {
    const payload = req.body || {};
    const prompt = buildScenePrompt(payload);

    if (!DIGEN_API_KEY) {
      return res.json({
        ok: true,
        source: 'fallback',
        scene:
          `${payload.name || 'La héroïne'} attend dans une pièce aux lumières basses. ` +
          `Le silence est lourd, la tension est élégante, la romance est raffinée et mystérieuse.`
      });
    }

    const conversation = await createConversation();
    const output = await sendChat(conversation.id, prompt, {
      kind: 'scene',
      payload
    });

    return res.json({
      ok: true,
      source: 'digen',
      scene: output || 'Scene default'
    });
  } catch (err) {
    console.error('SCENE ERROR:', err);
    return res.json({
      ok: true,
      source: 'fallback',
      scene:
        `${req.body?.name || 'La héroïne'} attend dans une pièce aux lumières basses. ` +
        `Le silence est lourd, la tension est élégante, le mystère est présent, et la romance devient presque palpable.`
    });
  }
});

const distPath = path.join(__dirname, 'dist');

if (path.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res.json({
      ok: true,
      message: 'API ready. Run npm run build to serve the frontend bundle.'
    });
  });
}

app.listen(PORT, () => {
  console.log(`Velvet Mirage API listening on http://localhost:${PORT}`);
});
