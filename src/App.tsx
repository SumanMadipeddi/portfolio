import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Interviews from "./pages/Interviews";
import CompanyDetail from "./pages/CompanyDetail";
import RoleDetail from "./pages/RoleDetail";
import NotFound from "./pages/NotFound";

const App = () => (
  <>
    <Toaster />
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/resume" element={<Admin />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="/companies/:companyId" element={<CompanyDetail />} />
        <Route path="/roles/:roleId" element={<RoleDetail />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
);

export default App;
