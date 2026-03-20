import { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './shared/components/layout/Layout';
import { NotificationBanner } from './shared/components/ui/NotificationBanner';
import { SplashScreen } from './shared/components/ui/SplashScreen';
import { useBackupReminder } from './shared/hooks/useBackupReminder';
import { useAppInit } from './shared/hooks/useAppInit';

const JournalModule = lazy(() => import('./features/journal/JournalModule').then(({ JournalModule: m }) => ({ default: m })));
const RecipeModule = lazy(() => import('./features/recipes/RecipeModule').then(({ RecipeModule: m }) => ({ default: m })));
const CategoryDetail = lazy(() => import('./features/recipes/components/detail/CategoryDetail').then(({ CategoryDetail: m }) => ({ default: m })));
const RecipeDetail = lazy(() => import('./features/recipes/components/detail/RecipeDetail').then(({ RecipeDetail: m }) => ({ default: m })));
const RecipeMacroPage = lazy(() => import('./features/recipes/components/macro/RecipeMacroPage').then(({ RecipeMacroPage: m }) => ({ default: m })));
const PlanningModule = lazy(() => import('./features/planning/PlanningModule').then(({ PlanningModule: m }) => ({ default: m })));
const ShoppingModule = lazy(() => import('./features/shopping/ShoppingModule').then(({ ShoppingModule: m }) => ({ default: m })));
const HouseholdModule = lazy(() => import('./features/household/HouseholdModule').then(({ HouseholdModule: m }) => ({ default: m })));
const FreezerModule = lazy(() => import('./features/freezer/FreezerModule').then(({ FreezerModule: m }) => ({ default: m })));
const RecipeBuilderModule = lazy(() => import('./features/recipeBuilder/RecipeBuilderModule').then(({ RecipeBuilderModule: m }) => ({ default: m })));

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
          <Suspense>
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
          </Suspense>
        </Layout>
      </Router>
    </>
  );
}

export default App;
