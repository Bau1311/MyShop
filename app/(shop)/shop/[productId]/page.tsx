// ProductDetailPage.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useShop } from "@/app/context/ShopContext";
import ToastNotification from "@/app/components/ToastNotification";
import { ShoppingCart, Heart, Share2, Star, MapPin, Shield, Truck, RotateCcw, MessageCircle } from "lucide-react";

interface ProductDetail {
    id: number;
    name: string;
    price: number;
    images: string[];
    category: string;
    description: string;
    colors: string[];
    sizes: string[];
    sold?: number;
    rating?: number;
    reviews?: number;
    location?: string;
    originalPrice?: number;
}

const products: ProductDetail[] = [
    { 
        id: 1, 
        name: "Áo thun Cotton nam nữ form rộng unisex", 
        price: 120000,
        originalPrice: 200000,
        images: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&h=800&fit=crop",
        ],
        category: "clothing", 
        description: "Áo thun cotton mềm mịn, thoáng mát. Chất liệu cao cấp, form dáng chuẩn, phù hợp nhiều phong cách. Thiết kế unisex hiện đại, dễ phối đồ.",
        colors: ["Trắng", "Đen", "Xanh lá", "Xanh dương"],
        sizes: ["S", "M", "L", "XL"],
        sold: 1234,
        rating: 4.8,
        reviews: 567,
        location: "Hà Nội"
    },
    { 
        id: 2, 
        name: "Giày Sneaker thể thao nam nữ đế cao", 
        price: 450000,
        originalPrice: 650000,
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=800&fit=crop",
        ],
        category: "shoes", 
        description: "Giày sneaker phong cách trẻ trung, năng động. Đế êm, ôm chân tốt, phù hợp vận động hàng ngày. Chất liệu cao cấp, bền đẹp.",
        colors: ["Trắng", "Đen", "Xám"],
        sizes: ["38", "39", "40", "41", "42"],
        sold: 856,
        rating: 4.9,
        reviews: 423,
        location: "TP. HCM"
    },
    { 
        id: 3, 
        name: "Tai nghe Bluetooth 5.0 chống ồn", 
        price: 250000,
        originalPrice: 500000,
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop",
        ],
        category: "electronics", 
        description: "Tai nghe Bluetooth pin khỏe, âm thanh sống động. Kết nối ổn định, thiết kế hiện đại. Chống ồn chủ động, trải nghiệm âm thanh tuyệt vời.",
        colors: ["Đen", "Trắng", "Xanh"],
        sizes: [],
        sold: 2341,
        rating: 4.7,
        reviews: 1234,
        location: "Hà Nội"
    },
    { 
        id: 4, 
        name: "Balo học sinh sinh viên chống nước", 
        price: 190000,
        originalPrice: 350000,
        images: [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=800&h=800&fit=crop",
        ],
        category: "bags", 
        description: "Balo học sinh nhiều ngăn, nhẹ và bền. Thiết kế thông minh, đựng được nhiều đồ. Chống nước tốt, phù hợp mọi thời tiết.",
        colors: ["Đen", "Xanh navy", "Xám"],
        sizes: [],
        sold: 678,
        rating: 4.6,
        reviews: 345,
        location: "Đà Nẵng"
    },
    { 
        id: 5, 
        name: "Áo khoác dù 2 lớp nam nữ", 
        price: 350000,
        originalPrice: 550000,
        images: [
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
        ],
        category: "clothing", 
        description: "Áo khoác mùa đông giữ ấm tốt, phong cách. Chất liệu dày dặn, thiết kế thời trang. Phù hợp cho cả nam và nữ.",
        colors: ["Đen", "Xám", "Be"],
        sizes: ["M", "L", "XL"],
        sold: 445,
        rating: 4.5,
        reviews: 223,
        location: "Hà Nội"
    },
    { 
        id: 6, 
        name: "Giày thể thao chạy bộ êm chân", 
        price: 520000,
        originalPrice: 800000,
        images: [
            "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop",
        ],
        category: "shoes", 
        description: "Giày thể thao bền đẹp, phù hợp chạy bộ. Công nghệ đệm khí, thoáng khí tốt. Thiết kế thời trang, năng động.",
        colors: ["Đen", "Trắng"],
        sizes: ["39", "40", "41", "42", "43"],
        sold: 912,
        rating: 4.8,
        reviews: 456,
        location: "TP. HCM"
    },
    { 
        id: 7, 
        name: "Laptop văn phòng học tập", 
        price: 15000000,
        originalPrice: 18000000,
        images: [
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=800&fit=crop",
        ],
        category: "electronics", 
        description: "Laptop hiệu năng cao, phục vụ học tập và làm việc. Màn hình sắc nét, pin trâu. Thiết kế mỏng nhẹ, dễ dàng di chuyển.",
        colors: ["Bạc", "Đen"],
        sizes: [],
        sold: 234,
        rating: 4.9,
        reviews: 189,
        location: "Hà Nội"
    },
    { 
        id: 8, 
        name: "Túi xách nữ thời trang cao cấp", 
        price: 280000,
        originalPrice: 450000,
        images: [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&h=800&fit=crop",
        ],
        category: "bags", 
        description: "Túi xách nữ thời trang, sang trọng. Thiết kế tinh tế, nhiều ngăn tiện lợi. Chất liệu da cao cấp, bền đẹp.",
        colors: ["Đen", "Nâu", "Hồng"],
        sizes: [],
        sold: 567,
        rating: 4.7,
        reviews: 312,
        location: "TP. HCM"
    },
];

export default function ProductDetailPage() {
    const params = useParams();
    const productIdParam = Array.isArray(params.productId) ? params.productId[0] : params.productId;
    const id = productIdParam ? parseInt(productIdParam as string, 10) : NaN;

    const router = useRouter();
    const { addToCart, setBuyNowItem } = useShop();

    const product = products.find((p) => p.id === id);

    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-600 bg-gray-50">
                <p className="text-lg mb-4">Không tìm thấy sản phẩm</p>
                <button
                    onClick={() => router.push("/")}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                    Quay về trang chủ
                </button>
            </div>
        );
    }

    const handleAddToCart = () => {
        addToCart({
            ...(product as any), 
            quantity,
            selectedColor,
            selectedSize
        });

        const colorText = selectedColor ? `, Màu: ${selectedColor}` : '';
        const sizeText = selectedSize ? `, Size: ${selectedSize}` : '';
        setToastMessage(`✓ Đã thêm ${quantity}x ${product.name}${colorText}${sizeText} vào giỏ hàng!`);
    };

    const handleBuyNow = () => {
        // Kiểm tra validation
        if (product.colors.length > 0 && !selectedColor) {
            setToastMessage("⚠️ Vui lòng chọn màu sắc!");
            return;
        }
        if (product.sizes.length > 0 && !selectedSize) {
            setToastMessage("⚠️ Vui lòng chọn kích thước!");
            return;
        }

        // Tạo item mua ngay (KHÔNG thêm vào giỏ hàng)
        const buyNowProduct: any = {
            id: product.id,
            name: product.name,
            price: product.price,
            // image: product.image,
            images: product.images,
            description: product.description,
            quantity: quantity,
            selectedColor: selectedColor,
            selectedSize: selectedSize,
            category: product.category,
            colors: product.colors,
            sizes: product.sizes,
        };

        // Lưu vào buyNowItem
        setBuyNowItem(buyNowProduct);

        // Hiển thị toast
        setToastMessage(`✓ Đang chuyển đến trang thanh toán...`);

        // Chuyển hướng với query param
        setTimeout(() => {
            router.push('/checkout?mode=buynow');
        }, 300);
    };

    const discount = product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HEADER */}
            <div className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="text-orange-500 hover:text-orange-600 flex items-center gap-2 font-medium transition"
                    >
                        ← Quay lại
                    </button>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-600 hover:text-orange-500 transition">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setIsFavorite(!isFavorite)}
                            className={`transition ${isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* MAIN CONTENT */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
                    <div className="grid md:grid-cols-2 gap-8 p-6">
                        {/* IMAGE GALLERY */}
                        <div className="space-y-4">
                            <div className="relative rounded-lg overflow-hidden bg-gray-100 shadow-lg group">
                                <img
                                    src={product.images[currentImageIndex]}
                                    alt={product.name}
                                    className="w-full h-[500px] object-cover"
                                />
                                
                                {discount > 0 && (
                                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                        -{discount}%
                                    </div>
                                )}

                                {product.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentImageIndex((currentImageIndex - 1 + product.images.length) % product.images.length)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100"
                                        >
                                            ←
                                        </button>
                                        <button
                                            onClick={() => setCurrentImageIndex((currentImageIndex + 1) % product.images.length)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100"
                                        >
                                            →
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`rounded-lg overflow-hidden border-2 transition-all ${
                                            currentImageIndex === index
                                                ? "border-orange-500 ring-2 ring-orange-200 scale-105"
                                                : "border-gray-200 hover:border-orange-300"
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-20 object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PRODUCT INFO */}
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                
                                <div className="flex items-center gap-4 text-sm mb-4">
                                    <div className="flex items-center gap-1">
                                        <span className="text-orange-500 font-bold">{product.rating || 4.8}</span>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-gray-400">|</span>
                                    <span className="text-gray-600">{product.reviews || 567} Đánh giá</span>
                                    <span className="text-gray-400">|</span>
                                    <span className="text-gray-600">{product.sold || 1234} Đã bán</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-3xl font-bold text-orange-600">
                                        {product.price.toLocaleString("vi-VN")}₫
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-lg text-gray-400 line-through">
                                            {product.originalPrice.toLocaleString("vi-VN")}₫
                                        </span>
                                    )}
                                </div>
                                {discount > 0 && (
                                    <p className="text-sm text-green-600 font-medium">Tiết kiệm {(product.originalPrice! - product.price).toLocaleString("vi-VN")}₫</p>
                                )}
                            </div>

                            <p className="text-gray-600 leading-relaxed">{product.description}</p>

                            {/* COLORS */}
                            {product.colors?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3 text-gray-800">
                                        Màu sắc: 
                                        {selectedColor && <span className="text-orange-600 ml-2">{selectedColor}</span>}
                                    </h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {product.colors.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                                    selectedColor === color
                                                        ? "bg-orange-500 text-white border-orange-500 shadow-md"
                                                        : "bg-white hover:border-orange-300 text-gray-700 border-gray-300"
                                                }`}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SIZES */}
                            {product.sizes?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3 text-gray-800">
                                        Kích thước:
                                        {selectedSize && <span className="text-orange-600 ml-2">{selectedSize}</span>}
                                    </h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                                    selectedSize === size
                                                        ? "bg-orange-500 text-white border-orange-500 shadow-md"
                                                        : "bg-white hover:border-orange-300 text-gray-700 border-gray-300"
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* QUANTITY */}
                            <div>
                                <h3 className="font-semibold mb-3 text-gray-800">Số lượng:</h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:text-orange-500 transition font-semibold"
                                    >
                                        -
                                    </button>
                                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:text-orange-500 transition font-semibold"
                                    >
                                        +
                                    </button>
                                    <span className="text-gray-500 text-sm ml-2">(Còn 999 sản phẩm)</span>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={
                                        (product.colors.length > 0 && !selectedColor) ||
                                        (product.sizes.length > 0 && !selectedSize)
                                    }
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Thêm vào giỏ hàng
                                </button>
                                <button 
                                    onClick={handleBuyNow}
                                    disabled={
                                        (product.colors.length > 0 && !selectedColor) ||
                                        (product.sizes.length > 0 && !selectedSize)
                                    }
                                    className="px-6 py-4 border-2 border-orange-500 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Mua ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SHOP INFO & POLICIES */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Thông tin shop</h3>
                                <p className="text-sm text-gray-600">{product.location || "Hà Nội"}</p>
                            </div>
                        </div>
                        <button className="w-full py-2 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition font-medium flex items-center justify-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Chat ngay
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <Truck className="w-6 h-6 text-green-600" />
                            <h3 className="font-semibold text-gray-800">Vận chuyển</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Miễn phí vận chuyển cho đơn từ 0đ</p>
                        <p className="text-sm text-gray-500">Giao hàng 2-3 ngày</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <Shield className="w-6 h-6 text-blue-600" />
                            <h3 className="font-semibold text-gray-800">Bảo hành</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Đổi trả trong 7 ngày</p>
                        <p className="text-sm text-gray-500">Hàng chính hãng 100%</p>
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Chi tiết sản phẩm</h2>
                    <div className="prose max-w-none text-gray-600">
                        <p className="mb-4">{product.description}</p>
                        <h3 className="font-semibold text-gray-800 mb-2">Đặc điểm nổi bật:</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>Chất liệu cao cấp, bền đẹp theo thời gian</li>
                            <li>Thiết kế hiện đại, phù hợp nhiều phong cách</li>
                            <li>Dễ dàng vệ sinh và bảo quản</li>
                            <li>Đa dạng màu sắc và kích thước</li>
                        </ul>
                    </div>
                </div>
            </div>

            <ToastNotification 
                message={toastMessage} 
                onClose={() => setToastMessage(null)} 
            />
        </div>
    );
}