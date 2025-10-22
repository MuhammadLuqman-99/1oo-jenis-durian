"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/lib/toast";

export default function AdminLogin() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/admin");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(email, password);

      if (result.success) {
        showSuccess("Login successful!");
        router.push("/admin");
      } else {
        setError(result.error || "Login failed");
        showError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      showError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tropical-green via-green-700 to-tropical-brown flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tropical-green via-green-700 to-tropical-brown flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌿</div>
          <h1 className="text-4xl font-bold text-white mb-2">100 Jenis Durian</h1>
          <p className="text-gray-200">Admin Dashboard Login</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Sign In
          </h2>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none transition-colors"
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="text-gray-400 hover:text-gray-600" size={20} />
                  ) : (
                    <Eye className="text-gray-400 hover:text-gray-600" size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-tropical-green to-tropical-lime text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* First Time Setup Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-blue-800 font-semibold mb-2">🔐 First Time Setup?</p>
            <p className="text-xs text-blue-700 mb-2">
              You need to create an owner account first. Go to Firebase Console:
            </p>
            <ol className="text-xs text-blue-600 space-y-1 ml-4 list-decimal">
              <li>Open Firebase Console</li>
              <li>Go to Authentication → Users</li>
              <li>Click "Add user"</li>
              <li>Create your admin email & password</li>
              <li>Then login here</li>
            </ol>
          </div>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <a href="/admin/forgot-password" className="text-sm text-gray-600 hover:text-tropical-green transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Back to Website */}
          <div className="mt-4 text-center">
            <a href="/" className="text-sm text-gray-600 hover:text-tropical-green transition-colors">
              ← Back to Website
            </a>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-6 text-center text-white text-xs opacity-75">
          <p>🔒 Secured by Firebase Authentication</p>
          <p className="mt-1">All login attempts are encrypted and logged</p>
        </div>
      </div>
    </div>
  );
}
