const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

const elements = {
  name: document.querySelector('#characterNameInput'),
  location: document.querySelector('#locationInput'),
  tone: document.querySelector('#toneSelect'),
  imageInput: document.querySelector('#referenceImageInput'),
  image: document.querySelector('#referenceImage'),
  imagePlaceholder: document.querySelector('#referencePlaceholder'),
  imageStatus: document.querySelector('#imageStatus'),
  removeImage: document.querySelector('#removeImageButton'),
  sceneLocation: document.querySelector('#sceneLocation'),
  sceneBeat: document.querySelector('#sceneBeat'),
  sceneReaction: document.querySelector('#sceneReaction'),
  mood: document.querySelector('#moodValue'),
  tension: document.querySelector('#tensionValue'),
  weather: document.querySelector('#weatherValue'),
  memory: document.querySelector('#memorySummary'),
  turn: document.querySelector('#turnBadge'),
  referenceState: document.querySelector('#referenceState'),
  prompt: document.querySelector('#scenePrompt'),
  promptStatus: document.querySelector('#promptStatus'),
  chat: document.querySelector('#chatMessages'),
  chatForm: document.querySelector('#chatForm'),
  chatInput: document.querySelector('#chatInput'),
  sendButton: document.querySelector('#sendButton'),
  refreshPrompt: document.querySelector('#refreshPromptButton'),
  copyPrompt: document.querySelector('#copyPromptButton'),
  reset: document.querySelector('#resetButton')
};

const initialState = () => ({
  turn: 0,
  mood: 'Curiosité',
  tension: 'Douce',
  weather: 'Pluie',
  beat: 'La pluie tombe sur Paris. Arielle se tient près de la fenêtre et attend votre réaction.',
  reaction: 'Envoie une action dans le chat pour faire évoluer le contexte.',
  memories: ['La rencontre commence près de la fenêtre.', 'La pluie continue à l’extérieur.']
});

let state = initialState();
let referenceObjectUrl = null;
let promptWasEdited = false;

function buildPrompt() {
  const name = elements.name.value.trim() || 'Arielle';
  const location = elements.location.value.trim() || 'un lieu cinématographique';
  const imageDirection = referenceObjectUrl
    ? `Utiliser l’image de référence chargée comme guide d’apparence du personnage; préserver son identité visuelle.`
    : 'Personnage fictif adulte, apparence cohérente au fil de la scène.';

  return [
    'Génère une scène interactive continue, pas un montage de plans indépendants.',
    `${imageDirection}`,
    `${name} se trouve dans ${location}.`,
    `Tonalité : ${elements.tone.value}. Humeur : ${state.mood}. Tension : ${state.tension}. Météo : ${state.weather}.`,
    `État actuel de la scène : ${state.beat}`,
    `Dernière réaction attendue : ${state.reaction}`,
    `Continuité à préserver : ${state.memories.slice(-4).join(' ')}`,
    'Conserver le même personnage, le même lieu et les événements établis. Faire évoluer les gestes, l’expression, la lumière et l’atmosphère progressivement en réponse à l’action du joueur. Mouvement naturel, rendu cinématographique, aucun changement de décor sans transition.'
  ].join('\n\n');
}

function refreshPrompt({ announce = true } = {}) {
  elements.prompt.value = buildPrompt();
  promptWasEdited = false;
  if (announce) elements.promptStatus.textContent = 'Prompt actualisé avec le contexte courant.';
}

function renderState() {
  const name = elements.name.value.trim() || 'Arielle';
  elements.sceneLocation.textContent = elements.location.value.trim() || 'Lieu non défini';
  elements.sceneBeat.textContent = state.beat;
  elements.sceneReaction.textContent = state.reaction;
  elements.mood.textContent = state.mood;
  elements.tension.textContent = state.tension;
  elements.weather.textContent = state.weather;
  elements.turn.textContent = `Tour ${state.turn}`;
  elements.memory.textContent = state.memories.slice(-4).join(' ');
  elements.referenceState.textContent = referenceObjectUrl ? 'Référence : chargée localement' : 'Référence : aucune';
  elements.chatInput.setAttribute('aria-label', `Message ou action pour ${name}`);

  if (!promptWasEdited) refreshPrompt({ announce: false });
}

function appendMessage(role, author, text) {
  const article = document.createElement('article');
  article.className = `chat-bubble ${role === 'user' ? 'user-bubble' : 'assistant-bubble'}`;

  const authorLabel = document.createElement('span');
  authorLabel.className = 'bubble-author';
  authorLabel.textContent = author;
  const message = document.createElement('p');
  message.textContent = text;
  article.append(authorLabel, message);
  elements.chat.append(article);
  elements.chat.scrollTop = elements.chat.scrollHeight;
}

function interpretLocally(message) {
  const text = message.toLocaleLowerCase('fr');
  const name = elements.name.value.trim() || 'Arielle';
  const previousBeat = state.beat;

  if (/fenêtre|vitre|pluie|orage|vent/.test(text)) {
    state.weather = /orage|éclair|tonnerre/.test(text) ? 'Orage' : /vent/.test(text) ? 'Vent et pluie' : 'Pluie';
    state.beat = /vent/.test(text)
      ? 'Une rafale fait bouger les rideaux; les reflets de la ville tremblent sur la vitre.'
      : 'Les gouttes continuent de glisser sur la fenêtre tandis que la scène se prolonge au même endroit.';
    state.reaction = `${name} tourne légèrement la tête vers la fenêtre et réagit au changement dans l’atmosphère.`;
  } else if (/approche|avance|près d'elle|près d’elle|m'approche|m’approche/.test(text)) {
    state.beat = 'Le joueur s’est rapproché de la fenêtre; la distance entre les personnages change sans déplacement de décor.';
    state.reaction = `${name} remarque votre présence, se tourne vers vous et laisse un silence avant de répondre.`;
  } else if (/main|tend|toucher|touche/.test(text)) {
    state.beat = 'Un geste est proposé, sans contact imposé; la scène attend la réponse du personnage.';
    state.reaction = `${name} observe le geste, hésite un instant et choisit librement de répondre avec prudence.`;
    state.tension = 'Plus attentive';
  } else if (/lumière|lampe|éteint|sombre|bougie/.test(text)) {
    state.beat = 'La lumière de la pièce change progressivement, tandis que le décor et les personnages restent en place.';
    state.reaction = `${name} lève les yeux vers la lumière et s’adapte à l’ambiance nouvelle.`;
  } else if (/part|sort|quitte|s'en va|s’en va/.test(text)) {
    state.beat = 'Le joueur évoque un départ; la scène reste au même endroit jusqu’à ce qu’une transition soit décidée.';
    state.reaction = `${name} remarque votre intention et vous demande calmement si vous souhaitez vraiment partir.`;
    state.tension = 'Incertaine';
  } else if (/bonjour|salut|bonsoir|parle|dis|demande|question/.test(text)) {
    state.beat = 'La conversation reprend dans le penthouse; la pluie et le décor restent continus.';
    state.reaction = `${name} écoute votre message, puis répond sans interrompre le fil de la scène.`;
  } else {
    state.beat = `La scène poursuit son cours après l’action : « ${message} »`;
    state.reaction = `${name} prend un instant pour considérer votre action et réagit en restant dans le contexte établi.`;
  }

  state.turn += 1;
  state.mood = state.turn > 2 ? 'Attention soutenue' : 'Curiosité';
  state.memories.push(`Tour ${state.turn} : ${message}`, `Évolution : ${state.beat}`);
  state.memories = state.memories.slice(-8);

  if (state.beat === previousBeat) {
    state.beat = 'La scène continue sans rupture, en tenant compte du dernier message.';
  }

  return `${state.reaction} (Réaction de démonstration locale, pas une réponse d’IA.)`;
}

function sendMessage(message) {
  const cleanMessage = message.trim();
  if (!cleanMessage) return;

  appendMessage('user', 'Vous', cleanMessage);
  const simulatedReply = interpretLocally(cleanMessage);
  renderState();
  appendMessage('assistant', elements.name.value.trim() || 'Arielle · simulation', simulatedReply);
  elements.promptStatus.textContent = promptWasEdited
    ? 'Le contexte a changé. Votre prompt personnalisé est conservé; actualisez-le si souhaité.'
    : 'Contexte mis à jour. Le prompt reflète le nouvel état de la scène.';
}

function handleImageSelection(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!IMAGE_TYPES.has(file.type)) {
    elements.imageStatus.textContent = 'Format non pris en charge. Choisis une image PNG, JPG, WEBP ou GIF.';
    event.target.value = '';
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    elements.imageStatus.textContent = 'Image trop volumineuse. La limite est de 8 Mo.';
    event.target.value = '';
    return;
  }

  if (referenceObjectUrl) URL.revokeObjectURL(referenceObjectUrl);
  referenceObjectUrl = URL.createObjectURL(file);
  elements.image.src = referenceObjectUrl;
  elements.image.hidden = false;
  elements.imagePlaceholder.hidden = true;
  elements.removeImage.hidden = false;
  elements.imageStatus.textContent = `${file.name} chargée pour l’aperçu local. Elle n’est pas envoyée à un service.`;
  elements.referenceState.textContent = 'Référence : chargée localement';
  if (!promptWasEdited) refreshPrompt({ announce: false });
}

function removeImage() {
  if (referenceObjectUrl) URL.revokeObjectURL(referenceObjectUrl);
  referenceObjectUrl = null;
  elements.image.removeAttribute('src');
  elements.image.hidden = true;
  elements.imagePlaceholder.hidden = false;
  elements.removeImage.hidden = true;
  elements.imageInput.value = '';
  elements.imageStatus.textContent = 'Aucune image chargée.';
  elements.referenceState.textContent = 'Référence : aucune';
  if (!promptWasEdited) refreshPrompt({ announce: false });
}

function resetScenario() {
  state = initialState();
  elements.chat.replaceChildren();
  appendMessage('assistant', 'Arielle · début de scène', 'La pluie dessine des lignes sur la fenêtre. Je reste tournée vers la ville, consciente de ta présence derrière moi.');
  renderState();
  elements.promptStatus.textContent = 'Scénario réinitialisé. Image et paramètres conservés.';
}

elements.imageInput.addEventListener('change', handleImageSelection);
elements.removeImage.addEventListener('click', removeImage);
elements.name.addEventListener('input', renderState);
elements.location.addEventListener('input', renderState);
elements.tone.addEventListener('change', renderState);
elements.prompt.addEventListener('input', () => {
  promptWasEdited = true;
  elements.promptStatus.textContent = 'Prompt modifié manuellement.';
});
elements.refreshPrompt.addEventListener('click', () => refreshPrompt());
elements.copyPrompt.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(elements.prompt.value);
    elements.promptStatus.textContent = 'Prompt copié dans le presse-papiers.';
  } catch {
    elements.prompt.focus();
    elements.prompt.select();
    elements.promptStatus.textContent = 'Copie automatique indisponible : le prompt est sélectionné, copie-le manuellement.';
  }
});
elements.chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage(elements.chatInput.value);
  elements.chatInput.value = '';
  elements.chatInput.focus();
});
elements.chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    elements.chatForm.requestSubmit();
  }
});
document.querySelectorAll('.suggestion-chip').forEach((button) => {
  button.addEventListener('click', () => sendMessage(button.dataset.message || ''));
});
elements.reset.addEventListener('click', resetScenario);
window.addEventListener('beforeunload', () => {
  if (referenceObjectUrl) URL.revokeObjectURL(referenceObjectUrl);
});

renderState();
