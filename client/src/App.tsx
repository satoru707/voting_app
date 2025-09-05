import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Header } from "./components/Layout/Header";
import { LoginForm } from "./components/Auth/LoginForm";
import { VerifyToken } from "./components/Auth/VerifyToken";
import { LandingPage } from "./components/Landing/LandingPage";
import { Dashboard as ElectionsDashboard } from "./components/Dashboard/Dashboard";
import { AdminPanel } from "./components/Admin/AdminPanel";
import { SuperAdminPanel } from "./components/SuperAdmin/SuperAdminPanel";
import { NotAdminMessage } from "./components/Admin/NotAdminMessage";
import { Toaster, toast } from "sonner";

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  console.log("User", user);

  const [authView, setAuthView] = useState<"landing" | "login" | "verify">(
    "landing"
  );
  const [selectedTab, setSelectedTab] = useState<"elections" | "admin">(
    "admin"
  );
  const [authLoading, setAuthLoading] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  // Check for verification token in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      setVerifyToken(token);
      setAuthView("verify");
    }
  }, []);

  const handleRequestMagicLink = async (email: string) => {
    setAuthLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/request-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Check your email for a secure login link!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send login link");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        ) : authView === "verify" && verifyToken ? (
          <VerifyToken token={verifyToken} />
        ) : authView === "login" ? (
          <div>
            <LoginForm
              onSubmit={handleRequestMagicLink}
              loading={authLoading}
            />
          </div>
        ) : !user ? (
          <LandingPage onLogin={() => setAuthView("login")} />
        ) : (
          <>
            <div className="max-w-7xl mx-auto mb-6">
              <div className="flex space-x-4 border-b border-gray-200">
                {user.role != "SUPER_ADMIN" && (
                  <button
                    onClick={() => setSelectedTab("elections")}
                    className={`px-4 py-2 text-sm font-medium transition-colors
                    ${
                      selectedTab === "elections"
                        ? "border-b-2 border-blue-600 text-blue-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Elections
                  </button>
                )}

                <button
                  onClick={() => setSelectedTab("admin")}
                  className={`px-4 py-2 text-sm font-medium transition-colors
                    ${
                      selectedTab === "admin"
                        ? "border-b-2 border-blue-600 text-blue-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {selectedTab === "elections" && <ElectionsDashboard />}

            {selectedTab === "admin" &&
              (user.role === "SUPER_ADMIN" ? (
                <SuperAdminPanel />
              ) : user.role === "ADMIN" ? (
                <AdminPanel />
              ) : (
                <NotAdminMessage />
              ))}
          </>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster richColors />
    </AuthProvider>
  );
}

export default App;
