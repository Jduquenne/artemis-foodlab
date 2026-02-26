const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const outputDir = path.join(rootDir, 'src/core/data');
const manifestPath = path.join(outputDir, 'assets-manifest.json');
const recipesDataPath = path.join(outputDir, 'recipes-ingredients.json');
const outputPath = path.join(outputDir, 'recipes-db.json');

const categories = ["bases", "cereal-products", "dairy-products", "dry-food", "charcuterie", "fish", "fruits", "pastries", "plant-proteins", "red-meat", "veggies", "white-meat", "outdoor"];
const types = ["photo", "ingredients", "recipes"];

function normalizeRecipeId(prefix, idNum) {
  const paddedId = idNum.toString().padStart(3, '0');
  return `${prefix.toLowerCase()}-${paddedId}`;
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

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const recipesData = JSON.parse(fs.readFileSync(recipesDataPath, 'utf-8'));

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
    if (data.name) {
      result[recipeId].name = data.name.replace(/_/g, ' ').trim();
    }
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

const sorted = Object.fromEntries(
  Object.entries(result).sort(([a], [b]) => a.localeCompare(b))
);

fs.writeFileSync(outputPath, JSON.stringify(sorted, null, 2));

console.log(`\n✅ recipes-db.json généré : ${Object.keys(sorted).length} recettes totales`);
console.log(`   📁 ${outputPath}`);
console.log('\n💡 Rappel : complète manuellement les champs mealType[] et kind pour chaque recette.');
