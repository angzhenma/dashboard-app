import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import Dashboard from "./pages/Dashboard";
import { Login } from "./pages/Login";

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-[var(--soc-bg)]
          text-[var(--soc-subtext)]
          text-sm
        "
      >
        Loading session...
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
