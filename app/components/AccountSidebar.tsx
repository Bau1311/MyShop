'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface AccountSidebarProps {
  user: any;
  avatarPreview: string | null;
}

export default function AccountSidebar({ user, avatarPreview }: AccountSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Avatar và Username */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">👤</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">
            {user?.username || user?.email?.split('@')[0] || 'user'}
          </p>
          <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Sửa Hồ Sơ
          </button>
        </div>
      </div>

      {/* Menu */}
      <nav className="mt-4 space-y-1">
        {/* Tài Khoản Của Tôi - Parent Menu (không active) */}
        <div className="flex items-center gap-3 px-3 py-2 text-gray-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-medium">Tài Khoản Của Tôi</span>
        </div>

        {/* Submenu - CHỈ SÁNG KHI Ở ĐÚNG TRANG */}
        <Link
          href="/account/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/account/profile')
            ? 'text-orange-500 bg-orange-50'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          <span className="ml-8 text-sm">Hồ Sơ</span>
        </Link>

        <Link
          href="/account/bank"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/account/bank')
            ? 'text-orange-500 bg-orange-50'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          <span className="ml-8 text-sm">Ngân Hàng</span>
        </Link>

        <Link
          href="/account/addresses"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/account/addresses')
            ? 'text-orange-500 bg-orange-50'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          <span className="ml-8 text-sm">Địa Chỉ</span>
        </Link>

        <Link
          href="/account/change-password"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/account/change-password')
            ? 'text-orange-500 bg-orange-50'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          <span className="ml-8 text-sm">Đổi Mật Khẩu</span>
        </Link>

        <Link
          href="/account/notifications"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/account/notifications')
            ? 'text-orange-500 bg-orange-50'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          <span className="ml-8 text-sm">Cài Đặt Thông Báo</span>
        </Link>


        {/* Đơn Mua */}
        <Link
          href="/account/orders"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/account/orders')
            ? 'text-orange-500 bg-orange-50'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Đơn Hàng Của Tôi
        </Link>

        {/* Kho Voucher */}
        <Link
          href="/account/vouchers"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/account/vouchers')
            ? 'text-orange-500 bg-orange-50'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          Kho Voucher
        </Link>

        {/* Shopee Xu */}
        <Link
          href="/account/coins"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/account/coins')
            ? 'text-orange-500 bg-orange-50'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Shopee Xu
        </Link>
      </nav>
    </div>
  );
}