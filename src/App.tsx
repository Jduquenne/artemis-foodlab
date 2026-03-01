import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './shared/components/Layout';
import { NotificationBanner } from './shared/components/NotificationBanner';
import { useBackupReminder } from './shared/hooks/useBackupReminder';

// Imports des Modules Fonctionnels
import { RecipeModule } from './features/recipes/RecipeModule';
import { CategoryDetail } from './features/recipes/CategoryDetail';
import { RecipeDetail } from './features/recipes/RecipeDetail';
import { PlanningModule } from './features/planning/PlanningModule';
import { ShoppingModule } from './features/shopping/ShoppingModule';
import { HouseholdModule } from './features/household/HouseholdModule';
import { FreezerModule } from './features/freezer/FreezerModule';

function App() {
  useBackupReminder();

  return (
    <>
      <NotificationBanner />
      <Router>
        <Layout>
        <Routes>
          {/* Redirection par défaut vers les recettes */}
          <Route path="/" element={<Navigate to="/recipes" replace />} />

          {/* --- MODULE RECETTES --- */}
          <Route path="/recipes" element={<RecipeModule />} />
          <Route path="/recipes/category/:categoryId" element={<CategoryDetail />} />
          <Route path="/recipes/detail/:recipeId" element={<RecipeDetail />} />

          {/* --- MODULE QUOTIDIEN --- */}
          <Route path="/household" element={<HouseholdModule />} />

          {/* --- MODULE PLANNING --- */}
          <Route path="/planning" element={<PlanningModule />} />

          {/* --- MODULE COURSES --- */}
          <Route path="/shopping" element={<ShoppingModule />} />

          {/* --- MODULE CONGELATEUR --- */}
          <Route path="/freezer" element={<FreezerModule />} />
        </Routes>
      </Layout>
    </Router>
    </>
  );
}

export default App;