const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const outputDir = path.join(rootDir, 'src/core/data');
const categories = ["bases", "cereal-products", "dairy-products", "dry-food", "charcuterie", "fish", "fruits", "pastries", "plant-proteins", "red-meat", "veggies", "white-meat","outdoor"];
const types = ["photo", "ingredients", "recipes"];

const manifest = [];

console.log("🔍 Début du scan des assets...");

categories.forEach(cat => {
  types.forEach(type => {
    const fullPath = path.join(publicDir, cat, type);
    
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath);
      const imageFiles = files.filter(f => f.match(/\.(png|webp|jpg|jpeg)$/i));
      
      console.log(`   - [${cat}/${type}] : ${imageFiles.length} images trouvées.`);
      
      imageFiles.forEach(file => {
        manifest.push({
          categoryFolder: cat,
          typeFolder: type,
          fileName: file
        });
      });
    } else {
      console.warn(`   - ⚠️ Dossier introuvable : public/${cat}/${type}`);
    }
  });
});

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'assets-manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`\n✅ Terminé ! ${manifest.length} fichiers totaux enregistrés dans assets-manifest.json`);