'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useShop } from '../context/ShopContext';
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    Tag,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, setUser } = useShop();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        // TODO: Re-enable admin check after testing
        // Check if user is admin (temporarily disabled for testing)
        // if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
        //     router.push('/login');
        // }
    }, [user, router]);

    const handleLogout = () => {
        setUser(null);
        router.push('/');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
        { icon: Users, label: 'Người dùng', href: '/admin/users' },
        { icon: Package, label: 'Sản phẩm', href: '/admin/products' },
        { icon: ShoppingCart, label: 'Đơn hàng', href: '/admin/orders' },
        { icon: Tag, label: 'Vouchers', href: '/admin/vouchers' },
    ];

    // Temporarily disabled for testing
    // if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center bg-gray-100">
    //             <div className="text-center">
    //                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
    //                 <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-gradient-to-b from-orange-600 to-orange-700 w-64`}>
                <div className="h-full px-3 py-4 overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 px-3">
                        <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-white hover:bg-orange-500 p-2 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="mb-8 px-3 py-4 bg-white/10 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                            </div>
                            <div>
                                <p className="text-white font-medium">{user?.name || user?.username || 'Admin'}</p>
                                <p className="text-orange-200 text-sm">{user?.email || 'admin@myshop.com'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-white text-orange-600 font-medium'
                                            : 'text-white hover:bg-white/10'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Logout Button */}
                    <div className="absolute bottom-4 left-3 right-3">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/10 w-full transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`transition-all ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
                {/* Top Bar */}
                <header className="bg-white shadow-sm sticky top-0 z-30">
                    <div className="px-4 py-4 flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="text-sm text-gray-600 hover:text-orange-600 font-medium"
                            >
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
