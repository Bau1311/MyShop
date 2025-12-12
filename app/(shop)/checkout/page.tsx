"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/app/context/ShopContext";
import { Plus, Minus } from "lucide-react"; 

const API_URL = "https://provinces.open-api.vn/api/";

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, clearCart, updateQuantity, removeFromCart, user, addOrder } = useShop();

    const getTotalPrice = () => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        district: "",
        ward: "",
        cityCode: "",
        districtCode: "",
        wardCode: "",
        note: "",
        paymentMethod: "cod",
    });

    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(true);

    // ✅ Sử dụng ref để tránh vòng lặp vô hạn
    const prevCityCodeRef = useRef<string>("");
    const prevDistrictCodeRef = useRef<string>("");

    useEffect(() => {
        if (user && user.email) {
            setFormData(prev => ({
                ...prev,
                email: user.email || "",
            }));
        }
    }, [user]);

    // 1. LẤY TỈNH/THÀNH PHỐ
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch(`${API_URL}p/`); 
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    const sortedData = data.sort((a: any, b: any) => a.name.localeCompare(b.name, 'vi'));
                    setProvinces(sortedData);
                } else {
                    console.error("API provinces.open-api.vn returned unexpected data:", data);
                }

                setLoadingProvinces(false);
            } catch (error) {
                console.error("Error fetching provinces:", error);
                setLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, []);

    // ✅ 2. LẤY QUẬN/HUYỆN - SỬA LỖI VÒNG LẶP
    useEffect(() => {
        // Chỉ fetch khi cityCode thay đổi thực sự
        if (formData.cityCode && formData.cityCode !== prevCityCodeRef.current) {
            prevCityCodeRef.current = formData.cityCode;
            
            const fetchDistricts = async () => {
                try {
                    const response = await fetch(`${API_URL}p/${formData.cityCode}?depth=2`);
                    const data = await response.json();
                    
                    if (data && Array.isArray(data.districts)) {
                        const sortedDistricts = data.districts.sort((a: any, b: any) => a.name.localeCompare(b.name, 'vi'));
                        setDistricts(sortedDistricts);
                    } else {
                        setDistricts([]);
                    }
                    
                    setWards([]);
                } catch (error) {
                    console.error("Error fetching districts:", error);
                    setDistricts([]);
                    setWards([]);
                }
            };
            fetchDistricts();
        } else if (!formData.cityCode) {
            prevCityCodeRef.current = "";
            setDistricts([]);
            setWards([]);
        }
    }, [formData.cityCode]); 

    // ✅ 3. LẤY PHƯỜNG/XÃ - SỬA LỖI VÒNG LẶP
    useEffect(() => {
        if (formData.districtCode && formData.districtCode !== prevDistrictCodeRef.current) {
            prevDistrictCodeRef.current = formData.districtCode;
            
            const fetchWards = async () => {
                try {
                    const response = await fetch(`${API_URL}d/${formData.districtCode}?depth=2`);
                    const data = await response.json();

                    if (data && Array.isArray(data.wards)) {
                        const sortedWards = data.wards.sort((a: any, b: any) => a.name.localeCompare(b.name, 'vi'));
                        setWards(sortedWards);
                    } else {
                        setWards([]);
                    }
                } catch (error) {
                    console.error("Error fetching wards:", error);
                    setWards([]);
                }
            };
            fetchWards();
        } else if (!formData.districtCode) {
            prevDistrictCodeRef.current = "";
            setWards([]);
        }
    }, [formData.districtCode]); 

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === "city") {
            const selectedProvince = provinces.find(p => p.name === value);
            setFormData(prev => ({
                ...prev,
                city: value,
                cityCode: selectedProvince ? selectedProvince.code : "",
                district: "",
                districtCode: "",
                ward: "",
                wardCode: "",
            }));
            setErrors((prev: any) => ({ ...prev, city: "" }));
            return;
        }

        if (name === "district") {
            const selectedDistrict = districts.find(d => d.name === value);
            setFormData(prev => ({
                ...prev,
                district: value,
                districtCode: selectedDistrict ? selectedDistrict.code : "",
                ward: "",
                wardCode: "",
            }));
            setErrors((prev: any) => ({ ...prev, district: "" }));
            return;
        }

        if (name === "ward") {
            const selectedWard = wards.find(w => w.name === value);
            setFormData(prev => ({
                ...prev,
                ward: value,
                wardCode: selectedWard ? selectedWard.code : "",
            }));
            setErrors((prev: any) => ({ ...prev, ward: "" }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev: any) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Vui lòng nhập họ và tên";
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
        }

        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!formData.phone.trim()) {
            newErrors.phone = "Vui lòng nhập số điện thoại";
        } else if (!phoneRegex.test(formData.phone.trim())) {
            newErrors.phone = "Số điện thoại không hợp lệ";
        }

        if (formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                newErrors.email = "Email không hợp lệ";
            }
        }

        // ✅ Kiểm tra cả code và name
        if (!formData.cityCode || !formData.city) {
            newErrors.city = "Vui lòng chọn Tỉnh/Thành phố";
        }
        if (!formData.districtCode || !formData.district) {
            newErrors.district = "Vui lòng chọn Quận/Huyện";
        }
        if (!formData.wardCode || !formData.ward) {
            newErrors.ward = "Vui lòng chọn Phường/Xã";
        }
        if (!formData.address.trim()) {
            newErrors.address = "Vui lòng nhập địa chỉ cụ thể";
        } else if (formData.address.trim().length < 5) {
            newErrors.address = "Địa chỉ quá ngắn";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("🔍 Form submitted, validating...");
        console.log("📝 Form data:", formData);

        if (!validateForm()) {
            console.error("❌ Validation failed:", errors);
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        console.log("✅ Validation passed");

        setIsProcessing(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
            const fullAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`;

            console.log("📦 Creating order with address:", fullAddress);

            const orderId = addOrder({
                status: "pending",
                items: [...cart], 
                totalAmount: getTotalPrice(),
                customerInfo: {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    email: formData.email,
                    address: fullAddress,
                    city: formData.city,
                    district: formData.district,
                    ward: formData.ward,
                    note: formData.note,
                },
                paymentMethod: formData.paymentMethod as "cod" | "banking",
            });

            console.log("✅ Order created successfully, ID:", orderId);

            setIsProcessing(false);
            setOrderSuccess(true);

            setTimeout(() => {
                clearCart();
                router.push("/account/orders");
            }, 3000);
        } catch (error) {
            console.error("❌ Error creating order:", error);
            setIsProcessing(false);
            alert("Có lỗi xảy ra khi tạo đơn hàng! Vui lòng thử lại.");
        }
    };

    const goToHome = () => {
        router.push("/");
    };

    const findCartItem = (itemId: number, color?: string | null, size?: string | null) => {
        return cart.find(
            i => i.id === itemId && i.selectedColor === color && i.selectedSize === size
        );
    }

    const handleIncreaseQuantity = (itemId: number, color?: string | null, size?: string | null) => {
        const item = findCartItem(itemId, color, size);
        if (item) {
            updateQuantity(itemId, item.quantity + 1, color, size);
        }
    };

    const handleDecreaseQuantity = (itemId: number, color?: string | null, size?: string | null) => {
        const item = findCartItem(itemId, color, size);
        if (item) {
            if (item.quantity > 1) {
                updateQuantity(itemId, item.quantity - 1, color, size);
            } else {
                removeFromCart(itemId, color, size);
            }
        }
    };

    const handleRemoveItem = (itemId: number, color?: string | null, size?: string | null) => {
        removeFromCart(itemId, color, size);
    };

    const bankInfo = {
        bankName: "MBBank",
        accountNumber: "0852522818",
        accountName: "DO MINH DANG",
        amount: getTotalPrice(),
    };

    if (cart.length === 0 && !orderSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
                    <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
                    <button onClick={goToHome} className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                        Quay lại mua sắm
                    </button>
                </div>
            </div>
        );
    }

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">Đặt hàng thành công!</h2>
                    <p className="text-gray-600 mb-4">Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-gray-700">
                            Mã đơn hàng: <span className="font-bold">#{Math.floor(Math.random() * 1000000)}</span>
                        </p>
                    </div>
                    <button onClick={goToHome} className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Thanh toán</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin người nhận</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Họ và tên <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Nguyễn Văn A"
                                        />
                                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
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
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="0912345678"
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email {user?.email && <span className="text-green-600 text-xs">(Từ tài khoản)</span>}
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={!!user?.email}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 ${errors.email ? 'border-red-500' : 'border-gray-300'} ${user?.email ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            placeholder="example@email.com"
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Địa chỉ giao hàng</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tỉnh/Thành phố <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            disabled={loadingProvinces}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                        >
                                            <option value="">{loadingProvinces ? "Đang tải..." : "-- Chọn Tỉnh/Thành phố --"}</option>
                                            {provinces.map((p) => (
                                                <option key={p.code} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Quận/Huyện <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            disabled={!formData.cityCode}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 ${errors.district ? 'border-red-500' : 'border-gray-300'}`}
                                        >
                                            <option value="">-- Chọn Quận/Huyện --</option>
                                            {districts.map((d) => (
                                                <option key={d.code} value={d.name}>{d.name}</option>
                                            ))}
                                        </select>
                                        {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phường/Xã <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="ward"
                                            value={formData.ward}
                                            onChange={handleInputChange}
                                            disabled={!formData.districtCode}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 ${errors.ward ? 'border-red-500' : 'border-gray-300'}`}
                                        >
                                            <option value="">-- Chọn Phường/Xã --</option>
                                            {wards.map((w) => (
                                                <option key={w.code} value={w.name}>{w.name}</option>
                                            ))}
                                        </select>
                                        {errors.ward && <p className="text-red-500 text-xs mt-1">{errors.ward}</p>}
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Địa chỉ cụ thể <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Số nhà, tên đường..."
                                        />
                                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                                        <textarea
                                            name="note"
                                            value={formData.note}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                                            placeholder="Ghi chú thêm (tùy chọn)"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Phương thức thanh toán</h2>
                                <div className="space-y-3">
                                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: formData.paymentMethod === "cod" ? "#f97316" : "#d1d5db" }}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === "cod"}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-orange-500 mt-1"
                                        />
                                        <div className="ml-3">
                                            <span className="font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                                            <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                                        </div>
                                    </label>
                                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: formData.paymentMethod === "banking" ? "#f97316" : "#d1d5db" }}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="banking"
                                            checked={formData.paymentMethod === "banking"}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-orange-500 mt-1"
                                        />
                                        <div className="ml-3">
                                            <span className="font-medium text-gray-800">Chuyển khoản ngân hàng</span>
                                            <p className="text-sm text-gray-500">Chuyển khoản qua Internet Banking</p>
                                        </div>
                                    </label>
                                </div>

                                {formData.paymentMethod === "banking" && (
                                    <div className="mt-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Quét mã QR để thanh toán</h3>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                                                <img src="/images/AnhQR.jpg" alt="QR" className="w-64 h-64 object-contain" />
                                            </div>
                                            <div className="w-full space-y-2 text-sm">
                                                <div className="flex justify-between p-2 bg-white rounded">
                                                    <span className="text-gray-600">Ngân hàng:</span>
                                                    <span className="font-semibold text-gray-800">{bankInfo.bankName}</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-white rounded">
                                                    <span className="text-gray-600">Số tài khoản:</span>
                                                    <span className="font-semibold text-gray-800">{bankInfo.accountNumber}</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-white rounded">
                                                    <span className="text-gray-600">Chủ tài khoản:</span>
                                                    <span className="font-semibold text-gray-800">{bankInfo.accountName}</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-white rounded">
                                                    <span className="text-gray-600">Số tiền:</span>
                                                    <span className="font-semibold text-orange-500">{bankInfo.amount.toLocaleString("vi-VN")}₫</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="lg:hidden">
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 transition-colors font-semibold text-lg"
                                >
                                    {isProcessing ? "Đang xử lý..." : `Đặt hàng (${getTotalPrice().toLocaleString("vi-VN")}₫)`}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Đơn hàng của bạn</h2>

                            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                                {cart.map((item) => (
                                    <div key={item.id + (item.selectedColor || '') + (item.selectedSize || '')} className="flex items-center gap-3 pb-4 border-b">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                            {item.images && item.images.length > 0 ? (
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl bg-orange-50">
                                                    📦
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-800 text-sm truncate mb-2">{item.name}</h3>
                                            
                                            {(item.selectedColor || item.selectedSize) && (
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {item.selectedColor && `Màu: ${item.selectedColor}`}
                                                    {item.selectedColor && item.selectedSize && ` / `}
                                                    {item.selectedSize && `Size: ${item.selectedSize}`}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDecreaseQuantity(item.id, item.selectedColor, item.selectedSize)}
                                                    className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center"
                                                >
                                                    <Minus className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleIncreaseQuantity(item.id, item.selectedColor, item.selectedSize)}
                                                    className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center"
                                                >
                                                    <Plus className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <p className="text-orange-500 font-semibold text-sm">{(item.price * item.quantity).toLocaleString("vi-VN")}₫</p>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveItem(item.id, item.selectedColor, item.selectedSize)} 
                                                className="text-red-500 hover:text-red-700 text-xs"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính:</span>
                                    <span>{getTotalPrice().toLocaleString("vi-VN")}₫</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển:</span>
                                    <span className="text-green-600">Miễn phí</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                                    <span>Tổng cộng:</span>
                                    <span className="text-orange-500">{getTotalPrice().toLocaleString("vi-VN")}₫</span>
                                </div>
                            </div>

                            {/* ✅ SỬA NÚT SUBMIT - DÙNG form ATTRIBUTE */}
                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={isProcessing}
                                className="hidden lg:block w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 transition-colors font-semibold mt-6"
                            >
                                {isProcessing ? "Đang xử lý..." : "Đặt hàng"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}