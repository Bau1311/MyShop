'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    Package,
    MapPin,
    User,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    CheckCircle,
    XCircle,
    Truck,
    Clock,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import adminApi from '../../../services/adminApi';

interface OrderItem {
    productId: number;
    productName: string;
    imageUrl?: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

interface OrderDetail {
    orderId: number;
    orderNumber: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
    totalAmount: number;
    shippingFee?: number;
    discountAmount?: number;
    finalAmount: number;
    createdAt: string;
    updatedAt?: string;
    items?: OrderItem[];
    note?: string;
}

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params?.id as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (orderId) {
            loadOrderDetail();
        }
    }, [orderId]);

    const loadOrderDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('📥 Loading order:', orderId);

            const data = await adminApi.getOrderDetail(Number(orderId));
            console.log('✅ Order data received:', data);

            setOrder(data);
        } catch (err: any) {
            console.error('❌ Error loading order:', err);
            setError(err.message || 'Không thể tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (newStatus: string) => {
        if (!order) return;

        const confirmMessages: Record<string, string> = {
            PROCESSING: 'Xác nhận và bắt đầu xử lý đơn hàng này?',
            SHIPPED: 'Chuyển đơn hàng sang trạng thái đang giao hàng?',
            DELIVERED: 'Xác nhận đơn hàng đã giao thành công và hoàn tất?',
            CANCELED: 'HỦY đơn hàng này? Hành động này không thể hoàn tác!'
        };

        if (!window.confirm(confirmMessages[newStatus])) return;

        try {
            setUpdating(true);
            console.log('🔄 Updating order:', order.orderId, 'from', order.status, 'to', newStatus);

            // Convert to lowercase for backend
            const statusForBackend = newStatus.toLowerCase();
            console.log('📤 Sending status to backend:', statusForBackend);

            await adminApi.updateOrderStatus(order.orderId, statusForBackend);

            console.log('✅ Status updated successfully');
            alert('✅ Đã cập nhật trạng thái đơn hàng thành công!');

            // Reload để lấy data mới
            await loadOrderDetail();
        } catch (err: any) {
            console.error('❌ Error updating status:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response,
                status: err.status
            });
            alert(`❌ Lỗi: ${err.message || 'Có lỗi xảy ra khi cập nhật trạng thái'}`);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusInfo = (status: string) => {
        // Normalize status to uppercase for matching
        const normalizedStatus = status?.toUpperCase();

        const statusMap: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
            PENDING: {
                label: 'Chờ xác nhận',
                color: 'text-yellow-800',
                bgColor: 'bg-yellow-100',
                icon: Clock
            },
            PROCESSING: {
                label: 'Đang xử lý',
                color: 'text-blue-800',
                bgColor: 'bg-blue-100',
                icon: Package
            },
            SHIPPED: {
                label: 'Đang giao hàng',
                color: 'text-purple-800',
                bgColor: 'bg-purple-100',
                icon: Truck
            },
            DELIVERED: {
                label: 'Hoàn tất',
                color: 'text-green-800',
                bgColor: 'bg-green-100',
                icon: CheckCircle
            },
            CANCELED: {
                label: 'Đã hủy',
                color: 'text-red-800',
                bgColor: 'bg-red-100',
                icon: XCircle
            }
        };
        return statusMap[normalizedStatus] || statusMap.PENDING;
    };

    const getNextActions = (status: string) => {
        // Normalize status to uppercase for matching
        const normalizedStatus = status?.toUpperCase();

        const actions: Record<string, Array<{ status: string; label: string; color: string; icon: any }>> = {
            PENDING: [
                {
                    status: 'PROCESSING',
                    label: '✓ Xác nhận đơn hàng',
                    color: 'bg-blue-600 hover:bg-blue-700',
                    icon: CheckCircle
                },
                {
                    status: 'CANCELED',
                    label: '✕ Hủy đơn hàng',
                    color: 'bg-red-600 hover:bg-red-700',
                    icon: XCircle
                }
            ],
            PROCESSING: [
                {
                    status: 'SHIPPED',
                    label: '🚚 Chuyển giao hàng',
                    color: 'bg-purple-600 hover:bg-purple-700',
                    icon: Truck
                },
                {
                    status: 'CANCELED',
                    label: '✕ Hủy đơn hàng',
                    color: 'bg-red-600 hover:bg-red-700',
                    icon: XCircle
                }
            ],
            SHIPPED: [
                {
                    status: 'DELIVERED',
                    label: '✓ Hoàn tất đơn hàng',
                    color: 'bg-green-600 hover:bg-green-700',
                    icon: CheckCircle
                }
            ],
            COMPLETED: [],
            CANCELLED: []
        };
        return actions[normalizedStatus] || [];
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('vi-VN', {
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

    const formatNumber = (num: number | null | undefined): string => {
        if (num === null || num === undefined || isNaN(num)) return '0';
        return num.toLocaleString('vi-VN');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
                    <p className="text-gray-600 mb-4">{error || 'Không tìm thấy đơn hàng'}</p>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={loadOrderDetail}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Thử lại
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;
    const nextActions = getNextActions(order.status);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Quay lại"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
                        <p className="text-gray-600 mt-1">Mã đơn: <span className="font-semibold">{order.orderNumber}</span></p>
                    </div>
                </div>
                <button
                    onClick={loadOrderDetail}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    title="Làm mới"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            {/* Status & Actions Card */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow-lg p-6 mb-6 border-2 border-orange-200">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Status Display */}
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-full ${statusInfo.bgColor}`}>
                            <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Trạng thái đơn hàng</p>
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-base font-bold ${statusInfo.bgColor} ${statusInfo.color}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {nextActions.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {nextActions.map((action) => {
                                const ActionIcon = action.icon;
                                return (
                                    <button
                                        key={action.status}
                                        onClick={() => updateOrderStatus(action.status)}
                                        disabled={updating}
                                        className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${action.color}`}
                                    >
                                        <ActionIcon className="w-5 h-5" />
                                        {updating ? 'Đang xử lý...' : action.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Timeline */}
                <div className="mt-6 pt-6 border-t border-orange-200">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <span className="font-medium">Ngày đặt:</span>
                            <span>{formatDate(order.createdAt)}</span>
                        </div>
                        {order.updatedAt && order.updatedAt !== order.createdAt && (
                            <>
                                <span className="text-orange-400">•</span>
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-orange-600" />
                                    <span className="font-medium">Cập nhật:</span>
                                    <span>{formatDate(order.updatedAt)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items & Address */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-orange-600" />
                            Sản phẩm ({order.items?.length || 0})
                        </h2>

                        {!order.items || order.items.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Không có thông tin sản phẩm</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {order.items.map((item, index) => (
                                    <div key={`${item.productId}-${index}`} className="flex gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                                        <img
                                            src={item.imageUrl || '/placeholder-product.png'}
                                            alt={item.productName}
                                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-100"
                                        // onError={(e) => {
                                        //     (e.target as HTMLImageElement).src = '/placeholder-product.png';
                                        // }}
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-2 text-lg">{item.productName}</h3>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <span className="font-medium">Đơn giá:</span>
                                                    <span className="text-orange-600 font-bold">{formatNumber(item.price)}₫</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <span className="font-medium">Số lượng:</span>
                                                    <span className="font-bold">x{item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600 mb-1">Thành tiền</p>
                                                <p className="text-xl font-bold text-orange-600">
                                                    {formatNumber(item.totalPrice)}₫
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-orange-600" />
                            Địa chỉ giao hàng
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                            <p className="text-gray-800 text-base leading-relaxed">
                                {order.shippingAddress || 'Chưa có địa chỉ giao hàng'}
                            </p>
                        </div>
                    </div>

                    {/* Note */}
                    {order.note && (
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                Ghi chú từ khách hàng
                            </h2>
                            <p className="text-gray-800 italic">{order.note}</p>
                        </div>
                    )}
                </div>

                {/* Right Column - Customer & Payment */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-orange-600" />
                            Thông tin khách hàng
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <User className="w-5 h-5 text-gray-500 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-600 mb-1">Họ tên</p>
                                    <p className="font-semibold text-gray-900">{order.customerName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-600 mb-1">Số điện thoại</p>
                                    <p className="font-semibold text-gray-900">{order.customerPhone || 'Chưa có'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-600 mb-1">Email</p>
                                    <p className="font-semibold text-gray-900 break-all">{order.customerEmail || 'Chưa có'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-orange-600" />
                            Tổng tiền
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-700 p-2">
                                <span>Tạm tính</span>
                                <span className="font-semibold">{formatNumber(order.totalAmount)}₫</span>
                            </div>
                            <div className="flex justify-between text-gray-700 p-2">
                                <span>Phí vận chuyển</span>
                                <span className="font-semibold">{formatNumber(order.shippingFee || 0)}₫</span>
                            </div>
                            {(order.discountAmount || 0) > 0 && (
                                <div className="flex justify-between text-green-600 p-2 bg-green-50 rounded">
                                    <span>Giảm giá</span>
                                    <span className="font-semibold">-{formatNumber(order.discountAmount)}₫</span>
                                </div>
                            )}
                            <div className="border-t-2 border-gray-300 pt-3 mt-3">
                                <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
                                    <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-orange-600">
                                        {formatNumber(order.finalAmount)}₫
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}