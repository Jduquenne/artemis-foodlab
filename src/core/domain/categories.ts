export interface Category {
  id: string; // Doit correspondre exactement au nom du dossier dans /public
  name: string; // Nom affiché dans l'interface
  color: string; // Pour l'UI
}

export const CATEGORIES: Category[] = [
  { id: "bases", name: "Bases", color: "bg-slate-500" },
  { id: "cereal-products", name: "Produits Céréaliers", color: "bg-amber-500" },
  { id: "dairy-products", name: "Produits Laitiers", color: "bg-blue-400" },
  { id: "dry-food", name: "Aliments Secs", color: "bg-amber-700" },
  { id: "charcuterie", name: "Charcuterie", color: "bg-pink-600" },
  { id: "fish", name: "Poissons", color: "bg-blue-500" },
  { id: "fruits", name: "Fruits", color: "bg-green-500" },
  { id: "pastries", name: "Pâtisseries", color: "bg-yellow-500" },
  { id: "plant-proteins", name: "Protéines Végétales", color: "bg-green-600" },
  { id: "red-meat", name: "Viandes Rouges", color: "bg-red-700" },
  { id: "veggies", name: "Végétarien", color: "bg-emerald-500" },
  { id: "white-meat", name: "Viandes Blanches", color: "bg-orange-400" },
  { id: "outdoor", name: "Extérieur", color: "bg-rose-500" },
];

// Helper pour récupérer une catégorie par son ID
export const getCategoryById = (id: string) =>
  CATEGORIES.find((c) => c.id === id);
