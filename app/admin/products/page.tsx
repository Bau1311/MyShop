'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Package, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import adminApi from '../../services/adminApi';

interface Product {
    productId: number;
    name: string;
    price: number;
    finalPrice: number;
    categoryName: string;
    status: string;
    totalPurchaseCount?: number | null;
    imageUrl: string;
}

export default function ProductsManagement() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadProducts();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await adminApi.getProducts(0, 100, searchTerm || undefined);
            setProducts(data.content || []);
        } catch (err: any) {
            console.error('Error loading products:', err);
            setError(err.message || 'Không thể tải danh sách sản phẩm');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) return;

        try {
            setDeleting(id);
            await adminApi.deleteProduct(id);
            alert('Đã xóa sản phẩm thành công!');
            loadProducts();
        } catch (err: any) {
            console.error('Error deleting product:', err);
            alert(err.message || 'Có lỗi xảy ra khi xóa sản phẩm!');
        } finally {
            setDeleting(null);
        }
    };

    const getDiscountPercent = (price: number, finalPrice: number) => {
        if (!price || !finalPrice || price <= finalPrice) return 0;
        return Math.round(((price - finalPrice) / price) * 100);
    };

    const formatNumber = (num: number | null | undefined): string => {
        if (num === null || num === undefined || isNaN(num)) return '0';
        return num.toLocaleString('vi-VN');
    };

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý sản phẩm</h1>
                    <p className="text-gray-600">Quản lý danh mục và sản phẩm</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Thêm sản phẩm
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm theo tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <button
                        onClick={loadProducts}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                        title="Làm mới"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <p className="font-medium">Lỗi: {error}</p>
                    <button 
                        onClick={loadProducts}
                        className="text-sm underline mt-1 hover:text-red-900"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                            {searchTerm ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm nào'}
                        </p>
                        {!searchTerm && (
                            <Link
                                href="/admin/products/new"
                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm sản phẩm đầu tiên
                            </Link>
                        )}
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product.productId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative">
                                <img
                                    src={product.imageUrl || '/placeholder-product.png'}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                                    }}
                                />
                                {getDiscountPercent(product.price, product.finalPrice) > 0 && (
                                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                                        -{getDiscountPercent(product.price, product.finalPrice)}%
                                    </div>
                                )}
                                <div className="absolute top-2 left-2">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        product.status === 'ACTIVE' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {product.status === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-gray-500 mb-2">{product.categoryName || 'Chưa phân loại'}</p>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex flex-col">
                                        <span className="text-orange-600 font-bold text-lg">
                                            {formatNumber(product.finalPrice)}₫
                                        </span>
                                        {product.price > product.finalPrice && (
                                            <span className="text-gray-400 text-sm line-through">
                                                {formatNumber(product.price)}₫
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-3">
                                    Đã bán: {formatNumber(product.totalPurchaseCount)}
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <Link
                                        href={`/admin/products/${product.productId}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Sửa
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.productId, product.name)}
                                        disabled={deleting === product.productId}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {deleting === product.productId ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Summary */}
            {!loading && products.length > 0 && (
                <div className="mt-6 text-center text-sm text-gray-600">
                    Hiển thị {products.length} sản phẩm
                </div>
            )}
        </div>
    );
}