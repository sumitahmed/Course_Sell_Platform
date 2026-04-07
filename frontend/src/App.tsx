import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { AdminAuthPage } from "./pages/AdminAuthPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AuthChoicePage } from "./pages/AuthChoicePage";
import { CourseCatalogPage } from "./pages/CourseCatalogPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PurchasesPage } from "./pages/PurchasesPage";
import { UserAuthPage } from "./pages/UserAuthPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CourseCatalogPage />} />
        <Route path="/auth" element={<AuthChoicePage />} />
        <Route path="/user/auth" element={<UserAuthPage />} />
        <Route path="/admin/auth" element={<AdminAuthPage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
