'use client';

import Link from 'next/link';
import { useShop } from '../context/ShopContext';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, ChevronDown, Search, Bell, Award } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, cart, setUser, clearCart } = useShop();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    setUser(null);
    clearCart();
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    alert('Đã đăng xuất!');
    router.push('/');
    setShowDropdown(false); 
  };

  const handleLinkClick = () => {
    setShowDropdown(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="hidden md:flex items-center gap-6">
              <span className="hover:text-orange-100 cursor-pointer transition">Kênh Người Bán</span>
              <span className="hover:text-orange-100 cursor-pointer transition">Trở thành Người bán</span>
              <span className="hover:text-orange-100 cursor-pointer flex items-center gap-1 transition">
                <Award className="w-4 h-4" />
                Tải ứng dụng
              </span>
            </div>
            <div className="flex items-center gap-4 md:gap-6 ml-auto">
              <button className="hover:text-orange-100 flex items-center gap-1 transition">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Thông báo</span>
              </button>
              <button className="hover:text-orange-100 transition hidden sm:inline">Hỗ trợ</button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <nav className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 py-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-2xl hover:opacity-90 transition whitespace-nowrap">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden sm:inline">MyShop</span>
            </Link>

            {/* SEARCH BAR */}
            <form onSubmit={handleSearch} className="flex-1 max-w-3xl relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm sản phẩm, thương hiệu và tên shop..."
                className="w-full px-4 md:px-5 py-2 md:py-3 pr-12 rounded-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-md"
              />
              <button 
                type="submit"
                className="absolute right-0 top-0 h-full px-4 md:px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-r-sm transition"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* Right side */}
            <div className="flex items-center gap-4">
              
              {/* Giỏ hàng */}
              <Link
                href="/cart"
                className="relative text-white hover:bg-orange-600 p-2 rounded-lg transition"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {user ? (
                <div 
                  className="relative" 
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  
                  {/* Nút kích hoạt (Trigger) */}
                  <div className="flex items-center gap-2 text-white hover:bg-orange-600 px-3 py-2 rounded-lg transition cursor-pointer">
                    {/* Avatar bên cạnh username */}
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <span className="font-medium max-w-[120px] truncate hidden md:inline">
                      {user.username || user.name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-0 pt-1 w-48 bg-white rounded-lg shadow-xl py-2 z-50 top-full">
                      <Link
                        href="/account/profile"
                        onClick={handleLinkClick} 
                        className="block px-4 py-2 text-gray-800 hover:bg-orange-50 transition"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Tài Khoản Của Tôi</span>
                        </div>
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={handleLinkClick} 
                        className="block px-4 py-2 text-gray-800 hover:bg-orange-50 transition"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Đơn Hàng Của Tôi</span>
                        </div>
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Đăng xuất</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-white hover:bg-orange-600 px-4 py-2 rounded-lg transition font-medium"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}