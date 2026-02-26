const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'src/core/data');
const manifestPath = path.join(dataDir, 'assets-manifest.json');
const recipesDataPath = path.join(dataDir, 'recipes-ingredients.json');
const foodDbPath = path.join(dataDir, 'food-db.json');
const outputPath = path.join(dataDir, 'recipes-db.json');

const PREP_PATTERN = /^(.*?)\s*\(([^)]+)\)$/;

function normalizeRecipeId(prefix, idNum) {
  return `${prefix.toLowerCase()}-${idNum.toString().padStart(3, '0')}`;
}

function oldKeyToNormalizedId(key) {
  const match = key.match(/^([A-Z]+)_(\d+)(BIS)?$/i);
  if (!match) return key.toLowerCase().replace(/_/g, '-');
  const prefix = match[1].toLowerCase();
  const num = parseInt(match[2], 10).toString().padStart(3, '0');
  const bis = match[3] ? match[3].toLowerCase() : '';
  return `${prefix}-${num}${bis}`;
}

function cleanName(fileName) {
  return fileName
    .split('.')[0]
    .replace(/(_Photo|_Ingrédients?|_Ingredients?|_Recettes?|_Recipes?)$/i, '')
    .replace(/_/g, ' ')
    .trim();
}

console.log('🔍 Lecture des sources...');

if (!fs.existsSync(manifestPath)) {
  console.error('❌ assets-manifest.json introuvable. Lance d\'abord : node generate-manifest.cjs');
  process.exit(1);
}
if (!fs.existsSync(foodDbPath)) {
  console.error('❌ food-db.json introuvable. Lance d\'abord : node generate-food-db.cjs');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const recipesData = JSON.parse(fs.readFileSync(recipesDataPath, 'utf-8'));
const foodDb = JSON.parse(fs.readFileSync(foodDbPath, 'utf-8'));

const base = '/artemis-foodlab';
const result = {};

console.log('📦 Traitement des assets...');
let assetCount = 0;

manifest.forEach(entry => {
  const { categoryFolder, typeFolder, fileName } = entry;
  const match = fileName.match(/^([A-Z]{2,10})_(\d{1,3})_(.*)$/i);
  if (!match) {
    console.warn(`   ⚠️  Ignoré (regex) : ${fileName}`);
    return;
  }
  const [_, prefix, idNum, rest] = match;
  const recipeId = normalizeRecipeId(prefix, parseInt(idNum, 10));
  const type = typeFolder.toLowerCase();
  const url = `${base}/${categoryFolder}/${typeFolder}/${fileName}`;
  const name = cleanName(rest);

  if (!result[recipeId]) {
    result[recipeId] = {
      name,
      categoryId: categoryFolder,
      mealType: [],
      kind: 'dish',
      macronutriment: null,
      portion: 1,
      ingredients: [],
      assets: {},
    };
  }

  result[recipeId].assets[type] = { url };
  assetCount++;
});

console.log(`   ✅ ${assetCount} assets traités, ${Object.keys(result).length} recettes détectées`);
console.log('🧪 Fusion des données nutritionnelles...');

let mergedCount = 0;
let orphanCount = 0;

Object.entries(recipesData).forEach(([oldKey, data]) => {
  const recipeId = oldKeyToNormalizedId(oldKey);

  if (result[recipeId]) {
    result[recipeId].macronutriment = data.macronutriment;
    result[recipeId].portion = data.portion ?? 1;
    result[recipeId].ingredients = data.ingredients ?? [];
    if (data.name) result[recipeId].name = data.name.replace(/_/g, ' ').trim();
    if (data.kind) result[recipeId].kind = data.kind;
    if (data.mealType) result[recipeId].mealType = data.mealType;
    mergedCount++;
  } else {
    result[recipeId] = {
      name: (data.name || recipeId).replace(/_/g, ' ').trim(),
      categoryId: '',
      mealType: data.mealType ?? [],
      kind: data.kind ?? 'ingredient',
      macronutriment: data.macronutriment,
      portion: data.portion ?? 1,
      ingredients: data.ingredients ?? [],
      assets: {},
    };
    orphanCount++;
  }
});

console.log(`   ✅ ${mergedCount} fusions réussies, ${orphanCount} entrées nutrition sans assets`);

console.log('🥦 Résolution des foodId...');

const foodIndex = new Map();
for (const food of Object.values(foodDb)) {
  foodIndex.set(`${food.category}|${food.name.toLowerCase()}`, food.id);
}

let resolvedCount = 0;
let unresolved = [];

for (const [recipeId, recipe] of Object.entries(result)) {
  if (!recipe.ingredients) continue;

  recipe.ingredients = recipe.ingredients.map(ing => {
    if (!ing.name || !ing.category) return ing;

    const directKey = `${ing.category}|${ing.name.trim().toLowerCase()}`;
    if (foodIndex.has(directKey)) {
      resolvedCount++;
      return { ...ing, foodId: foodIndex.get(directKey) };
    }

    const match = ing.name.trim().match(PREP_PATTERN);
    if (match) {
      const baseName = match[1].trim();
      const preparation = match[2].trim();
      const prepKey = `${ing.category}|${baseName.toLowerCase()}`;
      if (foodIndex.has(prepKey)) {
        resolvedCount++;
        return {
          ...ing,
          name: baseName,
          foodId: foodIndex.get(prepKey),
          preparation,
        };
      }
    }

    unresolved.push({ recipeId, name: ing.name, category: ing.category });
    return ing;
  });
}

console.log(`   ✅ ${resolvedCount} ingrédients résolus`);
if (unresolved.length > 0) {
  console.warn(`   ⚠️  ${unresolved.length} ingrédients sans correspondance food-db :`);
  unresolved.forEach(u => console.warn(`      - [${u.recipeId}] "${u.name}" (${u.category})`));
}

const sorted = Object.fromEntries(
  Object.entries(result).sort(([a], [b]) => a.localeCompare(b))
);

fs.writeFileSync(outputPath, JSON.stringify(sorted, null, 2));

console.log(`\n✅ recipes-db.json généré (v2) : ${Object.keys(sorted).length} recettes`);
console.log(`   📁 ${outputPath}`);
