"use client";

import { useRouter } from "next/navigation";
import { useShop } from "@/app/context/ShopContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, user, setSelectedCartItems } = useShop();
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Toggle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(cart.map(item => item.variantId)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Toggle individual item
  const handleSelectItem = (variantId: number, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(variantId);
    } else {
      newSelected.delete(variantId);
    }
    setSelectedItems(newSelected);
  };

  const isAllSelected = cart.length > 0 && selectedItems.size === cart.length;
  const selectedCount = selectedItems.size;

  const parseAttributes = (attributesJson: string): string => {
    try {
      const attrs = JSON.parse(attributesJson);
      return Object.entries(attrs)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    } catch (e) {
      return "";
    }
  };

  const handleUpdateQuantity = async (variantId: number, newQuantity: number) => {
    setLoading(prev => ({ ...prev, [variantId]: true }));
    try {
      await updateQuantity(variantId, newQuantity);
    } finally {
      setLoading(prev => ({ ...prev, [variantId]: false }));
    }
  };

  const handleRemove = async (variantId: number) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    setLoading(prev => ({ ...prev, [variantId]: true }));
    try {
      await removeFromCart(variantId);
      // Remove from selected items
      const newSelected = new Set(selectedItems);
      newSelected.delete(variantId);
      setSelectedItems(newSelected);
    } finally {
      setLoading(prev => ({ ...prev, [variantId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;
    await clearCart();
    setSelectedItems(new Set());
  };

  // Tính tổng cho items được chọn
  const selectedItemsData = cart.filter(item => selectedItems.has(item.variantId));
  const totalAmount = selectedItemsData.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalItems = selectedItemsData.reduce((sum, item) => sum + item.quantity, 0);

  // Tổng tất cả items
  const allTotalAmount = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const allTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem giỏ hàng</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Giỏ hàng</h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingBag className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Giỏ hàng của bạn</h1>
            <p className="text-gray-600 mt-1">{allTotalItems} sản phẩm</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Tiếp tục mua sắm
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-orange-500 cursor-pointer"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <span className="font-medium text-gray-700">
                    Chọn tất cả ({cart.length})
                  </span>
                </div>
                <button
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="divide-y">
                {cart.map((item) => {
                  const attributes = parseAttributes(item.attributesJson);
                  const isLoading = loading[item.variantId];
                  const isSelected = selectedItems.has(item.variantId);

                  return (
                    <div
                      key={item.itemId}
                      className={`p-4 hover:bg-gray-50 transition ${isSelected ? 'bg-orange-50' : ''}`}
                    >
                      <div className="flex gap-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-orange-500 mt-2 cursor-pointer"
                          checked={isSelected}
                          onChange={(e) => handleSelectItem(item.variantId, e.target.checked)}
                        />

                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                            {item.productName}
                          </h3>

                          {attributes && (
                            <p className="text-sm text-gray-500 mb-2">{attributes}</p>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            {/* Price */}
                            <div>
                              <p className="text-lg font-bold text-orange-600">
                                {item.price.toLocaleString("vi-VN")}₫
                              </p>
                              <p className="text-xs text-gray-500">
                                Tổng: {item.lineTotal.toLocaleString("vi-VN")}₫
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() => handleUpdateQuantity(item.variantId, item.quantity - 1)}
                                  disabled={isLoading || item.quantity <= 1}
                                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>

                                <span className="px-4 py-2 font-semibold min-w-[50px] text-center">
                                  {isLoading ? "..." : item.quantity}
                                </span>

                                <button
                                  onClick={() => handleUpdateQuantity(item.variantId, item.quantity + 1)}
                                  disabled={isLoading}
                                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              <button
                                onClick={() => handleRemove(item.variantId)}
                                disabled={isLoading}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>

              {/* Chi tiết từng sản phẩm được chọn */}
              {selectedCount > 0 && (
                <div className="mb-4 pb-4 border-b max-h-60 overflow-y-auto">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Sản phẩm đã chọn ({selectedCount}):
                  </p>
                  {selectedItemsData.map((item) => (
                    <div key={item.variantId} className="flex justify-between text-sm text-gray-600 mb-2">
                      <span className="flex-1 truncate">{item.productName} x{item.quantity}</span>
                      <span className="font-semibold ml-2">
                        {item.lineTotal.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({selectedCount || 0} sản phẩm)</span>
                  <span className="font-semibold">{totalAmount.toLocaleString("vi-VN")}₫</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-semibold">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-800 mb-6">
                <span>Tổng cộng</span>
                <span className="text-orange-600">{totalAmount.toLocaleString("vi-VN")}₫</span>
              </div>

              <button
                onClick={() => {
                  if (selectedCount === 0) {
                    alert("Vui lòng chọn ít nhất một sản phẩm!");
                    return;
                  }
                  // Save selected items to context before navigation
                  setSelectedCartItems(selectedItems);
                  router.push("/checkout");
                }}
                disabled={selectedCount === 0}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiến hành thanh toán ({selectedCount})
              </button>

              <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-800">
                  🎉 Miễn phí vận chuyển cho đơn hàng từ 0đ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}