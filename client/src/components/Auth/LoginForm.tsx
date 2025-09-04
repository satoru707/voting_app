import React, { useState } from "react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

interface LoginFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [matricNo, setMatricNo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricNo.trim()) return;

    await onSubmit(matricNo.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sign In to UniVote
            </h1>
            <p className="text-gray-600 mt-2">
              Enter your matric number to receive a secure login link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                id="matricNo"
                type="matricNo"
                value={matricNo}
                onChange={(e) => setMatricNo(e.target.value)}
                placeholder="CSC/2022/001"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={!matricNo.trim() || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Send Login Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-gray-500">
            <p>A secure login link will be sent to your email</p>
          </div>
        </div>
      </div>
    </div>
  );
};
