import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './shared/components/layout/Layout';
import { NotificationBanner } from './shared/components/ui/NotificationBanner';
import { SplashScreen } from './shared/components/ui/SplashScreen';
import { useBackupReminder } from './shared/hooks/useBackupReminder';
import { useAppInit } from './shared/hooks/useAppInit';

import { JournalModule } from './features/journal/JournalModule';
import { RecipeModule } from './features/recipes/RecipeModule';
import { CategoryDetail } from './features/recipes/components/CategoryDetail';
import { RecipeDetail } from './features/recipes/components/RecipeDetail';
import { RecipeMacroPage } from './features/recipes/components/RecipeMacroPage';
import { PlanningModule } from './features/planning/PlanningModule';
import { ShoppingModule } from './features/shopping/ShoppingModule';
import { HouseholdModule } from './features/household/HouseholdModule';
import { FreezerModule } from './features/freezer/FreezerModule';
import { RecipeBuilderModule } from './features/recipeBuilder/RecipeBuilderModule';

function App() {
  const isReady = useAppInit();
  const [splashDone, setSplashDone] = useState(false);
  const splashExiting = isReady && !splashDone;

  useBackupReminder();

  useEffect(() => {
    if (!isReady) return;
    const t = setTimeout(() => setSplashDone(true), 450);
    return () => clearTimeout(t);
  }, [isReady]);

  return (
    <>
      {!splashDone && <SplashScreen isExiting={splashExiting} />}
      <NotificationBanner />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/journal" replace />} />

            <Route path="/journal" element={<JournalModule />} />

            <Route path="/recipes" element={<RecipeModule />} />
            <Route path="/recipes/category/:categoryId" element={<CategoryDetail />} />
            <Route path="/recipes/detail/:recipeId" element={<RecipeDetail />} />
            <Route path="/recipes/detail/:recipeId/macros" element={<RecipeMacroPage />} />

            <Route path="/planning" element={<PlanningModule />} />
            <Route path="/shopping" element={<ShoppingModule />} />
            <Route path="/household" element={<HouseholdModule />} />
            <Route path="/freezer" element={<FreezerModule />} />
            <Route path="/recipe-builder" element={<RecipeBuilderModule />} />
          </Routes>
        </Layout>
      </Router>
    </>
  );
}

export default App;
