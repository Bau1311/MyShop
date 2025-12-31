'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Package, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import adminApi from '../../services/adminApi';

interface Order {
    orderId: number;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    itemCount: number;
}

export default function OrdersManagement() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOrders();
    }, [statusFilter, page]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 0) {
                loadOrders();
            } else {
                setPage(0);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
            const data = await adminApi.getOrders(page, 20, statusParam, searchTerm || undefined);

            setOrders(data.content || []);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || 0);
        } catch (err: any) {
            console.error('Error loading orders:', err);
            setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            PROCESSING: 'bg-blue-100 text-blue-800',
            SHIPPING: 'bg-purple-100 text-purple-800',
            COMPLETED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
        };
        const labels = {
            PENDING: 'Chờ xác nhận',
            PROCESSING: 'Đang xử lý',
            SHIPPING: 'Đang giao',
            COMPLETED: 'Hoàn tất',
            CANCELLED: 'Đã hủy',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getStatusFilterLabel = (status: string) => {
        const labels: Record<string, string> = {
            'ALL': 'Tất cả',
            'PENDING': 'Chờ xác nhận',
            'PROCESSING': 'Đang xử lý',
            'SHIPPED': 'Đang giao',
            'DELIVERED': 'Hoàn tất',
            'CANCELED': 'Đã hủy'
        };
        return labels[status] || status;
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đơn hàng</h1>
                <p className="text-gray-600">Theo dõi và xử lý đơn hàng</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={loadOrders}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                        title="Làm mới"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Status Filters */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => {
                            setStatusFilter(status);
                            setPage(0);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${statusFilter === status
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {getStatusFilterLabel(status)}
                    </button>
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <p className="font-medium">Lỗi: {error}</p>
                    <button
                        onClick={loadOrders}
                        className="text-sm underline mt-1 hover:text-red-900"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mã đơn
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Số lượng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tổng tiền
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày đặt
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => {
                                        const getStatusBadge = (status: string) => {
                                            const statusMap: Record<string, { label: string; className: string }> = {
                                                pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
                                                processing: { label: 'Đang xử lý', className: 'bg-blue-100 text-blue-800' },
                                                shipped: { label: 'Đang giao', className: 'bg-purple-100 text-purple-800' },
                                                delivered: { label: 'Hoàn tất', className: 'bg-green-100 text-green-800' },
                                                canceled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
                                            };
                                            const normalizedStatus = status?.toLowerCase();
                                            const statusInfo = statusMap[normalizedStatus] || statusMap.pending;
                                            return (
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                                                    {statusInfo.label}
                                                </span>
                                            );
                                        };

                                        return (
                                            <tr key={order.orderId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{order.customerName}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{order.itemCount} sản phẩm</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-orange-600">
                                                        {order.totalAmount?.toLocaleString('vi-VN')}đ
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(order.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        href={`/admin/orders/${order.orderId}`}
                                                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end gap-1"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Chi tiết
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                            <div className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{orders.length}</span> / {' '}
                                <span className="font-medium">{totalElements}</span> đơn hàng
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                >
                                    Trước
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-700">
                                    Trang {page + 1} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}