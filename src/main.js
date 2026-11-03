const archetypes = {
  warrior: {
    label: 'Guerrière',
    traits: ['fière', 'résolue', 'protectrice', 'décisive'],
    style: 'armure élégante, posture impériale, attitude de commandement'
  },
  duchess: {
    label: 'Duchesse',
    traits: ['élégante', 'intrigante', 'raffinée', 'charismatique'],
    style: 'robe de velours noir, bijoux anciens, présence aristocratique'
  },
  mystic: {
    label: 'Mystique',
    traits: ['énigmatique', 'sensible', 'profond', 'ensorceleuse'],
    style: 'lumière lunaire, voile translucide, regards captivants'
  },
  amazon: {
    label: 'Amazone',
    traits: ['puissante', 'libre', 'athlétique', 'imposante'],
    style: 'silhouette sculptée, posture guerrière, allure majestueuse'
  },
  queen: {
    label: 'Impératrice',
    traits: ['majestueuse', 'implacable', 'dominante', 'radiant'],
    style: 'robe royale, aura de commandement, beauté souveraine'
  }
};

const worldOptions = {
  'moonlit kingdom': ['palais lunaire', 'vignes sombres', 'cours de marbre'],
  'sunset citadel': ['dômes en or', 'désert rouge', 'coucher de soleil royal'],
  'temple of ash': ['voiles de cendre', 'pilliers antique', 'lumière sacrée'],
  'battle palace': ['hall de guerre', 'tentes impériales', 'archers sur les remparts'],
  'sable empire': ['dunes dorées', 'vent mystique', 'sérénité sacrée']
};

const moods = {
  dangerous: 'dynamique dangereuse et magnétique',
  romantic: 'romance passionnée et tendre',
  mystic: 'mystère ancien et fascination silencieuse',
  elegant: 'élégance aristocratique et présence rare',
  royal: 'prestige royal et volonté de commandement'
};

const silhouettes = {
  amazon: 'silhouette amazone, hanches sculptées, posture majestueuse',
  fitted: 'silhouette cintrée, corsage ajusté, élégance aérienne',
  royal: 'robe royale moulante, allure souveraine, présence impériale',
  velvet: 'robe en velours sombre, ligne fluide, glamour discret'
};

const firstNames = ['Selene', 'Lysandra', 'Aurelia', 'Nerissa', 'Vesper', 'Cassia', 'Maeve', 'Ilyra', 'Sabrina', 'Elaria'];
const lastNames = ['Veyr', 'Dorian', 'Vale', 'Ashen', 'Montrose', 'Sable', 'Raven', 'Cairn', 'Voss', 'Noir'];

const titleInput = document.querySelector('#titleInput');
const nameInput = document.querySelector('#nameInput');
const archetypeSelect = document.querySelector('#archetypeSelect');
const worldSelect = document.querySelector('#worldSelect');
const moodSelect = document.querySelector('#moodSelect');
const silhouetteSelect = document.querySelector('#silhouetteSelect');
const energySelect = document.querySelector('#energySelect');
const imageUpload = document.querySelector('#imageUpload');
const promptInput = document.querySelector('#promptInput');

const characterName = document.querySelector('#characterName');
const characterTitle = document.querySelector('#characterTitle');
const characterRole = document.querySelector('#characterRole');
const characterWorld = document.querySelector('#characterWorld');
const traitList = document.querySelector('#traitList');
const backstoryText = document.querySelector('#backstoryText');
const promptOutput = document.querySelector('#promptOutput');
const portraitImage = document.querySelector('#portraitImage');

const qaName = document.querySelector('#qaName');
const qaArchetype = document.querySelector('#qaArchetype');
const qaWorld = document.querySelector('#qaWorld');
const qaEnergy = document.querySelector('#qaEnergy');
const qaTraits = document.querySelector('#qaTraits');
const qaPromptLength = document.querySelector('#qaPromptLength');
const qaSilhouette = document.querySelector('#qaSilhouette');
const qaImageStatus = document.querySelector('#qaImageStatus');
const qaJsonOutput = document.querySelector('#qaJsonOutput');
const qaHistoryList = document.querySelector('#qaHistoryList');

let history = [];

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function createPrompt(finalName, title, archetype, world, mood, energy, silhouette) {
  const worldDetail = randomFrom(worldOptions[world]);
  return [
    `Portrait of ${finalName}, ${title}, a breathtaking adult woman with ${archetype.style},`,
    `in a ${world} environment, ${moods[mood]},`,
    `luxury cinematic lighting, dramatic composition, immaculate skin, elegant dark fantasy wardrobe,`,
    `${silhouettes[silhouette]}, strong delicate features, piercing expressive eyes,`,
    `haute couture atmosphere, romantic tension, atmospheric shadows, soft gold and noir palette,`,
    `${worldDetail}, rich cinematic textures, intense presence, refined beauty, elegant motion,`,
    `photorealistic portrait, dramatic focus, premium fantasy art, intensity ${energy}.`
  ].join(' ');
}

function buildCharacter() {
  const customName = nameInput.value.trim();
  const customTitle = titleInput.value.trim();
  const archetype = archetypes[archetypeSelect.value];
  const world = worldSelect.value;
  const mood = moodSelect.value;
  const energy = Number(energySelect.value);
  const silhouette = silhouetteSelect.value;

  const finalName = customName || `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
  const finalTitle = customTitle || `Noble de ${world}`;
  const selectedTraits = [...archetype.traits];

  while (selectedTraits.length < 4) {
    selectedTraits.push(randomFrom(Object.values(archetypes).flatMap((entry) => entry.traits)));
  }

  const story = `${finalName}, connue sous le nom de ${finalTitle}, domine ${world} avec une présence presque surnaturelle. D’une élégance glacée et d’un courage sans faille, elle séduit par son mystère et impose le respect.`;

  const generatedPrompt = createPrompt(finalName, finalTitle, archetype, world, mood, energy, silhouette);
  const promptValue = promptInput.value.trim() || generatedPrompt;

  characterName.textContent = finalName;
  characterTitle.textContent = finalTitle;
  characterRole.textContent = archetype.label;
  characterWorld.textContent = world;

  traitList.innerHTML = selectedTraits
    .slice(0, 4)
    .map((trait) => `<span class="trait">${trait}</span>`)
    .join('');

  backstoryText.textContent = story;
  promptOutput.textContent = promptValue;
  promptInput.value = promptValue;

  const state = {
    name: finalName,
    title: finalTitle,
    archetype: archetype.label,
    world,
    mood,
    energy,
    silhouette,
    traits: selectedTraits.slice(0, 4),
    prompt: promptValue,
    history: story,
    hasImage: Boolean(portraitImage.src && portraitImage.src !== window.location.href),
    timestamp: new Date().toISOString()
  };

  updateDashboard(state);
  history = [state, ...history].slice(0, 5);
  renderHistory();
}

function updateDashboard(state) {
  qaName.textContent = state.name;
  qaArchetype.textContent = state.archetype;
  qaWorld.textContent = state.world;
  qaEnergy.textContent = state.energy;
  qaTraits.textContent = state.traits.length;
  qaPromptLength.textContent = String(state.prompt.length);
  qaSilhouette.textContent = state.silhouette;
  qaImageStatus.textContent = state.hasImage ? 'Oui' : 'Aucun';

  qaJsonOutput.textContent = JSON.stringify({
    name: state.name,
    title: state.title,
    archetype: state.archetype,
    world: state.world,
    mood: state.mood,
    energy: state.energy,
    silhouette: state.silhouette,
    traits: state.traits,
    promptLength: state.prompt.length,
    hasImage: state.hasImage,
    prompt: state.prompt
  }, null, 2);
}

function renderHistory() {
  qaHistoryList.innerHTML = history
    .map((item) => `<li><strong>${item.name}</strong> — ${item.archetype} / ${item.world}</li>`)
    .join('');
}

function shuffleCharacter() {
  const randomName = `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
  const randomTitle = `${randomFrom(['Duchesse', 'Reine', 'Gardienne', 'Élue', 'Commandante'])} des ${randomFrom(['ombres', 'dunes', 'flammes', 'lunes', 'cendres'])}`;

  nameInput.value = randomName;
  titleInput.value = randomTitle;
  archetypeSelect.value = randomFrom(Object.keys(archetypes));
  worldSelect.value = randomFrom(Object.keys(worldOptions));
  moodSelect.value = randomFrom(Object.keys(moods));
  silhouetteSelect.value = randomFrom(Object.keys(silhouettes));
  energySelect.value = String(Math.floor(Math.random() * 4) + 1);
  buildCharacter();
}

function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    portraitImage.src = loadEvent.target.result;
    portraitImage.classList.add('visible');
    buildCharacter();
  };
  reader.readAsDataURL(file);
}

async function copyPrompt() {
  const text = promptInput.value.trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    promptInput.focus();
    promptInput.select();
  } catch (error) {
    console.warn('Clipboard not available:', error);
  }
}

function downloadJson() {
  const payload = {
    name: characterName.textContent,
    title: characterTitle.textContent,
    archetype: characterRole.textContent,
    world: characterWorld.textContent,
    prompt: promptInput.value.trim(),
    backstory: backstoryText.textContent,
    traits: Array.from(document.querySelectorAll('.trait')).map((item) => item.textContent),
    hasImage: Boolean(portraitImage.src && portraitImage.src !== window.location.href)
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'velvet-mirage-character.json';
  link.click();
  URL.revokeObjectURL(url);
}

function exportCardAsPng() {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#100d14');
  gradient.addColorStop(0.5, '#1b1522');
  gradient.addColorStop(1, '#170f1a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cardX = 70;
  const cardY = 80;
  const cardW = 1060;
  const cardH = 740;
  ctx.fillStyle = 'rgba(24, 18, 31, 0.9)';
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();
  ctx.stroke();

  const portraitX = 120;
  const portraitY = 180;
  const portraitW = 320;
  const portraitH = 420;

  if (portraitImage.src && portraitImage.src !== window.location.href) {
    const img = new Image();
    img.onload = () => {
      ctx.save();
      roundRect(ctx, portraitX, portraitY, portraitW, portraitH, 28);
      ctx.clip();
      ctx.drawImage(img, portraitX, portraitY, portraitW, portraitH);
      ctx.restore();
      drawTextLayer(ctx);
      downloadCanvas(canvas);
    };
    img.src = portraitImage.src;
    return;
  }

  const artGradient = ctx.createRadialGradient(
    portraitX + 150,
    portraitY + 80,
    20,
    portraitX + 150,
    portraitY + 150,
    260
  );
  artGradient.addColorStop(0, 'rgba(255,255,255,0.25)');
  artGradient.addColorStop(0.4, 'rgba(255, 154, 170, 0.33)');
  artGradient.addColorStop(1, 'rgba(18,12,20,0.9)');
  ctx.fillStyle = artGradient;
  roundRect(ctx, portraitX, portraitY, portraitW, portraitH, 28);
  ctx.fill();

  drawTextLayer(ctx);
  downloadCanvas(canvas);
}

function drawTextLayer(ctx) {
  const title = characterName.textContent || 'Velvet Mirage';
  const subtitle = characterTitle.textContent || 'Reine des dunes';
  const archetype = characterRole.textContent || 'Guerrière';
  const world = characterWorld.textContent || 'royaume de lune';
  const textX = 510;
  const textY = 220;

  ctx.fillStyle = '#f7ebff';
  ctx.font = '700 48px Inter, sans-serif';
  ctx.fillText(title, textX, textY);

  ctx.fillStyle = '#d8c7e5';
  ctx.font = '600 24px Inter, sans-serif';
  ctx.fillText(subtitle, textX, textY + 42);

  ctx.fillStyle = '#ff6dcf';
  ctx.fillRect(textX, textY + 68, 220, 5);

  ctx.fillStyle = '#f3eaf8';
  ctx.font = '500 20px Inter, sans-serif';
  ctx.fillText(`${archetype} • ${world}`, textX, textY + 120);

  const traits = Array.from(document.querySelectorAll('.trait')).map((el) => el.textContent).slice(0, 4);
  ctx.fillStyle = '#f8d797';
  ctx.font = '600 18px Inter, sans-serif';
  traits.forEach((trait, index) => {
    ctx.fillText(`#${trait}`, textX + index * 110, textY + 170);
  });

  const prompt = (promptInput.value || promptOutput.textContent || '').trim();
  const wrapped = wrapText(ctx, prompt, 540, 4);
  ctx.fillStyle = '#f3eaf8';
  ctx.font = '500 18px Inter, sans-serif';
  wrapped.forEach((line, index) => {
    ctx.fillText(line, textX, textY + 245 + index * 28);
  });
}

function wrapText(ctx, text, maxWidth, maxLines) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
    if (lines.length >= maxLines) break;
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  return lines;
}

function downloadCanvas(canvas) {
  const link = document.createElement('a');
  link.download = 'velvet-mirage-card.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

imageUpload.addEventListener('change', handleImageUpload);

document.querySelector('#generateBtn').addEventListener('click', buildCharacter);
document.querySelector('#shuffleBtn').addEventListener('click', shuffleCharacter);
document.querySelector('#copyPromptBtn').addEventListener('click', copyPrompt);
document.querySelector('#downloadJsonBtn').addEventListener('click', downloadJson);
document.querySelector('#exportPngBtn').addEventListener('click', exportCardAsPng);

promptInput.addEventListener('input', () => {
  const value = promptInput.value.trim();
  promptOutput.textContent = value || 'Le prompt sera généré ici...';
  updateDashboard({
    name: characterName.textContent,
    title: characterTitle.textContent,
    archetype: characterRole.textContent,
    world: characterWorld.textContent,
    mood: moodSelect.value,
    energy: Number(energySelect.value),
    silhouette: silhouetteSelect.value,
    traits: Array.from(document.querySelectorAll('.trait')).map((node) => node.textContent),
    prompt: value,
    history: backstoryText.textContent,
    hasImage: Boolean(portraitImage.src && portraitImage.src !== window.location.href)
  });
});

nameInput.addEventListener('input', buildCharacter);
titleInput.addEventListener('input', buildCharacter);
archetypeSelect.addEventListener('change', buildCharacter);
worldSelect.addEventListener('change', buildCharacter);
moodSelect.addEventListener('change', buildCharacter);
silhouetteSelect.addEventListener('change', buildCharacter);
energySelect.addEventListener('change', buildCharacter);

buildCharacter();
