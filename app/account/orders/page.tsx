'use client';
import { useEffect, useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrdersPage() {
  const { user, isInitialized, orders, setOrders } = useShop();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled'>('all');

  // ✅ Thêm hàm hủy đơn hàng (có lưu vào localStorage riêng từng user)
  const handleCancelOrder = (orderId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: "cancelled" as const } : order
    );
    setOrders(updatedOrders);
    if (user?.email) {
      localStorage.setItem(`orders_${user.email}`, JSON.stringify(updatedOrders));
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/login');
      return;
    }
    const saved = localStorage.getItem(`orders_${user.email}`);
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch (err) {
        console.error('Lỗi khi đọc đơn hàng:', err);
      }
    }
  }, [user, isInitialized, router, setOrders]);

  // Loading khi đang khởi tạo
  if (!isInitialized) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  // Loading khi đang redirect
  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600">Đang chuyển hướng...</div>
        </div>
      </div>
    );
  }

  // Lọc đơn hàng theo tab
  const filteredOrders =
    activeTab === 'all' ? orders : orders.filter(order => order.status === activeTab);

  // Labels cho status
  const statusLabels = {
    pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
    shipping: { label: 'Đang giao', color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SIDEBAR BÊN TRÁI - ĐÃ SỬA */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {user.username || user.email?.split('@')[0] || 'user'}
                  </p>
                  <Link
                    href="/account/profile"
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Sửa Hồ Sơ
                  </Link>
                </div>
              </div>

              {/* Menu sidebar - ĐÃ SỬA */}
              <nav className="mt-4 space-y-1">
                {/* Tài Khoản Của Tôi - CHỈ là label, KHÔNG click */}
                <div className="flex items-center gap-3 px-3 py-2 text-gray-700">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="font-medium">Tài Khoản Của Tôi</span>
                </div>

                {/* Submenu Hồ Sơ */}
                <Link
                  href="/account/profile"
                  className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <span className="ml-8 text-sm">Hồ Sơ</span>
                </Link>

                {/* Đơn Mua */}
                <Link
                  href="/account/orders"
                  className="flex items-center gap-3 px-3 py-2 text-orange-500 bg-orange-50 rounded-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Đơn Hàng Của Tôi
                </Link>
              </nav>
            </div>
          </div>

          {/* NỘI DUNG CHÍNH BÊN PHẢI */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Tabs */}
              <div className="border-b">
                <div className="flex gap-8 px-6 pt-4 overflow-x-auto">
                  {['all', 'pending', 'processing', 'shipping', 'completed', 'cancelled'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`pb-3 whitespace-nowrap ${
                        activeTab === tab
                          ? 'text-orange-500 border-b-2 border-orange-500 font-medium'
                          : 'text-gray-600 hover:text-orange-500'
                      }`}
                    >
                      {{
                        all: 'Tất cả',
                        pending: 'Chờ xác nhận',
                        processing: 'Đang xử lý',
                        shipping: 'Đang giao',
                        completed: 'Đã giao',
                        cancelled: 'Đã hủy',
                      }[tab]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="p-6 border-b">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo Tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  />
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Orders */}
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <svg
                      className="w-24 h-24 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      {activeTab === 'all'
                        ? 'Chưa có đơn hàng'
                        : 'Không có đơn hàng ở trạng thái này'}
                    </p>
                    <Link
                      href="/"
                      className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded transition-colors"
                    >
                      Mua sắm ngay
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredOrders.map(order => (
                    <div
                      key={order.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b">
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-800">
                            Đơn hàng {order.orderNumber}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[order.status].color}`}
                          >
                            {statusLabels[order.status].label}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-3 mb-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-orange-50 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                              {item.image}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 truncate">
                                {item.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Số lượng: x{item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-orange-600 font-semibold whitespace-nowrap">
                                {item.price.toLocaleString('vi-VN')}₫
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Customer info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <p className="text-gray-700">
                            <span className="font-medium">Người nhận:</span>{' '}
                            {order.customerInfo.fullName}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">SĐT:</span>{' '}
                            {order.customerInfo.phone}
                          </p>
                          <p className="text-gray-700 md:col-span-2">
                            <span className="font-medium">Địa chỉ:</span>{' '}
                            {order.customerInfo.address},{' '}
                            {order.customerInfo.ward},{' '}
                            {order.customerInfo.district},{' '}
                            {order.customerInfo.city}
                          </p>
                          {order.customerInfo.email && (
                            <p className="text-gray-700">
                              <span className="font-medium">Email:</span>{' '}
                              {order.customerInfo.email}
                            </p>
                          )}
                          <p className="text-gray-700">
                            <span className="font-medium">Thanh toán:</span>{' '}
                            {order.paymentMethod === 'cod'
                              ? 'COD'
                              : 'Chuyển khoản'}
                          </p>
                          {order.customerInfo.note && (
                            <p className="text-gray-700 md:col-span-2">
                              <span className="font-medium">Ghi chú:</span>{' '}
                              {order.customerInfo.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Tổng tiền + nút */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex gap-3">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm"
                            >
                              Hủy đơn
                            </button>
                          )}
                          {order.status === 'completed' && (
                            <button
                              onClick={() => router.push('/')}
                              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                            >
                              Mua lại
                            </button>
                          )}
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            Liên hệ Shop
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">
                            Tổng tiền:
                          </p>
                          <p className="text-2xl font-bold text-orange-600">
                            {order.totalAmount.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}