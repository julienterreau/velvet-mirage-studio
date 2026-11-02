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

const worlds = {
  'moonlit kingdom': 'Royaume lunaire',
  'sunset citadel': 'Citadelle du coucher de soleil',
  'temple of ash': 'Temple des cendres',
  'battle palace': 'Palais de guerre',
  'sable empire': 'Empire du sable'
};

const moods = {
  dangerous: 'Dangereux',
  romantic: 'Romantique',
  mystic: 'Mystique',
  elegant: 'Élégant',
  royal: 'Royal'
};

const silhouettes = {
  amazon: 'Amazone',
  fitted: 'Cintrée',
  royal: 'Royale',
  velvet: 'Velours'
};

const firstNames = ['Selene', 'Lysandra', 'Aurelia', 'Nerissa', 'Vesper', 'Cassia', 'Maeve', 'Ilyra', 'Sabrina', 'Elaria'];
const lastNames = ['Veyr', 'Dorian', 'Vale', 'Ashen', 'Montrose', 'Sable', 'Raven', 'Cairn', 'Voss', 'Noir'];

const titleInput = document.querySelector('#titleInput');
const nameInput = document.querySelector('#nameInput');
const archetypeSelect = document.querySelector('#archetypeSelect');
const worldSelect = document.querySelector('#worldSelect');
const settingSelect = document.querySelector('#settingSelect');
const moodSelect = document.querySelector('#moodSelect');
const silhouetteSelect = document.querySelector('#silhouetteSelect');
const energySelect = document.querySelector('#energySelect');
const imageUpload = document.querySelector('#imageUpload');
const promptInput = document.querySelector('#promptInput');

const characterName = document.querySelector('#characterName');
const characterTitle = document.querySelector('#characterTitle');
const characterRole = document.querySelector('#characterRole');
const characterSetting = document.querySelector('#characterSetting');
const characterMood = document.querySelector('#characterMood');
const characterWorld = document.querySelector('#characterWorld');
const traitList = document.querySelector('#traitList');
const backstoryText = document.querySelector('#backstoryText');
const promptOutput = document.querySelector('#promptOutput');
const portraitImage = document.querySelector('#portraitImage');

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function buildFallbackPrompt(payload) {
  const {
    name,
    title,
    archetypeLabel,
    worldValue,
    moodValue,
    energy,
    silhouetteValue,
    settingValue
  } = payload;

  return [
    `Portrait of ${name}, ${title}, a breathtaking adult woman with elegant cinematic presence,`,
    `in ${worldValue || 'a moonlit kingdom'}, a ${moodValue || 'romantic'} atmosphere,`,
    `luxury visual storytelling, dramatic lighting, graceful ${silhouetteValue || 'royal'} silhouette,`,
    `beautiful mature features, intense gaze, premium cinematic mood,`,
    `${settingValue || 'private palace'}, dark romance energy, refined composition,`,
    `strong emotional presence, rich textures, soft gold and noir palette, intensity ${energy || 3}.`
  ].join(' ');
}

function buildLocalCharacter() {
  const customName = nameInput.value.trim();
  const customTitle = titleInput.value.trim();
  const archetypeKey = archetypeSelect.value || 'mystic';
  const archetype = archetypes[archetypeKey];
  const worldKey = worldSelect.value || Object.keys(worlds)[0];
  const moodKey = moodSelect.value || 'romantic';
  const settingValue = settingSelect.value || 'Penthouse à Paris';
  const silhouetteKey = silhouetteSelect.value || 'royal';
  const energy = Number(energySelect.value || 3);

  const finalName = customName || `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
  const finalTitle = customTitle || `Princesse de ${worlds[worldKey]}`;
  const selectedTraits = [...(archetype?.traits || [])].slice(0, 4);

  const story = `${finalName}, connue sous le nom de ${finalTitle}, incarne une présence presque surnaturelle dans ${settingValue}. Elle exerce une influence élégante et presque inévitable sur l'espace qui l'entoure. D'une beauté maîtrisée et d'une intelligence froide, elle séduit sans effort et garde le contrôle avec une finesse redoutable. La tension entre désir, mystère et pouvoir devient le cœur de son aura.`;

  const prompt = buildFallbackPrompt({
    name: finalName,
    title: finalTitle,
    archetypeLabel: archetype.label,
    worldValue: worlds[worldKey],
    moodValue: moods[moodKey],
    settingValue,
    energy,
    silhouetteValue: silhouettes[silhouetteKey]
  });

  characterName.textContent = finalName;
  characterTitle.textContent = finalTitle;
  characterRole.textContent = archetype.label;
  characterSetting.textContent = settingValue;
  characterMood.textContent = moods[moodKey];
  characterWorld.textContent = worlds[worldKey];

  traitList.innerHTML = selectedTraits
    .map((trait) => `<span class="trait">${trait}</span>`)
    .join('');

  backstoryText.textContent = story;
  promptInput.value = prompt;
  promptOutput.textContent = prompt;

  return {
    name: finalName,
    title: finalTitle,
    archetype: archetype.label,
    world: worlds[worldKey],
    setting: settingValue,
    mood: moods[moodKey],
    energy,
    silhouette: silhouettes[silhouetteKey],
    traits: selectedTraits,
    prompt,
    backstory: story
  };
}

async function generateCharacterFromBackend() {
  const payload = {
    name: nameInput.value.trim() || 'Arielle Voss',
    title: titleInput.value.trim() || 'Princesse des ombres',
    archetype: archetypeSelect.value,
    mood: moodSelect.value,
    setting: settingSelect.value,
    energy: Number(energySelect.value || 3),
    silhouette: silhouetteSelect.value,
    world: worldSelect.value,
    prompt: promptInput.value.trim()
  };

  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('API error');
    }

    const data = await response.json();
    const finalPrompt = data.prompt || data.character?.prompt || buildLocalCharacter().prompt;
    const finalBackstory = data.backstory || data.character?.backstory || backstoryText.textContent;
    const finalName = data.name || nameInput.value.trim() || 'Arielle Voss';
    const finalTitle = data.title || titleInput.value.trim() || 'Princesse des ombres';

    characterName.textContent = finalName;
    characterTitle.textContent = finalTitle;
    characterRole.textContent = data.archetype || archetypes[archetypeSelect.value]?.label || 'Mystique';
    characterSetting.textContent = data.setting || settingSelect.value || 'Penthouse à Paris';
    characterMood.textContent = moods[moodSelect.value] || 'Romantique';
    characterWorld.textContent = worlds[worldSelect.value] || 'Royaume lunaire';

    const traits = Array.isArray(data.traits) && data.traits.length ? data.traits : (archetypes[archetypeSelect.value]?.traits || []).slice(0, 4);
    traitList.innerHTML = traits.map((trait) => `<span class="trait">${trait}</span>`).join('');

    promptInput.value = finalPrompt;
    promptOutput.textContent = finalPrompt;
    backstoryText.textContent = finalBackstory;

    return { prompt: finalPrompt, backstory: finalBackstory };
  } catch (_error) {
    const local = buildLocalCharacter();
    return local;
  }
}

function shuffleCharacter() {
  const randomArchetype = randomFrom(Object.keys(archetypes));
  const randomMood = randomFrom(Object.keys(moods));
  const randomWorld = randomFrom(Object.keys(worlds));
  const randomSilhouette = randomFrom(Object.keys(silhouettes));
  const randomTitle = `${randomFrom(['Duchesse', 'Reine', 'Gardienne', 'Élue', 'Commandante'])} des ${randomFrom(['ombres', 'lunes', 'cendres', 'dunes', 'flammes'])}`;

  nameInput.value = `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
  titleInput.value = randomTitle;
  archetypeSelect.value = randomArchetype;
  worldSelect.value = randomWorld;
  moodSelect.value = randomMood;
  silhouetteSelect.value = randomSilhouette;
  energySelect.value = String(Math.floor(Math.random() * 4) + 1);

  generateCharacterFromBackend();
}

function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    portraitImage.src = loadEvent.target.result;
    portraitImage.classList.add('visible');
    generateCharacterFromBackend();
  };
  reader.readAsDataURL(file);
}

async function copyPrompt() {
  if (!promptInput.value.trim()) return;
  try {
    await navigator.clipboard.writeText(promptInput.value.trim());
    promptInput.focus();
    promptInput.select();
  } catch (_error) {
    console.warn('Clipboard unavailable');
  }
}

function downloadJson() {
  const payload = {
    name: characterName.textContent,
    title: characterTitle.textContent,
    archetype: characterRole.textContent,
    setting: characterSetting.textContent,
    mood: characterMood.textContent,
    world: characterWorld.textContent,
    prompt: promptInput.value.trim(),
    backstory: backstoryText.textContent,
    traits: Array.from(document.querySelectorAll('.trait')).map((node) => node.textContent),
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

  const artGradient = ctx.createRadialGradient(portraitX + 150, portraitY + 80, 20, portraitX + 150, portraitY + 150, 260);
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
  const subtitle = characterTitle.textContent || 'Princesse des ombres';
  const archetype = characterRole.textContent || 'Mystique';
  const setting = characterSetting.textContent || 'Penthouse à Paris';
  const world = characterWorld.textContent || 'Royaume lunaire';
  const textX = 510;
  let textY = 220;

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
  ctx.fillText(`${archetype} • ${world} • ${setting}`, textX, textY + 120);

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

document.querySelector('#generateBtn').addEventListener('click', generateCharacterFromBackend);
document.querySelector('#shuffleBtn').addEventListener('click', shuffleCharacter);
document.querySelector('#copyPromptBtn').addEventListener('click', copyPrompt);
document.querySelector('#downloadJsonBtn').addEventListener('click', downloadJson);
document.querySelector('#exportPngBtn').addEventListener('click', exportCardAsPng);

promptInput.addEventListener('input', () => {
  const value = promptInput.value.trim();
  promptOutput.textContent = value || 'Le prompt sera généré ici...';
});

nameInput.addEventListener('input', generateCharacterFromBackend);
titleInput.addEventListener('input', generateCharacterFromBackend);
archetypeSelect.addEventListener('change', generateCharacterFromBackend);
worldSelect.addEventListener('change', generateCharacterFromBackend);
settingSelect.addEventListener('change', generateCharacterFromBackend);
moodSelect.addEventListener('change', generateCharacterFromBackend);
silhouetteSelect.addEventListener('change', generateCharacterFromBackend);
energySelect.addEventListener('change', generateCharacterFromBackend);

buildLocalCharacter();
