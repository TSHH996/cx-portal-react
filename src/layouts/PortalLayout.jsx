import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { useAppShell } from "../contexts/AppShellContext";

function pageKeyFromPath(pathname) {
  if (pathname.startsWith("/tickets")) return "tickets";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/settings")) return "settings";
  return "dashboard";
}

function PortalLayout() {
  const location = useLocation();
  const { language, pageCopy } = useAppShell();
  const pageKey = pageKeyFromPath(location.pathname);
  const currentPage = pageCopy[pageKey][language];

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <Topbar title={currentPage.title} subtitle={currentPage.sub} />
        <section className="page-shell">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default PortalLayout;
