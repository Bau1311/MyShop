"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/app/context/ShopContext";

interface Address {
    addressId: number;
    recipientName: string;
    phone: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
}

interface AddressFormData {
    recipientName: string;
    phone: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
}

const API_URL = "http://localhost:8080/api";

export default function AddressesPage() {
    const router = useRouter();
    const { user } = useShop();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<AddressFormData>({
        recipientName: "",
        phone: "",
        street: "",
        ward: "",
        district: "",
        city: "",
        isDefault: false,
    });

    useEffect(() => {
        // DEBUG: Temporarily disabled redirect
        // if (!user) {
        //     router.push("/login");
        //     return;
        // }
        if (user) {
            loadAddresses();
        }
    }, [user]);

    const loadAddresses = async () => {
        if (!user?.userId) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/addresses?userId=${user.userId}`);
            if (response.ok) {
                const data = await response.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error("Error loading addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.userId) return;

        try {
            const url = editingId
                ? `${API_URL}/addresses/${editingId}`
                : `${API_URL}/addresses`;

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    userId: user.userId,
                }),
            });

            if (response.ok) {
                alert(editingId ? "Cập nhật địa chỉ thành công!" : "Thêm địa chỉ thành công!");
                setShowForm(false);
                setEditingId(null);
                resetForm();
                loadAddresses();
            } else {
                alert("Có lỗi xảy ra!");
            }
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Có lỗi xảy ra!");
        }
    };

    const handleEdit = (address: Address) => {
        setFormData({
            recipientName: address.recipientName,
            phone: address.phone,
            street: address.street,
            ward: address.ward,
            district: address.district,
            city: address.city,
            isDefault: address.isDefault,
        });
        setEditingId(address.addressId);
        setShowForm(true);
    };

    const handleDelete = async (addressId: number) => {
        if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

        try {
            const response = await fetch(`${API_URL}/addresses/${addressId}?userId=${user?.userId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Xóa địa chỉ thành công!");
                loadAddresses();
            } else {
                alert("Có lỗi xảy ra!");
            }
        } catch (error) {
            console.error("Error deleting address:", error);
            alert("Có lỗi xảy ra!");
        }
    };

    const handleSetDefault = async (addressId: number) => {
        if (!user?.userId) return;

        try {
            const response = await fetch(`${API_URL}/addresses/${addressId}/set-default?userId=${user.userId}`, {
                method: "PUT",
            });

            if (response.ok) {
                alert("Đã đặt làm địa chỉ mặc định!");
                loadAddresses();
            } else {
                alert("Có lỗi xảy ra!");
            }
        } catch (error) {
            console.error("Error setting default:", error);
            alert("Có lỗi xảy ra!");
        }
    };

    const resetForm = () => {
        setFormData({
            recipientName: "",
            phone: "",
            street: "",
            ward: "",
            district: "",
            city: "",
            isDefault: false,
        });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        resetForm();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-gray-600">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Địa chỉ của tôi</h1>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
                        >
                            + Thêm địa chỉ mới
                        </button>
                    )}
                </div>

                {showForm && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            {editingId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="recipientName"
                                        value={formData.recipientName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                                        placeholder="0912345678"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                                        placeholder="Hồ Chí Minh"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quận/Huyện <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                                        placeholder="Quận 1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phường/Xã <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="ward"
                                        value={formData.ward}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                                        placeholder="Phường Bến Nghé"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                                    placeholder="Số nhà, tên đường..."
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={formData.isDefault}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-orange-500 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-700">
                                    Đặt làm địa chỉ mặc định
                                </label>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                                >
                                    {editingId ? "Cập nhật" : "Thêm địa chỉ"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {addresses.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <div className="text-6xl mb-4">📍</div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Chưa có địa chỉ nào
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Thêm địa chỉ để thuận tiện cho việc đặt hàng
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((address) => (
                            <div
                                key={address.addressId}
                                className="bg-white p-6 rounded-lg shadow-md"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold text-gray-800">
                                                {address.recipientName}
                                            </span>
                                            {address.isDefault && (
                                                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded">
                                                    Mặc định
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {address.phone}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {address.street}, {address.ward}, {address.district},{" "}
                                            {address.city}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(address)}
                                            className="text-blue-600 hover:text-blue-700 text-sm"
                                        >
                                            Sửa
                                        </button>
                                        {!address.isDefault && (
                                            <>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    onClick={() => handleDelete(address.addressId)}
                                                    className="text-red-600 hover:text-red-700 text-sm"
                                                >
                                                    Xóa
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(address.addressId)}
                                        className="text-sm text-orange-600 hover:text-orange-700"
                                    >
                                        Đặt làm mặc định
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
