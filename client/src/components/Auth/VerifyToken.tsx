import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

interface VerifyTokenProps {
  token: string;
}

export const VerifyToken: React.FC<VerifyTokenProps> = ({ token }) => {
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  // const [message, setMessage] = useState(''); // Remove this state

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      await login(token);
      setStatus("success");
      toast.success("Successfully authenticated! Redirecting...");

      // Redirect after a brief delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      setStatus("error");
      toast.error("Invalid or expired token. Please request a new login link.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
            {status === "loading" && (
              <div className="bg-blue-100">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="bg-green-100">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-100">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {status === "loading" && "Verifying..."}
              {status === "success" && "Welcome!"}
              {status === "error" && "Verification Failed"}
            </h1>
            {/* <p className="text-gray-600 mt-2">{message}</p> */}
          </div>

          {status === "error" && (
            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
