'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react';

interface Voucher {
    voucherId: number;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountAmount: number;
    maxDiscount?: number;
    minOrderValue?: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    usageCount: number;
    maxUsage?: number;
}

import adminApi from '../../services/adminApi';

// ...

export default function VouchersManagement() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

    useEffect(() => {
        loadVouchers();
    }, []);

    const loadVouchers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getVouchers(0, 20); // Add pagination params if needed
            // Assuming data is Page<Voucher> or List<Voucher>
            setVouchers(data.content || data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error loading vouchers:', error);
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        try {
            await adminApi.toggleVoucher(id);
            alert(`Đã ${currentStatus ? 'vô hiệu hóa' : 'kích hoạt'} voucher!`);
            loadVouchers();
        } catch (error) {
            console.error('Error toggling voucher:', error);
            alert('Có lỗi xảy ra!');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa voucher này?')) return;

        try {
            await adminApi.deleteVoucher(id);
            alert('Đã xóa voucher!');
            loadVouchers();
        } catch (error) {
            console.error('Error deleting voucher:', error);
            alert('Có lỗi xảy ra!');
        }
    };

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Vouchers</h1>
                    <p className="text-gray-600">Tạo và quản lý mã giảm giá</p>
                </div>
                <button
                    onClick={() => {
                        setEditingVoucher(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                    <Plus className="w-5 h-5" />
                    Thêm voucher
                </button>
            </div>

            {/* Vouchers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải...</p>
                    </div>
                ) : vouchers.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có voucher nào</p>
                    </div>
                ) : (
                    vouchers.map((voucher) => (
                        <div
                            key={voucher.voucherId}
                            className={`bg-white rounded-lg shadow-md p-6 border-2 ${voucher.isActive ? 'border-green-200' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-orange-500" />
                                    <span className="font-bold text-lg">{voucher.code}</span>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${voucher.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {voucher.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Giảm giá:</span>
                                    <span className="font-medium">
                                        {voucher.discountType === 'PERCENTAGE'
                                            ? `${voucher.discountAmount}%`
                                            : `${voucher.discountAmount.toLocaleString('vi-VN')}₫`}
                                    </span>
                                </div>
                                {voucher.maxDiscount && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Giảm tối đa:</span>
                                        <span className="font-medium">{voucher.maxDiscount.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                )}
                                {voucher.minOrderValue && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Đơn tối thiểu:</span>
                                        <span className="font-medium">{voucher.minOrderValue.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Đã sử dụng:</span>
                                    <span className="font-medium">
                                        {voucher.usageCount}/{voucher.maxUsage || '∞'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Hết hạn:</span>
                                    <span className="font-medium">{voucher.endDate}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                <button
                                    onClick={() => handleToggleActive(voucher.voucherId, voucher.isActive)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${voucher.isActive
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                        }`}
                                >
                                    {voucher.isActive ? (
                                        <>
                                            <ToggleLeft className="w-4 h-4" />
                                            Tắt
                                        </>
                                    ) : (
                                        <>
                                            <ToggleRight className="w-4 h-4" />
                                            Bật
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingVoucher(voucher);
                                        setShowModal(true);
                                    }}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(voucher.voucherId)}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal for Add/Edit Voucher */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingVoucher ? 'Sửa voucher' : 'Thêm voucher mới'}
                        </h2>
                        <p className="text-gray-600 mb-4">Form thêm/sửa voucher sẽ được implement ở đây</p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
