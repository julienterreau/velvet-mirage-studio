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

const characterName = document.querySelector('#characterName');
const characterRole = document.querySelector('#characterRole');
const characterSetting = document.querySelector('#characterSetting');
const characterMood = document.querySelector('#characterMood');
const traitList = document.querySelector('#traitList');
const backstoryText = document.querySelector('#backstoryText');
const promptOutput = document.querySelector('#promptOutput');

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
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

  const story = `${finalName} évolue dans ${setting.toLowerCase()} avec une confiance discrète qui fait de chaque pièce un lieu de tension. Elle sait transformer un simple regard en scène de désir et de désir maîtrisé, entre ${moods[mood]} et une élégance qui rend le danger irrésistible.`;

  const prompt = [
    `Portrait cinématographique hyperréaliste de ${finalName}, femme adulte ${archetype.label.toLowerCase()},`,
    `dans une scène ${setting.toLowerCase()}, ${moods[mood]},`,
    `éclairage dramatique doux, style luxueux, peau ultra détaillée, tenue élégante, pose raffinée,`,
    `romance subtile, ambiance intime, cadrage premium, composition cinématique,`,
    `détails réalistes, profondeur de champ douce, ${randomFrom(settings[setting])},`,
    `expression charismatique, intensité ${energy}, grand rendu artistico-émotionnel.`
  ].join(' ');

  characterName.textContent = finalName;
  characterRole.textContent = archetype.label;
  characterSetting.textContent = setting;
  characterMood.textContent = mood;

  traitList.innerHTML = selectedTraits.slice(0, 4).map((trait) => `<span class="trait">${trait}</span>`).join('');
  backstoryText.textContent = story;
  promptOutput.textContent = prompt;
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

document.querySelector('#generateBtn').addEventListener('click', buildCharacter);
document.querySelector('#shuffleBtn').addEventListener('click', shuffleCharacter);
nameInput.addEventListener('input', buildCharacter);
archetypeSelect.addEventListener('change', buildCharacter);
settingSelect.addEventListener('change', buildCharacter);
moodSelect.addEventListener('change', buildCharacter);
energySelect.addEventListener('change', buildCharacter);

buildCharacter();
