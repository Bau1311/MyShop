"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "../../context/ShopContext";
import Link from "next/link";
import { Eye, EyeOff, ShoppingBag, Lock, User } from "lucide-react";

const API_BASE_URL = 'http://localhost:8080/api';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { user, setUser, isInitialized } = useShop();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (user) {
      router.push('/');
    }
  }, [user, router, isInitialized]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log('🔐 [LOGIN] Attempting login...');
      console.log('🔐 [LOGIN] API URL:', API_BASE_URL);
      console.log('🔐 [LOGIN] Username:', username);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      console.log('📥 [LOGIN] Response status:', response.status);
      console.log('📥 [LOGIN] Response ok:', response.ok);

      const data = await response.json();
      console.log('📦 [LOGIN] Response data:', data);

      if (response.ok && data.userId) {
        console.log('✅ [LOGIN] Login successful!');
        console.log('👤 [LOGIN] UserId:', data.userId);
        console.log('🛒 [LOGIN] CartId:', data.cartId);
        console.log('📧 [LOGIN] Email:', data.email);
        console.log('📱 [LOGIN] Phone:', data.phone);

        // ✅ Lấy đầy đủ thông tin từ backend
        const userData = {
          userId: data.userId,
          username: data.username || username,
          name: data.fullName || username,
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "customer",
          status: data.status || "active",
          gender: "",
          birthday: "",
          avatar: null,
        };

        setUser(userData);

        // Lưu vào localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', data.userId.toString());
        if (data.cartId) {
          localStorage.setItem('cartId', data.cartId.toString());
        }

        alert("Đăng nhập thành công!");
        router.push("/");
      } else {
        console.error('❌ [LOGIN] Login failed - Invalid credentials');
        setError("Tên đăng nhập hoặc mật khẩu không đúng!");
      }
    } catch (error: any) {
      console.error("💥 [LOGIN] Exception:", error);
      console.error("💥 [LOGIN] Error message:", error.message);
      setError("Không thể kết nối đến server. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized || user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white font-medium">
            {!isInitialized ? "Đang kiểm tra..." : "Đang chuyển hướng..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">

        {/* LEFT SIDE - Branding */}
        <div className="hidden md:flex flex-col items-center justify-center text-white space-y-6 p-8">
          <div className="flex items-center gap-3">
            <div className="bg-white p-4 rounded-2xl shadow-2xl">
              <ShoppingBag className="w-12 h-12 text-orange-500" />
            </div>
          </div>
          <h1 className="text-5xl font-bold drop-shadow-lg">MyShop</h1>
          <p className="text-xl text-center text-white/90 max-w-md leading-relaxed">
            Nền tảng mua sắm trực tuyến hàng đầu
          </p>
          <div className="flex items-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold">1M+</div>
              <div className="text-sm text-white/80">Sản phẩm</div>
            </div>
            <div className="h-12 w-px bg-white/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold">500K+</div>
              <div className="text-sm text-white/80">Người dùng</div>
            </div>
            <div className="h-12 w-px bg-white/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold">4.8★</div>
              <div className="text-sm text-white/80">Đánh giá</div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 space-y-6">

          {/* Mobile Logo */}
          <div className="md:hidden flex items-center justify-center gap-3 mb-6">
            <div className="bg-orange-500 p-3 rounded-xl">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">MyShop</h2>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
            <p className="text-gray-500">Chào mừng bạn quay trở lại!</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition text-gray-800 placeholder:text-gray-400 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition text-gray-800 placeholder:text-gray-400 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  disabled={isLoading}
                />
                <span className="text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                className="text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50"
                disabled={isLoading}
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>

            {/* Register Link */}
            <p className="text-center text-gray-600">
              Bạn mới biết đến MyShop?{" "}
              <Link
                href="/register"
                className={`text-orange-500 font-semibold hover:text-orange-600 transition ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
              >
                Đăng ký
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}