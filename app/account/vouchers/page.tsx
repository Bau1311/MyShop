'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '../../context/ShopContext';
import AccountSidebar from '../../components/AccountSidebar';
import { voucherApi, VoucherResponse } from '../../services/voucherApi';
import { Ticket, Calendar, ShoppingCart, Tag } from 'lucide-react';

export default function VouchersPage() {
    const { user } = useShop();
    const router = useRouter();
    const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unused' | 'used' | 'expired'>('all');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        loadVouchers();
    }, [user, router]);

    const loadVouchers = async () => {
        try {
            setLoading(true);
            const data = await voucherApi.getAvailableVouchers();
            setVouchers(data);
        } catch (error) {
            console.error('Failed to load vouchers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVouchers = vouchers.filter(v => {
        if (filter === 'all') return true;
        // Backend only returns 'AVAILABLE' or 'UNAVAILABLE'
        if (filter === 'unused') return v.userVoucherStatus === 'AVAILABLE';
        if (filter === 'used') return false; // Backend doesn't distinguish used from expired
        if (filter === 'expired') return v.userVoucherStatus === 'UNAVAILABLE';
        return true;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatDiscount = (voucher: VoucherResponse) => {
        if (voucher.discountType === 'percentage') {
            return `Giảm ${voucher.discountAmount}%`;
        } else {
            return `Giảm ${voucher.discountAmount.toLocaleString('vi-VN')}₫`;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'unused':
            case 'AVAILABLE':
                return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Có thể dùng</span>;
            case 'used':
                return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">Đã sử dụng</span>;
            case 'expired':
            case 'UNAVAILABLE':
                return <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Hết hạn</span>;
            default:
                return null;
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <AccountSidebar user={user} avatarPreview={user.avatar ?? null} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm p-6">

                            {/* Header */}
                            <div className="border-b pb-4 mb-6">
                                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <Ticket className="w-6 h-6 text-orange-500" />
                                    Kho Voucher
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">Quản lý voucher giảm giá của bạn</p>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-2 mb-6 overflow-x-auto">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${filter === 'all'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Tất cả ({vouchers.length})
                                </button>
                                <button
                                    onClick={() => setFilter('unused')}
                                    className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${filter === 'unused'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Có thể dùng ({vouchers.filter(v => v.userVoucherStatus === 'AVAILABLE').length})
                                </button>
                                <button
                                    onClick={() => setFilter('used')}
                                    className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${filter === 'used'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Đã sử dụng (0)
                                </button>
                                <button
                                    onClick={() => setFilter('expired')}
                                    className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${filter === 'expired'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Hết hạn ({vouchers.filter(v => v.userVoucherStatus === 'UNAVAILABLE').length})
                                </button>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="flex justify-center items-center py-12">
                                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && filteredVouchers.length === 0 && (
                                <div className="text-center py-12">
                                    <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Không có voucher nào</p>
                                    <p className="text-gray-400 text-sm mt-2">Hãy tìm kiếm voucher mới để nhận ưu đãi!</p>
                                </div>
                            )}

                            {/* Voucher List */}
                            {!loading && filteredVouchers.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredVouchers.map((voucher) => (
                                        <div
                                            key={voucher.voucherId}
                                            className={`border-2 rounded-lg overflow-hidden transition hover:shadow-md ${voucher.userVoucherStatus === 'unused' || voucher.userVoucherStatus === 'AVAILABLE'
                                                ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-white'
                                                : 'border-gray-200 bg-gray-50 opacity-75'
                                                }`}
                                        >
                                            <div className="p-4">
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                                            <Tag className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">{voucher.code}</p>
                                                            <p className="text-xs text-gray-500">Mã voucher</p>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(voucher.userVoucherStatus)}
                                                </div>

                                                {/* Discount */}
                                                <div className="mb-3">
                                                    <p className="text-2xl font-bold text-orange-600">
                                                        {formatDiscount(voucher)}
                                                    </p>
                                                    {voucher.maxDiscount && voucher.discountType === 'percentage' && (
                                                        <p className="text-xs text-gray-500">
                                                            Tối đa {voucher.maxDiscount.toLocaleString('vi-VN')}₫
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-2 text-sm">
                                                    {voucher.minOrderValue && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <ShoppingCart className="w-4 h-4" />
                                                            <span>Đơn tối thiểu: {voucher.minOrderValue.toLocaleString('vi-VN')}₫</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>HSD: {formatDate(voucher.endDate)}</span>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                {(voucher.userVoucherStatus === 'unused' || voucher.userVoucherStatus === 'AVAILABLE') && (
                                                    <button
                                                        onClick={() => router.push('/cart')}
                                                        className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition"
                                                    >
                                                        Dùng ngay
                                                    </button>
                                                )}
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
