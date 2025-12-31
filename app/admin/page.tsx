'use client';

import { useEffect, useState } from 'react';
import {
    TrendingUp,
    ShoppingCart,
    Users,
    Package,
    DollarSign,
    XCircle,
    CheckCircle,
    Clock,
    RefreshCw,
    AlertCircle,
    Truck
} from 'lucide-react';
import adminApi from '../services/adminApi';

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    canceledOrders: number;
    totalUsers: number;
    totalProducts: number;
    revenueGrowth: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        canceledOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        revenueGrowth: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<'day' | 'month' | 'year'>('month');
    const [chartMounted, setChartMounted] = useState(false);
    const [chartData, setChartData] = useState<Array<{ date: string; revenue: number }>>([]);

    useEffect(() => {
        loadDashboardData();
        loadChartData();
        setChartMounted(true);
    }, [period]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await adminApi.getDashboardStats(period);

            setStats({
                totalRevenue: data.totalRevenue || 0,
                totalOrders: data.totalOrders || 0,
                pendingOrders: data.pendingOrders || 0,
                processingOrders: data.processingOrders || 0,
                shippedOrders: data.shippedOrders || 0,
                deliveredOrders: data.deliveredOrders || data.completedOrders || 0,
                canceledOrders: data.canceledOrders || data.cancelledOrders || 0,
                totalUsers: data.totalUsers || 0,
                totalProducts: data.totalProducts || 0,
                revenueGrowth: data.revenueGrowth || 0,
            });
        } catch (err: any) {
            console.error('Error loading dashboard data:', err);
            setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
        } finally {
            setLoading(false);
        }
    };

    const loadChartData = async () => {
        try {
            const data = await adminApi.getRevenueChartData(period);
            setChartData(data.chartData || []);
        } catch (err: any) {
            console.error('Error loading chart data:', err);
            // Don't show error for chart, just use empty data
            setChartData([]);
        }
    };

    const StatCard = ({
        icon: Icon,
        title,
        value,
        subtitle,
        color,
        trend
    }: {
        icon: any;
        title: string;
        value: string | number;
        subtitle?: string;
        color: string;
        trend?: number;
    }) => (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
                        <span>{Math.abs(trend).toFixed(1)}%</span>
                    </div>
                )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );

    const getPeriodLabel = (p: 'day' | 'month' | 'year') => {
        const labels = {
            day: 'Hôm nay',
            month: 'Tháng này',
            year: 'Năm này'
        };
        return labels[p];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadDashboardData}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600">Tổng quan hoạt động kinh doanh</p>
                </div>
                <button
                    onClick={loadDashboardData}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Làm mới
                </button>
            </div>

            {/* Period Filter */}
            <div className="mb-6 flex gap-2">
                {(['day', 'month', 'year'] as const).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === p
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {getPeriodLabel(p)}
                    </button>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={DollarSign}
                    title="Tổng doanh thu"
                    value={`${stats.totalRevenue.toLocaleString('vi-VN')}₫`}
                    color="bg-gradient-to-r from-green-500 to-green-600"
                    trend={stats.revenueGrowth}
                />
                <StatCard
                    icon={ShoppingCart}
                    title="Tổng đơn hàng"
                    value={stats.totalOrders.toLocaleString('vi-VN')}
                    subtitle={`${stats.pendingOrders} đang chờ xử lý`}
                    color="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <StatCard
                    icon={Users}
                    title="Người dùng"
                    value={stats.totalUsers.toLocaleString('vi-VN')}
                    color="bg-gradient-to-r from-purple-500 to-purple-600"
                />
                <StatCard
                    icon={Package}
                    title="Sản phẩm"
                    value={stats.totalProducts.toLocaleString('vi-VN')}
                    color="bg-gradient-to-r from-orange-500 to-orange-600"
                />
            </div>

            {/* Order Stats - Now with 5 status cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <StatCard
                    icon={Clock}
                    title="Chờ xác nhận"
                    value={stats.pendingOrders.toLocaleString('vi-VN')}
                    subtitle={
                        stats.totalOrders > 0
                            ? `${((stats.pendingOrders / stats.totalOrders) * 100).toFixed(1)}% tổng đơn`
                            : '0%'
                    }
                    color="bg-gradient-to-r from-yellow-500 to-yellow-600"
                />
                <StatCard
                    icon={RefreshCw}
                    title="Đang xử lý"
                    value={stats.processingOrders.toLocaleString('vi-VN')}
                    subtitle={
                        stats.totalOrders > 0
                            ? `${((stats.processingOrders / stats.totalOrders) * 100).toFixed(1)}% tổng đơn`
                            : '0%'
                    }
                    color="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <StatCard
                    icon={Truck}
                    title="Đang giao"
                    value={stats.shippedOrders.toLocaleString('vi-VN')}
                    subtitle={
                        stats.totalOrders > 0
                            ? `${((stats.shippedOrders / stats.totalOrders) * 100).toFixed(1)}% tổng đơn`
                            : '0%'
                    }
                    color="bg-gradient-to-r from-purple-500 to-purple-600"
                />
                <StatCard
                    icon={CheckCircle}
                    title="Hoàn tất"
                    value={stats.deliveredOrders.toLocaleString('vi-VN')}
                    subtitle={
                        stats.totalOrders > 0
                            ? `${((stats.deliveredOrders / stats.totalOrders) * 100).toFixed(1)}% tổng đơn`
                            : '0%'
                    }
                    color="bg-gradient-to-r from-green-500 to-green-600"
                />
                <StatCard
                    icon={XCircle}
                    title="Đã hủy"
                    value={stats.canceledOrders.toLocaleString('vi-VN')}
                    subtitle={
                        stats.totalOrders > 0
                            ? `${((stats.canceledOrders / stats.totalOrders) * 100).toFixed(1)}% tổng đơn`
                            : '0%'
                    }
                    color="bg-gradient-to-r from-red-500 to-red-600"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a
                        href="/admin/orders?status=PENDING"
                        className="p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-400 transition-colors"
                    >
                        <Clock className="w-8 h-8 text-yellow-600 mb-2" />
                        <h3 className="font-medium text-gray-900">Đơn chờ xử lý</h3>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                    </a>
                    <a
                        href="/admin/products"
                        className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 transition-colors"
                    >
                        <Package className="w-8 h-8 text-orange-600 mb-2" />
                        <h3 className="font-medium text-gray-900">Quản lý sản phẩm</h3>
                        <p className="text-sm text-gray-600">Xem tất cả sản phẩm</p>
                    </a>
                    <a
                        href="/admin/users"
                        className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition-colors"
                    >
                        <Users className="w-8 h-8 text-purple-600 mb-2" />
                        <h3 className="font-medium text-gray-900">Quản lý người dùng</h3>
                        <p className="text-sm text-gray-600">Xem tất cả người dùng</p>
                    </a>
                    <a
                        href="/admin/orders"
                        className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors"
                    >
                        <ShoppingCart className="w-8 h-8 text-blue-600 mb-2" />
                        <h3 className="font-medium text-gray-900">Quản lý đơn hàng</h3>
                        <p className="text-sm text-gray-600">Xem tất cả đơn hàng</p>
                    </a>
                </div>
            </div>

            {/* Best Selling Products & Growth Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm bán chạy</h2>
                    {/* TODO: Fetch from /api/admin/dashboard/top-products */}
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((index) => (
                            <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-2xl font-bold text-gray-300">#{index}</span>
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-400">Product {index}</h3>
                                    <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-300">-</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-500">
                        <p>💡 Backend cần implement endpoint:</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">GET /api/admin/dashboard/top-products</code>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Biểu đồ tăng trưởng</h2>
                    <div className="h-[300px]">
                        {!chartMounted ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-pulse text-gray-400">Đang tải biểu đồ...</div>
                            </div>
                        ) : (() => {
                            // Sample data - will be replaced with real API data
                            const sampleChartData = [
                                { date: '01/12', revenue: 450000 },
                                { date: '05/12', revenue: 520000 },
                                { date: '10/12', revenue: 480000 },
                                { date: '15/12', revenue: 680000 },
                                { date: '20/12', revenue: 750000 },
                                { date: '25/12', revenue: 820000 },
                                { date: '30/12', revenue: 900000 },
                            ];

                            const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = require('recharts');

                            return (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sampleChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#666"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="#666"
                                            style={{ fontSize: '12px' }}
                                            tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}K`}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [`${value.toLocaleString('vi-VN')}₫`, 'Doanh thu']}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                padding: '8px 12px'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#f97316"
                                            strokeWidth={3}
                                            dot={{ fill: '#f97316', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            );
                        })()}
                    </div>
                    <div className="mt-4 text-center text-xs text-gray-400">
                        <p>📊 Dữ liệu mẫu - Backend cần implement:</p>
                        <code className="bg-gray-100 px-2 py-1 rounded">GET /api/admin/dashboard/revenue-chart</code>
                    </div>
                </div>
            </div>
        </div>
    );
}