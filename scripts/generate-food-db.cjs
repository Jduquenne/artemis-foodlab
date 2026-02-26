const fs = require('fs');
const path = require('path');

const recipesDbPath = path.join(__dirname, '..', 'src/core/data/recipes-db.json');
const outputPath = path.join(__dirname, '..', 'src/core/data/food-db.json');

const CATEGORY_PREFIX = {
  'Boulangerie': 'bk',
  'Charcuterie': 'ct',
  'Conserves': 'cn',
  'Epices et condiments': 'ep',
  'Epicerie sucrée': 'es',
  'Ferme': 'fm',
  'Fruits et légumes': 'fv',
  'Fruits secs': 'fs',
  'Féculents': 'fc',
  'Hors achats': 'ha',
  'Internet': 'it',
  'Poisson': 'po',
  'Produits laitiers': 'pl',
  'Recette': 'rc',
  'Surgelés': 'sl',
  'Viande': 'vi',
  'Inconnu': 'uk',
};

const PREP_PATTERN = /^(.*?)\s*\(([^)]+)\)$/;

console.log('🔍 Lecture de recipes-db.json...');
const recipesDb = JSON.parse(fs.readFileSync(recipesDbPath, 'utf-8'));

const allIngredients = [];
for (const recipe of Object.values(recipesDb)) {
  if (!recipe.ingredients) continue;
  for (const ing of recipe.ingredients) {
    if (ing.name && ing.category) {
      allIngredients.push({ name: ing.name.trim(), category: ing.category });
    }
  }
}

console.log(`   📦 ${allIngredients.length} occurrences collectées`);

const standaloneNames = new Set();
for (const { name, category } of allIngredients) {
  if (!PREP_PATTERN.test(name)) {
    standaloneNames.add(`${category}|${name.toLowerCase()}`);
  }
}

const foodsMap = new Map();
for (const { name, category } of allIngredients) {
  const match = name.match(PREP_PATTERN);
  let canonicalName = name;

  if (match) {
    const baseName = match[1].trim();
    if (standaloneNames.has(`${category}|${baseName.toLowerCase()}`)) {
      canonicalName = baseName;
    }
  }

  const foodKey = `${category}|${canonicalName.toLowerCase()}`;
  if (!foodsMap.has(foodKey)) {
    foodsMap.set(foodKey, { name: canonicalName, category });
  }
}

console.log(`   ✅ ${foodsMap.size} aliments uniques identifiés`);

const byCategory = new Map();
for (const food of foodsMap.values()) {
  if (!byCategory.has(food.category)) byCategory.set(food.category, []);
  byCategory.get(food.category).push(food);
}

for (const foods of byCategory.values()) {
  foods.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

const result = {};
const sortedCategories = [...byCategory.keys()].sort((a, b) => a.localeCompare(b, 'fr'));

let totalFoods = 0;
for (const category of sortedCategories) {
  const prefix = CATEGORY_PREFIX[category] ?? 'uk';
  const foods = byCategory.get(category);
  foods.forEach((food, index) => {
    const id = `${prefix}-${String(index + 1).padStart(3, '0')}`;
    result[id] = { id, name: food.name, category: food.category };
    totalFoods++;
  });
}

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

console.log(`\n✅ food-db.json généré : ${totalFoods} aliments`);
console.log(`   📁 ${outputPath}`);
console.log('\n💡 Détail par catégorie :');
for (const category of sortedCategories) {
  const count = byCategory.get(category).length;
  const prefix = CATEGORY_PREFIX[category] ?? 'uk';
  console.log(`   ${prefix}- → ${count.toString().padStart(3)} aliments  [${category}]`);
}
