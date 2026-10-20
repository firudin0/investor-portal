import { Link, NavLink, Route, Routes } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import ResultsPage from "./pages/ResultsPage";
import ApplicationForm from "./pages/ApplicationForm";
import Confirmation from "./pages/Confirmation";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-main">
          <div className="container header-main-inner">
            <Link to="/" className="brand">
              <img src="/logo.svg" alt="" className="logo" />
              <span className="brand-text">
                Azərbaycan Respublikasının
                <br />
                Kənd Təsərrüfatı Nazirliyi
              </span>
            </Link>
            <div className="header-side">
              <p className="header-slogan">Kənd Təsərrüfatı üzrə Dövlət Proqramı (2026-2030)</p>
              <nav className="main-nav" aria-label="Əsas menyu">
                <NavLink to="/" end>İnvestor Portalı</NavLink>
                <NavLink to="/muraciet">Müraciət</NavLink>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <main className="site-main">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/neticeler" element={<ResultsPage />} />
          <Route path="/muraciet" element={<ApplicationForm />} />
          <Route path="/tesdiq" element={<Confirmation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="brand brand-footer">
            <img src="/logo.svg" alt="" className="logo" />
            <span className="brand-text">
              Azərbaycan Respublikasının
              <br />
              <strong>Kənd Təsərrüfatı Nazirliyi</strong>
            </span>
          </div>
          <p className="footer-copy">Kənd Təsərrüfatı üzrə Dövlət Proqramı (2026-2030) · İnvestor Portalı</p>
        </div>
      </footer>
    </div>
  );
}
