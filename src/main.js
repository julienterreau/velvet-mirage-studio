const archetypes = {
  dominant: { label: 'Dominant', traits: ['confiance', 'charisme', 'contrôle', 'magnétique'] },
  mysterious: { label: 'Mystérieux', traits: ['énigmatique', 'brillant', 'intense', 'séduisant'] },
  sweet: { label: 'Doux', traits: ['chaleureux', 'tendre', 'doux', 'fidèle'] },
  rebellious: { label: 'Révolutionnaire', traits: ['audacieux', 'libre', 'insouciant', 'ardent'] },
  elegant: { label: 'Élégant', traits: ['raffiné', 'posé', 'luxueux', 'gracieux'] }
};

const settings = {
  'Paris penthouse': ['rideau de soie', 'lumières dorées de la ville', 'balcon privé'],
  'Moonlit villa': ['rideaux de velours', 'bougies douces', 'chambre miroir'],
  'Neon rooftop lounge': ['skyline néon', 'mélancolie nocturne', 'robe satinée'],
  'Private island estate': ['brise marine', 'coucher de soleil chaud', 'sol en marbre'],
  'Old-world theater': ['velours dramatique', 'haze de scène', 'élégance historique']
};

const moods = {
  dangerous: 'tension lente et chimie électrique',
  romantic: 'dévotion intime et sensuelle',
  tender: 'proximité douce et confiance profonde',
  seductive: 'confidence ludique et charme maîtrisé',
  dramatic: 'romance intense et émotion cinématographique'
};

const firstNames = ['Arielle', 'Selene', 'Mila', 'Camille', 'Lucia', 'Vera', 'Iris', 'Rosalie', 'Juliet', 'Noor'];
const lastNames = ['Voss', 'Hart', 'Vale', 'Sorel', 'Stone', 'Deray', 'Blake', 'Dune', 'Marin', 'Aster'];

const nameInput = document.querySelector('#nameInput');
const archetypeSelect = document.querySelector('#archetypeSelect');
const settingSelect = document.querySelector('#settingSelect');
const moodSelect = document.querySelector('#moodSelect');
const energySelect = document.querySelector('#energySelect');
const imageUpload = document.querySelector('#imageUpload');
const promptInput = document.querySelector('#promptInput');

const characterName = document.querySelector('#characterName');
const characterRole = document.querySelector('#characterRole');
const characterSetting = document.querySelector('#characterSetting');
const characterMood = document.querySelector('#characterMood');
const traitList = document.querySelector('#traitList');
const backstoryText = document.querySelector('#backstoryText');
const promptOutput = document.querySelector('#promptOutput');
const portraitImage = document.querySelector('#portraitImage');

const qaName = document.querySelector('#qaName');
const qaArchetype = document.querySelector('#qaArchetype');
const qaMood = document.querySelector('#qaMood');
const qaSetting = document.querySelector('#qaSetting');
const qaEnergy = document.querySelector('#qaEnergy');
const qaTraits = document.querySelector('#qaTraits');
const qaPromptLength = document.querySelector('#qaPromptLength');
const qaImageStatus = document.querySelector('#qaImageStatus');
const qaJsonOutput = document.querySelector('#qaJsonOutput');
const qaHistoryList = document.querySelector('#qaHistoryList');

let history = [];

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function createPrompt(finalName, archetype, setting, mood, energy) {
  const detail = randomFrom(settings[setting]);
  return [
    `Portrait cinématographique hyperréaliste de ${finalName}, femme adulte ${archetype.label.toLowerCase()},`,
    `dans une scène ${setting.toLowerCase()}, ${moods[mood]},`,
    `éclairage dramatique doux, style luxueux, peau ultra détaillée, tenue élégante, pose raffinée,`,
    `romance subtile, ambiance intime, cadrage premium, composition cinématique,`,
    `détails réalistes, profondeur de champ douce, ${detail},`,
    `expression charismatique, intensité ${energy}, grand rendu artistico-émotionnel.`
  ].join(' ');
}

function buildCharacter() {
  const customName = nameInput.value.trim();
  const archetype = archetypes[archetypeSelect.value];
  const setting = settingSelect.value;
  const mood = moodSelect.value;
  const energy = Number(energySelect.value);

  const finalName = customName || `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
  const selectedTraits = [...archetype.traits];

  while (selectedTraits.length < 4) {
    selectedTraits.push(randomFrom(Object.values(archetypes).flatMap((entry) => entry.traits)));
  }

  const story = `${finalName} évolue dans ${setting.toLowerCase()} avec une confiance discrète qui fait de chaque pièce un lieu de tension. Elle sait transformer un simple regard en scène de désir, où chaque geste devient une déclaration silencieuse. Son aura mélange intensité et élégance, et la romance qui la suit semble toujours être à la fois dangereuse et inévitable.`;

  const generatedPrompt = createPrompt(finalName, archetype, setting, mood, energy);
  const promptValue = promptInput.value.trim() || generatedPrompt;

  characterName.textContent = finalName;
  characterRole.textContent = archetype.label;
  characterSetting.textContent = setting;
  characterMood.textContent = mood;

  traitList.innerHTML = selectedTraits.slice(0, 4).map((trait) => `<span class="trait">${trait}</span>`).join('');
  backstoryText.textContent = story;
  promptOutput.textContent = promptValue;
  promptInput.value = promptValue;

  const state = {
    name: finalName,
    archetype: archetype.label,
    setting,
    mood,
    energy,
    traits: selectedTraits.slice(0, 4),
    prompt: promptValue,
    backstory: story,
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
  qaMood.textContent = state.mood;
  qaSetting.textContent = state.setting;
  qaEnergy.textContent = state.energy;
  qaTraits.textContent = state.traits.length;
  qaPromptLength.textContent = String(state.prompt.length);
  qaImageStatus.textContent = state.hasImage ? 'Oui' : 'Aucun';

  qaJsonOutput.textContent = JSON.stringify({
    name: state.name,
    archetype: state.archetype,
    setting: state.setting,
    mood: state.mood,
    energy: state.energy,
    traits: state.traits,
    promptLength: state.prompt.length,
    hasImage: state.hasImage,
    prompt: state.prompt
  }, null, 2);
}

function renderHistory() {
  qaHistoryList.innerHTML = history
    .map((item) => `<li><strong>${item.name}</strong> — ${item.archetype} / ${item.setting} / ${item.mood}</li>`)
    .join('');
}

function shuffleCharacter() {
  const randomName = `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
  nameInput.value = randomName;
  archetypeSelect.value = randomFrom(Object.keys(archetypes));
  settingSelect.value = randomFrom(Object.keys(settings));
  moodSelect.value = randomFrom(Object.keys(moods));
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
    console.warn('Clipboard unavailable:', error);
  }
}

function downloadJson() {
  const payload = {
    name: characterName.textContent,
    archetype: characterRole.textContent,
    setting: characterSetting.textContent,
    mood: characterMood.textContent,
    traits: Array.from(document.querySelectorAll('.trait')).map((item) => item.textContent),
    prompt: promptInput.value.trim(),
    backstory: backstoryText.textContent,
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
      ctx.beginPath();
      roundRect(ctx, portraitX, portraitY, portraitW, portraitH, 28);
      ctx.clip();
      ctx.drawImage(img, portraitX, portraitY, portraitW, portraitH);
      ctx.restore();
      drawTextLayer(ctx, cardX, cardY, cardW, cardH);
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

  drawTextLayer(ctx, cardX, cardY, cardW, cardH);
  downloadCanvas(canvas);
}

function drawTextLayer(ctx, cardX, cardY, cardW, cardH) {
  const title = characterName.textContent || 'Velvet Mirage';
  const archetype = characterRole.textContent || 'Dominant';
  const setting = characterSetting.textContent || 'Paris penthouse';
  const mood = characterMood.textContent || 'romantic';
  const textX = cardX + 500;
  let textY = cardY + 165;

  ctx.fillStyle = '#f7ebff';
  ctx.font = '700 48px Inter, sans-serif';
  ctx.fillText(title, textX, textY);

  ctx.fillStyle = '#d8c7e5';
  ctx.font = '600 24px Inter, sans-serif';
  ctx.fillText('Velvet Mirage Studio', textX, textY + 42);

  ctx.fillStyle = '#ff6dcf';
  ctx.fillRect(textX, textY + 72, 220, 5);

  ctx.fillStyle = '#e9d9ff';
  ctx.font = '500 20px Inter, sans-serif';
  ctx.fillText(`${archetype} • ${setting}`, textX, textY + 120);
  ctx.fillText(`Ambiance: ${mood}`, textX, textY + 155);

  const traits = Array.from(document.querySelectorAll('.trait')).map((el) => el.textContent).slice(0, 4);
  ctx.fillStyle = '#f8d797';
  ctx.font = '600 18px Inter, sans-serif';
  traits.forEach((trait, index) => {
    ctx.fillText(`#${trait}`, textX + index * 110, textY + 215);
  });

  const prompt = (promptInput.value || promptOutput.textContent || '').trim();
  const wrapped = wrapText(ctx, prompt, 540, 2);
  ctx.fillStyle = '#f3eaf8';
  ctx.font = '500 20px Inter, sans-serif';
  wrapped.forEach((line, index) => {
    ctx.fillText(line, textX, textY + 290 + index * 28);
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
promptInput.addEventListener('input', () => {
  const value = promptInput.value.trim();
  promptOutput.textContent = value || 'Le prompt sera généré ici...';
  updateDashboard({
    name: characterName.textContent,
    archetype: characterRole.textContent,
    setting: characterSetting.textContent,
    mood: characterMood.textContent,
    energy: Number(energySelect.value),
    traits: Array.from(document.querySelectorAll('.trait')).map((node) => node.textContent),
    prompt: value,
    backstory: backstoryText.textContent,
    hasImage: Boolean(portraitImage.src && portraitImage.src !== window.location.href)
  });
});

document.querySelector('#generateBtn').addEventListener('click', buildCharacter);
document.querySelector('#shuffleBtn').addEventListener('click', shuffleCharacter);
document.querySelector('#copyPromptBtn').addEventListener('click', copyPrompt);
document.querySelector('#downloadJsonBtn').addEventListener('click', downloadJson);
document.querySelector('#exportPngBtn').addEventListener('click', exportCardAsPng);
nameInput.addEventListener('input', buildCharacter);
archetypeSelect.addEventListener('change', buildCharacter);
settingSelect.addEventListener('change', buildCharacter);
moodSelect.addEventListener('change', buildCharacter);
energySelect.addEventListener('change', buildCharacter);

buildCharacter();
