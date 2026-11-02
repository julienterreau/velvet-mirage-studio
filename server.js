import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '4mb' }));

const DIGEN_API_URL = process.env.DIGEN_API_URL || 'https://api.digen.ai/v1/chat/completions';
const DIGEN_API_KEY = process.env.DIGEN_API_KEY || '';

function makeFallbackProfile(payload) {
  const {
    name = 'Arielle Voss',
    title = 'Princesse des ombres',
    archetype = 'Mystique',
    mood = 'romantique',
    setting = 'Penthouse à Paris',
    energy = 3,
    prompt = ''
  } = payload;

  const description = `Elle s'appelle ${name}, sous le titre de ${title}. C'est une femme ${archetype.toLowerCase()} avec une présence magnétique et une élégance froide. Dans ${setting}, elle incarne une énergie ${mood}, à la fois vulnérable et déterminée. La scène est filmée dans un style luxe noir, lumière cinématique, textures profondes, romance intense mais élégante. `;

  const fallbackPrompt = prompt || [
    `Portrait of ${name}, ${title}, a breathtaking adult woman with elegant cinematic presence,`,
    `in ${setting}, dark romantic luxury aesthetic, dramatic lighting, premium fashion mood,`,
    `soft shadows, elegant silhouette, rich color palette, cinematic composition, refined elegance,`,
    `emotional intensity ${energy}, mature elegance, beautiful face structure, warm and mysterious look.`
  ].join(' ');

  return {
    ok: true,
    source: 'fallback',
    name,
    title,
    archetype,
    mood,
    setting,
    energy,
    backstory: description,
    prompt: fallbackPrompt,
    character: {
      name,
      title,
      archetype,
      setting,
      mood,
      energy,
      prompt: fallbackPrompt
    }
  };
}

async function callDigen(payload) {
  if (!DIGEN_API_KEY || !DIGEN_API_URL) {
    return null;
  }

  try {
    const response = await fetch(DIGEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DIGEN_API_KEY}`
      },
      body: JSON.stringify({
        model: 'default',
        temperature: 0.9,
        messages: [
          {
            role: 'system',
            content: `You are a premium dark romantic fantasy character designer. Keep the tone elegant, cinematic, mature, and non-explicit. Preserve the subject's identity when a reference image is provided. Do not force a medieval costume or fixed archetype unless requested. Let the look remain free and creative while keeping premium fantasy and modern luxury vibes.`
          },
          {
            role: 'user',
            content: JSON.stringify(payload, null, 2)
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Digen error: ${response.status}`);
    }

    const data = await response.json();

    if (typeof data?.choices?.[0]?.message?.content === 'string') {
      return { ok: true, source: 'digen', content: data.choices[0].message.content };
    }

    if (typeof data?.output_text === 'string') {
      return { ok: true, source: 'digen', content: data.output_text };
    }

    return { ok: true, source: 'digen', content: JSON.stringify(data, null, 2) };
  } catch (error) {
    console.error('Digen call failed:', error.message);
    return null;
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Velvet Mirage API is running.' });
});

app.post('/api/profile', async (req, res) => {
  const payload = req.body || {};

  const digenResult = await callDigen({
    intent: 'character_profile',
    ...payload,
    style: 'dark romantic cinematic premium',
    constraints: 'No explicit content, no abuse, no non-consensual scenes, no gore. Keep adult elegance and freedom of creative interpretation.'
  });

  if (digenResult) {
    let parsed = digenResult.content;
    try {
      parsed = JSON.parse(digenResult.content);
    } catch (_err) {
      // keep raw string text if not JSON
    }

    return res.json({
      ok: true,
      source: 'digen',
      ...makeFallbackProfile(payload),
      ...((parsed && typeof parsed === 'object') ? parsed : { narrative: digenResult.content })
    });
  }

  return res.json(makeFallbackProfile(payload));
});

app.post('/api/chat', async (req, res) => {
  const payload = req.body || {};
  const history = Array.isArray(payload.history) ? payload.history : [];
  const message = payload.message || 'Parle-moi comme une héroïne mystérieuse et fascinante.';

  const digenResult = await callDigen({
    intent: 'roleplay_chat',
    character: payload.character || {},
    history,
    message,
    tone: 'dark romantic mature cinematic, elegant, emotionally rich, non-explicit'
  });

  if (digenResult) {
    return res.json({
      ok: true,
      source: 'digen',
      reply: digenResult.content,
      message
    });
  }

  return res.json({
    ok: true,
    source: 'fallback',
    reply: `Je suis ${payload.character?.name || 'Arielle'}, et je me souviens de toi. Tu as posé une question, je le garde en mémoire. Continue et je répondrai avec la même intensité, la même élégance et la même tension...`,
    message
  });
});

app.post('/api/scene', async (req, res) => {
  const payload = req.body || {};
  const digenResult = await callDigen({
    intent: 'scene_generation',
    ...payload,
    style: 'dark romantic cinematic scene in a premium adult setting',
    constraints: 'No explicit content, no abuse, no non-consensual scenes, no gore.'
  });

  if (digenResult) {
    return res.json({ ok: true, source: 'digen', scene: digenResult.content });
  }

  return res.json({
    ok: true,
    source: 'fallback',
    scene: `${payload.character?.name || 'La héroïne'} attend dans un salon aux lumières basses. Le silence est lourd. Le désir est dans l'air, mais la tension est élégante et maîtrisée. La scène prend une tournure dramatique et raffinée, avec un parfum de mystère, de loyauté et de passion contenue.`
  });
});

const distPath = path.join(__dirname, 'dist');
const hasDist = path.existsSync(distPath);

if (hasDist) {
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

app.listen(port, () => {
  console.log(`Velvet Mirage API listening on http://localhost:${port}`);
});
