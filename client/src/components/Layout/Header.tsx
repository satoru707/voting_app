import React from "react";
import { Vote, LogOut, Shield, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// No HeaderProps needed as tabs are moved out
export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleIcon = () => {
    if (!user) return null;

    if (user.role === "SUPER_ADMIN") {
      return <Shield className="w-4 h-4 text-red-500" />;
    } else if (user.role === "ADMIN") {
      return <Settings className="w-4 h-4 text-blue-500" />;
    }
    return null;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Vote className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">UniVote</h1>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getRoleIcon()}
                <span className="text-sm font-medium text-gray-700">
                  {user.matricNo}
                </span>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
