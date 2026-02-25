import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './shared/components/Layout';
import { useEffect } from 'react';
import { useMenuStore } from './shared/store/useMenuStore';

// Imports des Modules Fonctionnels
import { RecipeModule } from './features/recipes/RecipeModule';
import { CategoryDetail } from './features/recipes/CategoryDetail';
import { RecipeDetail } from './features/recipes/RecipeDetail';
import { PlanningModule } from './features/planning/PlanningModule';
import { ShoppingModule } from './features/shopping/ShoppingModule';
import { WeekTransitionModal } from './features/planning/components/WeekTransitionModal';

function App() {
  const initWeek = useMenuStore((state) => state.initWeek);

  useEffect(() => {
    initWeek();
  }, [initWeek]);

  return (
    <Router>
      <Layout>
        {/* La modale est ici, accessible globalement */}
        <WeekTransitionModal />

        <Routes>
          {/* Redirection par défaut vers les recettes */}
          <Route path="/" element={<Navigate to="/recipes" replace />} />

          {/* --- MODULE RECETTES --- */}
          <Route path="/recipes" element={<RecipeModule />} />
          <Route path="/recipes/category/:categoryId" element={<CategoryDetail />} />
          <Route path="/recipes/detail/:recipeId" element={<RecipeDetail />} />

          {/* --- MODULE PLANNING --- */}
          <Route path="/planning" element={<PlanningModule />} />

          {/* --- MODULE COURSES --- */}
          <Route path="/shopping" element={<ShoppingModule />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;