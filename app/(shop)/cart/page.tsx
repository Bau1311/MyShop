"use client";

import { useEffect, useState } from "react";
import { useShop } from "../../context/ShopContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Minus, Trash2, Lock, ShoppingCart, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { user, cart, removeFromCart, clearCart, updateQuantity, decreaseQuantity, isInitialized } = useShop();
  const [isLoading, setIsLoading] = useState(true);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    if (isInitialized) {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const handleCheckout = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để tiếp tục thanh toán!');
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }

    router.push("/checkout");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // ❌ CHƯA ĐĂNG NHẬP -> Hiển thị màn hình yêu cầu đăng nhập
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Vui lòng đăng nhập
            </h2>
            <p className="text-gray-600">
              Bạn cần đăng nhập để xem giỏ hàng và tiếp tục mua sắm
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Đăng nhập ngay
            </Link>
            
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-orange-500 font-semibold hover:text-orange-600"
              >
                Đăng ký
              </Link>
            </p>

            <Link
              href="/"
              className="block w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Quay về trang chủ
            </Link>
          </div>

          {/* Lợi ích khi đăng nhập */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Lợi ích khi đăng nhập:
            </p>
            <div className="space-y-2 text-left text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Lưu giỏ hàng trên mọi thiết bị</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Theo dõi đơn hàng dễ dàng</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Nhận ưu đãi độc quyền</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Thanh toán nhanh chóng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ĐÃ ĐĂNG NHẬP - GIỎ HÀNG TRỐNG
  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
            <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-16 h-16 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ĐÃ ĐĂNG NHẬP - CÓ SẢN PHẨM TRONG GIỎ
  return (
    <div className="bg-gradient-to-b from-orange-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-orange-500" />
              Giỏ hàng của bạn
            </h1>
            <p className="text-gray-600 mt-1">
              {cart.length} sản phẩm
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Tiếp tục mua sắm</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 bg-gray-100 p-4 font-semibold text-gray-700">
            <div className="col-span-5">Sản phẩm</div>
            <div className="col-span-2 text-center">Đơn giá</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-center">Thành tiền</div>
            <div className="col-span-1 text-center">Thao tác</div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="divide-y">
            {cart.map((item, index) => (
              <div
                key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-orange-50 transition"
              >
                {/* Tên sản phẩm + Ảnh */}
                <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                  <div className="bg-gradient-to-br from-orange-100 to-orange-50 w-20 h-20 flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                    {item.images && item.images.length > 0 ? (
                      <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 hover:text-orange-500 transition">
                      {item.name}
                    </h3>
                    
                    {item.selectedColor && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Màu:</span> {item.selectedColor}
                      </p>
                    )}
                    
                    {item.selectedSize && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Size:</span> {item.selectedSize}
                      </p>
                    )}
                  </div>
                </div>

                {/* Đơn giá */}
                <div className="col-span-4 md:col-span-2 text-center">
                  <span className="md:hidden font-semibold text-gray-600">Đơn giá: </span>
                  <span className="text-gray-700 font-medium">
                    {item.price.toLocaleString('vi-VN')}₫
                  </span>
                </div>

                {/* Số lượng */}
                <div className="col-span-4 md:col-span-2 flex justify-center items-center gap-2">
                  <button
                    onClick={() => decreaseQuantity(item.id, item.selectedColor, item.selectedSize)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-9 h-9 rounded-lg flex items-center justify-center transition shadow-sm hover:shadow"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="bg-gray-100 px-4 py-2 rounded-lg font-semibold text-gray-800 min-w-[50px] text-center">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
                    className="bg-orange-500 hover:bg-orange-600 text-white w-9 h-9 rounded-lg flex items-center justify-center transition shadow-sm hover:shadow"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Thành tiền */}
                <div className="col-span-4 md:col-span-2 text-center">
                  <span className="md:hidden font-semibold text-gray-600">Thành tiền: </span>
                  <span className="text-orange-500 font-bold text-lg">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                  </span>
                </div>

                {/* Nút xóa */}
                <div className="col-span-12 md:col-span-1 text-center">
                  <button
                    onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                    className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="md:hidden">Xóa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng cộng */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 border-t-2 border-orange-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <button
                onClick={clearCart}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition font-medium shadow-lg hover:shadow-xl"
              >
                🗑️ Xóa hết giỏ hàng
              </button>

              <div className="text-right">
                <p className="text-gray-600 mb-2">Tổng cộng:</p>
                <p className="text-4xl font-bold text-orange-500 mb-4">
                  {total.toLocaleString('vi-VN')}₫
                </p>
                
                <button
                  onClick={handleCheckout}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}