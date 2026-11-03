const archetypes = {
  warrior: { label: 'Guerrière', traits: ['fière', 'résolue', 'protectrice', 'décisive'], style: 'armure élégante, posture impériale et attitude de commandement' },
  duchess: { label: 'Duchesse', traits: ['élégante', 'intrigante', 'raffinée', 'charismatique'], style: 'robe de velours noir, bijoux anciens et présence aristocratique' },
  mystic: { label: 'Mystique', traits: ['énigmatique', 'sensible', 'profonde', 'ensorceleuse'], style: 'lumière lunaire, voile délicat et regard captivant' },
  amazon: { label: 'Amazone', traits: ['puissante', 'libre', 'athlétique', 'imposante'], style: 'tenue de voyage ouvragée, posture guerrière et allure majestueuse' },
  queen: { label: 'Impératrice', traits: ['majestueuse', 'implacable', 'dominante', 'rayonnante'], style: 'robe royale, aura de commandement et beauté souveraine' }
};

const worldOptions = {
  'moonlit kingdom': ['palais lunaire', 'vignes sombres', 'cours de marbre'],
  'sunset citadel': ['dômes dorés', 'désert rouge', 'coucher de soleil royal'],
  'temple of ash': ['voiles de cendre', 'piliers antiques', 'lumière sacrée'],
  'battle palace': ['hall de guerre', 'tentes impériales', 'remparts au crépuscule'],
  'sable empire': ['dunes dorées', 'vent mystique', 'jardins du palais']
};

const moods = {
  dangerous: 'une atmosphère dangereuse et magnétique',
  romantic: 'une romance passionnée et tendre',
  mystic: 'un mystère ancien et une fascination silencieuse',
  elegant: 'une élégance aristocratique et une présence rare',
  royal: 'un prestige royal et une volonté de commandement'
};

const silhouettes = {
  amazon: 'une silhouette athlétique et une posture majestueuse',
  fitted: 'une tenue ajustée et une élégance aérienne',
  royal: 'une robe royale et une présence impériale',
  velvet: 'une robe de velours sombre, une ligne fluide et un glamour discret'
};

const firstNames = ['Selene', 'Lysandra', 'Aurelia', 'Nerissa', 'Vesper', 'Cassia', 'Maeve', 'Ilyra', 'Sabrina', 'Elaria'];
const lastNames = ['Veyr', 'Dorian', 'Vale', 'Ashen', 'Montrose', 'Sable', 'Raven', 'Cairn', 'Voss', 'Noir'];
const HISTORY_KEY = 'velvet-mirage-history';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const $ = (selector) => document.querySelector(selector);
const titleInput = $('#titleInput');
const nameInput = $('#nameInput');
const archetypeSelect = $('#archetypeSelect');
const worldSelect = $('#worldSelect');
const moodSelect = $('#moodSelect');
const silhouetteSelect = $('#silhouetteSelect');
const energySelect = $('#energySelect');
const imageUpload = $('#imageUpload');
const promptInput = $('#promptInput');
const characterName = $('#characterName');
const characterTitle = $('#characterTitle');
const characterRole = $('#characterRole');
const characterWorld = $('#characterWorld');
const characterMood = $('#characterMood');
const traitList = $('#traitList');
const backstoryText = $('#backstoryText');
const promptOutput = $('#promptOutput');
const portraitImage = $('#portraitImage');
const appStatus = $('#appStatus');

let history = loadHistory();
let promptIsCustom = false;
let currentCharacter = null;
let imageObjectUrl = null;

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function selectedLabel(select) {
  return select.selectedOptions[0]?.textContent?.trim() || select.value;
}

function createPrompt(name, title, archetype, world, mood, energy, silhouette) {
  const details = worldOptions[world] || worldOptions['moonlit kingdom'];
  return [
    `Portrait d’une femme adulte nommée ${name}, ${title}, ${archetype.style}.`,
    `Dans le décor « ${selectedLabel(worldSelect)} », ${moods[mood] || moods.romantic}.`,
    `Éclairage cinématographique, composition soignée, univers fantasy romantique, textures riches et palette de noir, or et prune.`,
    `${silhouettes[silhouette] || silhouettes.velvet}; ${randomFrom(details)}.`,
    `Expression affirmée, regard expressif, tension narrative subtile, intensité ${energy}/4.`
  ].join(' ');
}

function buildCharacter({ regeneratePrompt = false, recordHistory = false } = {}) {
  const archetype = archetypes[archetypeSelect.value] || archetypes.warrior;
  const world = worldSelect.value in worldOptions ? worldSelect.value : 'moonlit kingdom';
  const mood = moodSelect.value in moods ? moodSelect.value : 'romantic';
  const silhouette = silhouetteSelect.value in silhouettes ? silhouetteSelect.value : 'velvet';
  const energy = Number(energySelect.value) || 1;
  const name = nameInput.value.trim() || `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
  const title = titleInput.value.trim() || `Noble du ${selectedLabel(worldSelect)}`;
  const story = `${name}, ${title}, veille sur ${selectedLabel(worldSelect)}. ${archetype.label}, elle est ${archetype.traits[0]} et ${archetype.traits[1]}; son histoire se noue dans ${moods[mood]}.`;

  if (regeneratePrompt || !promptIsCustom || !promptInput.value.trim()) {
    promptIsCustom = false;
    promptInput.value = createPrompt(name, title, archetype, world, mood, energy, silhouette);
  }

  const character = {
    name, title, archetype: archetype.label, archetypeKey: archetypeSelect.value,
    world, worldLabel: selectedLabel(worldSelect), mood, moodLabel: selectedLabel(moodSelect),
    energy, silhouette, silhouetteLabel: selectedLabel(silhouetteSelect),
    traits: [...archetype.traits], prompt: promptInput.value.trim(), backstory: story,
    hasImage: Boolean(portraitImage.getAttribute('src')), createdAt: new Date().toISOString()
  };
  currentCharacter = character;
  renderCharacter(character);
  if (recordHistory) addToHistory(character);
}

function renderCharacter(character) {
  characterName.textContent = character.name;
  characterTitle.textContent = character.title;
  characterRole.textContent = character.archetype;
  characterWorld.textContent = character.worldLabel;
  characterMood.textContent = character.moodLabel;
  traitList.replaceChildren(...character.traits.map((trait) => {
    const item = document.createElement('span');
    item.className = 'trait';
    item.textContent = trait;
    return item;
  }));
  backstoryText.textContent = character.backstory;
  promptOutput.textContent = character.prompt || 'Le prompt apparaîtra ici.';
  updateDashboard(character);
}

function updateDashboard(character) {
  $('#qaName').textContent = character.name;
  $('#qaArchetype').textContent = character.archetype;
  $('#qaWorld').textContent = character.worldLabel;
  $('#qaEnergy').textContent = `${character.energy}/4`;
  $('#qaTraits').textContent = String(character.traits.length);
  $('#qaPromptLength').textContent = `${character.prompt.length} caractères`;
  $('#qaSilhouette').textContent = character.silhouetteLabel;
  $('#qaImageStatus').textContent = character.hasImage ? 'Oui' : 'Aucune';
  $('#qaJsonOutput').textContent = JSON.stringify(character, null, 2);
}

function loadHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(stored) ? stored.slice(0, 5) : [];
  } catch {
    return [];
  }
}

function addToHistory(character) {
  history = [character, ...history.filter((item) => item.createdAt !== character.createdAt)].slice(0, 5);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // The generator remains usable when browser storage is unavailable or full.
  }
  renderHistory();
}

function renderHistory() {
  const list = $('#qaHistoryList');
  list.replaceChildren();
  if (!history.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Vos personnages enregistrés apparaîtront ici.';
    list.append(empty);
    return;
  }
  for (const item of history) {
    const row = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'history-item';
    button.textContent = `${item.name} — ${item.archetype} / ${item.worldLabel || item.world}`;
    button.addEventListener('click', () => restoreCharacter(item));
    row.append(button);
    list.append(row);
  }
}

function restoreCharacter(character) {
  nameInput.value = character.name;
  titleInput.value = character.title;
  archetypeSelect.value = character.archetypeKey || 'warrior';
  worldSelect.value = character.world;
  moodSelect.value = character.mood;
  silhouetteSelect.value = character.silhouette;
  energySelect.value = String(character.energy);
  promptIsCustom = true;
  promptInput.value = character.prompt;
  currentCharacter = { ...character };
  renderCharacter(currentCharacter);
  announce(`Personnage « ${character.name} » restauré.`);
}

function shuffleCharacter() {
  nameInput.value = `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
  titleInput.value = `${randomFrom(['Duchesse', 'Reine', 'Gardienne', 'Élue', 'Commandante'])} des ${randomFrom(['ombres', 'dunes', 'flammes', 'lunes', 'cendres'])}`;
  archetypeSelect.value = randomFrom(Object.keys(archetypes));
  worldSelect.value = randomFrom(Object.keys(worldOptions));
  moodSelect.value = randomFrom(Object.keys(moods));
  silhouetteSelect.value = randomFrom(Object.keys(silhouettes));
  energySelect.value = String(1 + Math.floor(Math.random() * 4));
  promptIsCustom = false;
  promptInput.value = '';
  buildCharacter({ regeneratePrompt: true, recordHistory: true });
  announce('Un nouveau personnage a été créé.');
}

function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    announce('Choisissez un fichier image valide.');
    imageUpload.value = '';
    return;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    announce('L’image doit peser moins de 5 Mo.');
    imageUpload.value = '';
    return;
  }
  if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);
  imageObjectUrl = URL.createObjectURL(file);
  portraitImage.src = imageObjectUrl;
  portraitImage.classList.add('visible');
  portraitImage.onload = () => {
    buildCharacter();
    announce('Portrait ajouté.');
  };
  portraitImage.onerror = () => {
    portraitImage.removeAttribute('src');
    portraitImage.classList.remove('visible');
    announce('Impossible de lire cette image.');
  };
}

async function copyPrompt() {
  const text = promptInput.value.trim();
  if (!text) return announce('Aucun prompt à copier.');
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      promptInput.focus();
      promptInput.select();
      if (!document.execCommand('copy')) throw new Error('Copy unavailable');
    }
    announce('Prompt copié dans le presse-papiers.');
  } catch {
    announce('Copie impossible. Sélectionnez le texte du prompt pour le copier.');
  }
}

function downloadJson() {
  if (!currentCharacter) return;
  downloadBlob(JSON.stringify(currentCharacter, null, 2), 'application/json', 'velvet-mirage-character.json');
  announce('Fiche personnage exportée en JSON.');
}

function exportCardAsPng() {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  if (!ctx) return announce('Export PNG indisponible sur ce navigateur.');

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#100d14');
  gradient.addColorStop(0.55, '#21162b');
  gradient.addColorStop(1, '#170f1a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(24,18,31,.94)';
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.lineWidth = 2;
  roundRect(ctx, 55, 55, 1090, 790, 30);
  ctx.fill();
  ctx.stroke();

  const drawCardText = () => {
    ctx.fillStyle = '#f7ebff';
    ctx.font = '700 46px Inter, sans-serif';
    drawWrappedText(ctx, currentCharacter.name, 500, 220, 570, 58, 2);
    ctx.fillStyle = '#d8c7e5';
    ctx.font = '600 24px Inter, sans-serif';
    drawWrappedText(ctx, currentCharacter.title, 500, 300, 570, 34, 2);
    ctx.fillStyle = '#ff6dcf';
    ctx.fillRect(500, 370, 220, 5);
    ctx.fillStyle = '#f3eaf8';
    ctx.font = '500 20px Inter, sans-serif';
    drawWrappedText(ctx, `${currentCharacter.archetype} · ${currentCharacter.worldLabel} · ${currentCharacter.moodLabel}`, 500, 420, 570, 30, 3);
    ctx.fillStyle = '#f8d797';
    ctx.font = '600 19px Inter, sans-serif';
    drawWrappedText(ctx, currentCharacter.traits.map((trait) => `#${trait}`).join('   '), 500, 530, 570, 30, 3);
    ctx.fillStyle = '#f3eaf8';
    ctx.font = '400 17px Inter, sans-serif';
    drawWrappedText(ctx, currentCharacter.backstory, 500, 640, 570, 27, 5);
    downloadCanvas(canvas);
  };

  const portraitX = 105;
  const portraitY = 160;
  const portraitW = 330;
  const portraitH = 500;
  if (portraitImage.getAttribute('src') && portraitImage.complete) {
    ctx.save();
    roundRect(ctx, portraitX, portraitY, portraitW, portraitH, 24);
    ctx.clip();
    ctx.drawImage(portraitImage, portraitX, portraitY, portraitW, portraitH);
    ctx.restore();
  } else {
    const art = ctx.createRadialGradient(260, 300, 10, 260, 370, 350);
    art.addColorStop(0, 'rgba(255,255,255,.3)');
    art.addColorStop(.4, 'rgba(255,109,207,.28)');
    art.addColorStop(1, 'rgba(18,12,20,.95)');
    ctx.fillStyle = art;
    roundRect(ctx, portraitX, portraitY, portraitW, portraitH, 24);
    ctx.fill();
  }
  drawCardText();
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text).split(/\s+/);
  let line = '';
  let lines = 0;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      if (lines === maxLines - 1) {
        ctx.fillText(`${line}…`, x, y + lines * lineHeight, maxWidth);
        return;
      }
      ctx.fillText(line, x, y + lines * lineHeight, maxWidth);
      lines += 1;
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line && lines < maxLines) ctx.fillText(line, x, y + lines * lineHeight, maxWidth);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function downloadCanvas(canvas) {
  try {
    canvas.toBlob((blob) => {
      if (!blob) return announce('La création du PNG a échoué.');
      downloadBlob(blob, 'image/png', 'velvet-mirage-card.png');
      announce('Carte personnage exportée en PNG.');
    }, 'image/png');
  } catch {
    announce('Export PNG impossible avec cette image.');
  }
}

function downloadBlob(content, type, filename) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function announce(message) {
  if (appStatus) appStatus.textContent = message;
}

$('#generateBtn').addEventListener('click', () => {
  buildCharacter({ regeneratePrompt: true, recordHistory: true });
  announce('Personnage généré.');
});
$('#shuffleBtn').addEventListener('click', shuffleCharacter);
$('#copyPromptBtn').addEventListener('click', copyPrompt);
$('#downloadJsonBtn').addEventListener('click', downloadJson);
$('#exportPngBtn').addEventListener('click', exportCardAsPng);
imageUpload.addEventListener('change', handleImageUpload);
promptInput.addEventListener('input', () => {
  promptIsCustom = true;
  if (!currentCharacter) return;
  currentCharacter.prompt = promptInput.value.trim();
  renderCharacter(currentCharacter);
});

for (const input of [nameInput, titleInput]) input.addEventListener('input', () => buildCharacter());
for (const select of [archetypeSelect, worldSelect, moodSelect, silhouetteSelect, energySelect]) {
  select.addEventListener('change', () => buildCharacter());
}

renderHistory();
buildCharacter();
