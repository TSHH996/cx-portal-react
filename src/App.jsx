import { AppShellProvider } from "./contexts/AppShellContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { AppRouter } from "./app/router";

function App() {
  return (
    <AppShellProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </AppShellProvider>
  );
}

export default App;
