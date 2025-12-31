"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "@/app/context/ShopContext";
import {
  orderApi,
  CheckoutResponse,
  AddressResponse,
  VariantItem,
  OrderCreateRequest,
  AddressRequest,
} from "@/app/services/cartApi";
import { voucherApi, VoucherResponse, calculateVoucherDiscount, isVoucherUsable } from "@/app/services/voucherApi";
import { Ticket, X } from "lucide-react";

const API_URL = "https://provinces.open-api.vn/api/";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const { cart, buyNowItem, clearCart, user, selectedCartItems, setSelectedCartItems, loadCartFromAPI } = useShop();

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [selectedShipping, setSelectedShipping] = useState<number | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherResponse | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<VoucherResponse[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  const [formData, setFormData] = useState({
    recipientName: "",
    phone: "",
    street: "",
    city: "",
    district: "",
    ward: "",
    cityCode: "",
    districtCode: "",
    wardCode: "",
    note: "",
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);

  const prevCityCodeRef = useRef<string>("");
  const prevDistrictCodeRef = useRef<string>("");

  const [totalInfo, setTotalInfo] = useState({
    totalAmount: 0,
    shippingFee: 0,
    voucherDiscountAmount: 0,
    finalTotalAmount: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadCheckoutData();
    loadVouchers();
  }, [user]);

  const loadCheckoutData = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);

      let variants: VariantItem[] = [];

      if (mode === "buynow" && buyNowItem) {
        variants = [{
          variantId: buyNowItem.variantId,
          quantity: buyNowItem.quantity,
          priceSnapshot: buyNowItem.price,
        }];
      } else {
        // Filter cart to only include selected items
        const itemsToCheckout = selectedCartItems.size > 0
          ? cart.filter(item => selectedCartItems.has(item.variantId))
          : cart;  // Fallback to all items if none selected

        if (itemsToCheckout.length === 0) {
          router.push("/cart");
          return;
        }

        variants = itemsToCheckout.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          priceSnapshot: item.price,
        }));
      }

      if (variants.length === 0) {
        alert("Không có sản phẩm nào để thanh toán");
        router.push(mode === "buynow" ? "/" : "/cart");
        return;
      }

      const response = await orderApi.getCheckoutInfo(user.userId, { variants });

      setCheckoutData(response);

      if (response.addressList && response.addressList.length > 0) {
        const defaultAddr = response.addressList.find((a) => a.isDefault) || response.addressList[0];
        setSelectedAddress(defaultAddr);
      } else {
        setSelectedAddress(null);
      }

      if (response.paymentMethods && response.paymentMethods.length > 0) {
        setSelectedPayment(response.paymentMethods[0].code);
      }

      if (response.shippingMethods && response.shippingMethods.length > 0) {
        setSelectedShipping(response.shippingMethods[0].id);
      }


      // Calculate total from cart items
      const items = mode === "buynow" && buyNowItem
        ? [buyNowItem]
        : (selectedCartItems.size > 0
          ? cart.filter(item => selectedCartItems.has(item.variantId))
          : cart);
      const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingFee = 30000; // Default shipping

      setTotalInfo({
        totalAmount: calculatedTotal,
        shippingFee: shippingFee,
        voucherDiscountAmount: 0,
        finalTotalAmount: calculatedTotal + shippingFee,
      });
    } catch (error: any) {
      console.error("Lỗi khi load checkout:", error);
      alert(error.message || "Không thể tải thông tin thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const loadVouchers = async () => {
    try {
      setLoadingVouchers(true);
      const vouchers = await voucherApi.getAvailableVouchers();
      // 🔥 Filter out used vouchers - only show unused ones
      const unusedVouchers = vouchers.filter(v => v.userVoucherStatus !== 'used');
      setAvailableVouchers(unusedVouchers);
    } catch (error) {
      console.error('Failed to load vouchers:', error);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const recalculateTotal = async () => {
    if (!user?.userId) return;

    try {
      // Calculate total from cart items
      const items = mode === "buynow" && buyNowItem
        ? [buyNowItem]
        : (selectedCartItems.size > 0
          ? cart.filter(item => selectedCartItems.has(item.variantId))
          : cart);
      const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const response = await orderApi.calculateTotal({
        variants: items.map(i => ({
          variantId: i.variantId,
          quantity: i.quantity,
          priceSnapshot: i.price // Send cart price to backend
        })),
        shippingMethodId: selectedShipping || undefined,
        voucherCode: selectedVoucher?.code || undefined,
      });

      setTotalInfo({
        totalAmount: response.totalAmount, // Use backend's authoritative subtotal
        shippingFee: response.shippingFee,
        voucherDiscountAmount: response.voucherDiscountAmount,
        finalTotalAmount: response.finalTotalAmount, // Use backend's final total
      });
    } catch (error: any) {
      console.error("Lỗi khi tính toán:", error);
    }
  };

  useEffect(() => {
    if (checkoutData && selectedShipping) {
      recalculateTotal();
    }
  }, [selectedShipping, selectedVoucher]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch(`${API_URL}p/`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setProvinces(data.sort((a: any, b: any) => a.name.localeCompare(b.name, "vi")));
        }
        setLoadingProvinces(false);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (formData.cityCode && formData.cityCode !== prevCityCodeRef.current) {
      prevCityCodeRef.current = formData.cityCode;
      const fetchDistricts = async () => {
        try {
          const response = await fetch(`${API_URL}p/${formData.cityCode}?depth=2`);
          const data = await response.json();
          if (data && Array.isArray(data.districts)) {
            setDistricts(data.districts.sort((a: any, b: any) => a.name.localeCompare(b.name, "vi")));
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

  useEffect(() => {
    if (formData.districtCode && formData.districtCode !== prevDistrictCodeRef.current) {
      prevDistrictCodeRef.current = formData.districtCode;
      const fetchWards = async () => {
        try {
          const response = await fetch(`${API_URL}d/${formData.districtCode}?depth=2`);
          const data = await response.json();
          if (data && Array.isArray(data.wards)) {
            setWards(data.wards.sort((a: any, b: any) => a.name.localeCompare(b.name, "vi")));
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
      const selectedProvince = provinces.find((p) => p.name === value);
      setFormData((prev) => ({
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
      const selectedDistrict = districts.find((d) => d.name === value);
      setFormData((prev) => ({
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
      const selectedWard = wards.find((w) => w.name === value);
      setFormData((prev) => ({
        ...prev,
        ward: value,
        wardCode: selectedWard ? selectedWard.code : "",
      }));
      setErrors((prev: any) => ({ ...prev, ward: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (selectedAddress) return true;

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = "Vui lòng nhập tên người nhận";
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.cityCode || !formData.city) newErrors.city = "Vui lòng chọn Tỉnh/Thành phố";
    if (!formData.districtCode || !formData.district) newErrors.district = "Vui lòng chọn Quận/Huyện";
    if (!formData.wardCode || !formData.ward) newErrors.ward = "Vui lòng chọn Phường/Xã";
    if (!formData.street.trim()) newErrors.street = "Vui lòng nhập địa chỉ cụ thể";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!user?.userId) {
      alert("Vui lòng đăng nhập!");
      return;
    }

    if (!selectedAddress) {
      alert("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    if (!selectedPayment) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    setIsProcessing(true);

    try {
      let items: any[] = [];

      if (mode === "buynow" && buyNowItem) {
        items = [{ variantId: buyNowItem.variantId, quantity: buyNowItem.quantity, price: buyNowItem.price }];
      } else {
        // 🔥 FIX: Only send selected items to backend
        items = cart
          .filter(item => selectedCartItems.has(item.variantId))
          .map((item) => ({ variantId: item.variantId, quantity: item.quantity, price: item.price }));
      }

      const orderData: OrderCreateRequest = {
        userId: user.userId,
        paymentMethod: selectedPayment,
        note: formData.note,
        addressId: selectedAddress.addressId,  // Backend expects addressId
        items: items,
        voucherCode: selectedVoucher?.code || undefined,
        shippingMethodId: selectedShipping || undefined,
      };

      await orderApi.createOrder(orderData);
      setOrderSuccess(true);

      if (mode !== "buynow") {
        // Backend already removes ordered items from cart
        setSelectedCartItems(new Set());  // Clear selected items
        // 🔥 Auto-reload cart to reflect changes
        await loadCartFromAPI();
      }

      setTimeout(() => {
        router.push("/account/orders");
      }, 3000);
    } catch (error: any) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      alert(error.message || "Có lỗi xảy ra khi tạo đơn hàng!");
    } finally {
      setIsProcessing(false);
    }
  };

  const goToHome = () => router.push("/");
  const parseAttributes = (attributesJson: string): string => {
    try {
      const attrs = JSON.parse(attributesJson);
      return Object.entries(attrs).map(([key, value]) => `${key}: ${value}`).join(", ");
    } catch (e) {
      return "";
    }
  };

  const displayItems = mode === "buynow" && buyNowItem
    ? [buyNowItem]
    : (selectedCartItems.size > 0
      ? cart.filter(item => selectedCartItems.has(item.variantId))
      : cart);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (mode === "buynow" && !buyNowItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có sản phẩm</h2>
          <p className="text-gray-600 mb-6">Vui lòng chọn sản phẩm để mua</p>
          <button onClick={goToHome} className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            Quay lại mua sắm
          </button>
        </div>
      </div>
    );
  }

  if (displayItems.length === 0 && !orderSuccess) {
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
          <button onClick={() => router.push("/account/orders")} className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            Xem đơn hàng
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
              {checkoutData && checkoutData.addressList && checkoutData.addressList.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Chọn địa chỉ giao hàng</h2>
                  <div className="space-y-3">
                    {checkoutData.addressList.map((addr) => (
                      <label key={addr.addressId} className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                        style={{ borderColor: selectedAddress?.addressId === addr.addressId ? "#f97316" : "#d1d5db" }}>
                        <input type="radio" name="address" checked={selectedAddress?.addressId === addr.addressId}
                          onChange={() => setSelectedAddress(addr)} className="w-4 h-4 text-orange-500 mt-1" />
                        <div className="ml-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">{addr.recipientName}</span>
                            {addr.isDefault && (
                              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded">Mặc định</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{addr.phone}</p>
                          <p className="text-sm text-gray-600">{addr.street}, {addr.ward}, {addr.district}, {addr.city}</p>
                        </div>
                      </label>
                    ))}
                    <button type="button" onClick={() => setSelectedAddress(null)}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-500 transition">
                      + Thêm địa chỉ mới
                    </button>
                  </div>
                </div>
              )}

              {!checkoutData?.addressList || checkoutData.addressList.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <p className="text-yellow-800 mb-4">Bạn chưa có địa chỉ giao hàng nào. Vui lòng thêm địa chỉ trước khi thanh toán.</p>
                  <button type="button" onClick={() => router.push('/account/addresses')}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition">
                    Thêm địa chỉ mới
                  </button>
                </div>
              )}


              {checkoutData && checkoutData.paymentMethods && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Phương thức thanh toán</h2>
                  <div className="space-y-3">
                    {checkoutData.paymentMethods.map((pm) => (
                      <label key={pm.code} className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                        style={{ borderColor: selectedPayment === pm.code ? "#f97316" : "#d1d5db" }}>
                        <input type="radio" name="payment" value={pm.code} checked={selectedPayment === pm.code}
                          onChange={(e) => setSelectedPayment(e.target.value)} className="w-4 h-4 text-orange-500" />
                        <div className="ml-3">
                          <span className="font-medium text-gray-800">{pm.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {checkoutData && checkoutData.shippingMethods && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Phương thức vận chuyển</h2>
                  <div className="space-y-3">
                    {checkoutData.shippingMethods.map((sm) => (
                      <label key={sm.id} className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                        style={{ borderColor: selectedShipping === sm.id ? "#f97316" : "#d1d5db" }}>
                        <div className="flex items-center">
                          <input type="radio" name="shipping" value={sm.id} checked={selectedShipping === sm.id}
                            onChange={(e) => setSelectedShipping(Number(e.target.value))} className="w-4 h-4 text-orange-500" />
                          <div className="ml-3">
                            <span className="font-medium text-gray-800">{sm.name}</span>
                            <p className="text-sm text-gray-600">Giao hàng trong {sm.estimatedDays} ngày</p>
                          </div>
                        </div>
                        <span className="font-semibold text-orange-600">{sm.baseFee.toLocaleString("vi-VN")}đ</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Đơn hàng của bạn</h2>

              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {displayItems.map((item) => (
                  <div key={item.variantId} className="flex gap-3 pb-4 border-b">
                    <img src={(item as any).imageUrl || item.image || "https://via.placeholder.com/64x64?text=No+Image"} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-800 truncate">{item.productName}</h3>
                      {item.attributesJson && (
                        <p className="text-xs text-gray-500 truncate">{parseAttributes(item.attributesJson)}</p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-orange-600 font-semibold text-sm">{item.price.toLocaleString("vi-VN")}đ</span>
                        <span className="text-gray-600 text-sm">x{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Voucher Selection */}
              <div className="mb-4 pb-4 border-b">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giảm giá
                </label>

                {selectedVoucher ? (
                  <div className="border-2 border-orange-200 rounded-lg p-3 bg-orange-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Ticket className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{selectedVoucher.code}</p>
                          <p className="text-xs text-gray-600">
                            {selectedVoucher.discountType === 'percentage'
                              ? `Giảm ${selectedVoucher.discountAmount}%`
                              : `Giảm ${selectedVoucher.discountAmount.toLocaleString('vi-VN')}₫`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedVoucher(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowVoucherModal(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-gray-600 hover:text-orange-600 font-medium text-sm flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Ticket className="w-5 h-5" />
                      Chọn voucher
                    </span>
                    <span>›</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="text-gray-800 font-medium">{totalInfo.totalAmount.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="text-gray-800 font-medium">{totalInfo.shippingFee.toLocaleString("vi-VN")}đ</span>
                </div>
                {totalInfo.voucherDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="text-green-600 font-medium">-{totalInfo.voucherDiscountAmount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-gray-800">Tổng cộng:</span>
                <span className="text-2xl font-bold text-orange-600">{totalInfo.finalTotalAmount.toLocaleString("vi-VN")}đ</span>
              </div>

              <button type="submit" form="checkout-form" disabled={isProcessing}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  "Đặt hàng"
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng việc đặt hàng, bạn đồng ý với{" "}
                <a href="#" className="text-orange-600 hover:underline">Điều khoản sử dụng</a> của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Selection Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-orange-500" />
                Chọn Voucher
              </h3>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loadingVouchers ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : availableVouchers.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Không có voucher khả dụng</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableVouchers.map((voucher) => {
                    const usable = isVoucherUsable(voucher, totalInfo.totalAmount);
                    const discount = usable ? calculateVoucherDiscount(voucher, totalInfo.totalAmount) : 0;

                    return (
                      <div
                        key={voucher.voucherId}
                        className={`border-2 rounded-lg p-4 transition ${usable
                          ? 'border-orange-200 bg-orange-50 hover:border-orange-400'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                              <Ticket className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{voucher.code}</p>
                              <p className="text-xs text-gray-500">
                                {voucher.discountType === 'percentage'
                                  ? `Giảm ${voucher.discountAmount}%`
                                  : `Giảm ${voucher.discountAmount.toLocaleString('vi-VN')}₫`}
                              </p>
                            </div>
                          </div>
                          {usable && (
                            <span className="text-green-600 font-semibold text-sm">
                              -{discount.toLocaleString('vi-VN')}₫
                            </span>
                          )}
                        </div>

                        {voucher.minOrderValue && (
                          <p className="text-xs text-gray-600 mb-2">
                            Đơn tối thiểu: {voucher.minOrderValue.toLocaleString('vi-VN')}₫
                          </p>
                        )}

                        {!usable && voucher.minOrderValue && totalInfo.totalAmount < voucher.minOrderValue && (
                          <p className="text-xs text-red-600 mb-2">
                            Cần thêm {(voucher.minOrderValue - totalInfo.totalAmount).toLocaleString('vi-VN')}₫
                          </p>
                        )}

                        <button
                          onClick={() => {
                            if (usable) {
                              setSelectedVoucher(voucher);
                              setShowVoucherModal(false);
                            }
                          }}
                          disabled={!usable}
                          className={`w-full py-2 rounded-lg font-medium text-sm transition ${usable
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          {usable ? 'Áp dụng' : 'Không đủ điều kiện'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}