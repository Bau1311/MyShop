"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useShop } from "@/app/context/ShopContext";
import { ProductDetailResponse, VariantInfo } from "@/app/services/productApi"; // ✅ FIX: Import đúng
import { ShoppingCart, Heart, Share2, Star, MapPin, Shield, Truck, MessageCircle } from "lucide-react";

export default function ProductDetailPage() {
    const params = useParams();
    const productIdParam = Array.isArray(params.productId) ? params.productId[0] : params.productId;
    const id = productIdParam ? parseInt(productIdParam as string, 10) : NaN;

    const router = useRouter();
    const { addToCart, setBuyNowItem, user } = useShop();

    const [product, setProduct] = useState<ProductDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState<number>(1);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    // Variant selection
    const [selectedVariant, setSelectedVariant] = useState<VariantInfo | null>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});

    // Load sản phẩm từ API
    useEffect(() => {
        if (isNaN(id)) return;

        const loadProduct = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/api/products/id/${id}`);

                if (!response.ok) {
                    throw new Error('Không thể tải sản phẩm');
                }

                const productData = await response.json();

                if (productData) {
                    setProduct(productData);

                    // Tự động chọn variant đầu tiên nếu có
                    if (productData.variants && productData.variants.length > 0) {
                        const firstVariant = productData.variants[0];
                        setSelectedVariant(firstVariant);

                        // Parse attributes từ JSON
                        try {
                            const attrs = JSON.parse(firstVariant.attributesJson);
                            setSelectedAttributes(attrs);
                        } catch (e) {
                            console.error("Lỗi parse attributes:", e);
                        }
                    }
                }
            } catch (error) {
                console.error("❌ Lỗi khi load sản phẩm:", error);
                setToastMessage("⚠️ Không thể tải sản phẩm!");
            } finally {
                setIsLoading(false);
            }
        };

        loadProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const getAvailableAttributes = (): { [key: string]: string[] } => {
        if (!product?.variants) return {};

        const attributesMap: { [key: string]: Set<string> } = {};

        product.variants.forEach(variant => {
            try {
                const attrs = JSON.parse(variant.attributesJson);
                Object.entries(attrs).forEach(([key, value]) => {
                    if (!attributesMap[key]) {
                        attributesMap[key] = new Set();
                    }
                    attributesMap[key].add(value as string);
                });
            } catch (e) {
                console.error("Lỗi parse attributes:", e);
            }
        });

        const result: { [key: string]: string[] } = {};
        Object.entries(attributesMap).forEach(([key, valueSet]) => {
            result[key] = Array.from(valueSet);
        });

        return result;
    };

    const findMatchingVariant = (attrs: { [key: string]: string }): VariantInfo | null => {
        if (!product?.variants) return null;

        return product.variants.find(variant => {
            try {
                const variantAttrs = JSON.parse(variant.attributesJson);

                // Normalize both objects for comparison (lowercase values, sorted keys)
                const normalizeAttrs = (obj: { [key: string]: string }) => {
                    const normalized: { [key: string]: string } = {};
                    Object.keys(obj).sort().forEach(key => {
                        normalized[key.toLowerCase()] = obj[key].toLowerCase();
                    });
                    return normalized;
                };

                const normalizedVariantAttrs = normalizeAttrs(variantAttrs);
                const normalizedSearchAttrs = normalizeAttrs(attrs);

                // Compare normalized objects
                const variantKeys = Object.keys(normalizedVariantAttrs).sort();
                const searchKeys = Object.keys(normalizedSearchAttrs).sort();

                if (variantKeys.length !== searchKeys.length) return false;

                const matches = variantKeys.every((key, index) => {
                    return key === searchKeys[index] &&
                        normalizedVariantAttrs[key] === normalizedSearchAttrs[key];
                });

                return matches;
            } catch (e) {
                console.error('Error parsing variant attributes:', e);
                return false;
            }
        }) || null;
    };

    const handleAttributeSelect = (attributeName: string, value: string) => {
        const newAttributes = {
            ...selectedAttributes,
            [attributeName]: value
        };
        setSelectedAttributes(newAttributes);

        const matchingVariant = findMatchingVariant(newAttributes);
        if (matchingVariant) {
            setSelectedVariant(matchingVariant);
        }
    };

    const availableAttributes = getAvailableAttributes();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

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

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            setToastMessage("⚠️ Vui lòng chọn phiên bản sản phẩm!");
            return;
        }

        await addToCart({
            id: product.productId,
            name: product.name,
            price: selectedVariant.priceOverride || product.price,
            image: product.images.find(i => i.isPrimary)?.imageUrl || product.images[0]?.imageUrl,
            quantity,
            variantId: selectedVariant.variantId,
            selectedVariant: selectedVariant,
        });

        setToastMessage(`✓ Đã thêm ${quantity}x ${product.name} vào giỏ hàng!`);
    };

    const handleBuyNow = () => {
        if (!selectedVariant) {
            setToastMessage("⚠️ Vui lòng chọn phiên bản sản phẩm!");
            return;
        }

        if (!user) {
            const confirm = window.confirm("Bạn cần đăng nhập để mua hàng. Đăng nhập ngay?");
            if (confirm) router.push("/login");
            return;
        }

        const buyNowProduct: any = {
            itemId: 0,
            variantId: selectedVariant.variantId,
            productId: product.productId,
            productName: product.name,
            price: selectedVariant.priceOverride || product.price,
            quantity: quantity,
            attributesJson: selectedVariant.attributesJson,
            lineTotal: (selectedVariant.priceOverride || product.price) * quantity,
            image: product.images.find(i => i.isPrimary)?.imageUrl || product.images[0]?.imageUrl,
        };

        setBuyNowItem(buyNowProduct);
        setToastMessage(`✓ Đang chuyển đến trang thanh toán...`);

        setTimeout(() => {
            router.push('/checkout?mode=buynow');
        }, 300);
    };

    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    const currentImage = product.images[currentImageIndex] || primaryImage;

    return (
        <div className="min-h-screen bg-gray-50">
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
                <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
                    <div className="grid md:grid-cols-2 gap-8 p-6">
                        <div className="space-y-4">
                            <div className="relative rounded-lg overflow-hidden bg-gray-100 shadow-lg group">
                                <img
                                    src={currentImage?.imageUrl || 'https://via.placeholder.com/500'}
                                    alt={product.name}
                                    className="w-full h-[500px] object-cover"
                                />

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

                            {product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {product.images.map((img, index) => (
                                        <button
                                            key={img.imageId}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                                                ? "border-orange-500 ring-2 ring-orange-200 scale-105"
                                                : "border-gray-200 hover:border-orange-300"
                                                }`}
                                        >
                                            <img
                                                src={img.imageUrl}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-20 object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

                                <div className="flex items-center gap-4 text-sm mb-4">
                                    <div className="flex items-center gap-1">
                                        <span className="text-orange-500 font-bold">4.8</span>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-gray-400">|</span>
                                    <span className="text-gray-600">{product.totalReviews || 0} Đánh giá</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-3xl font-bold text-orange-600">
                                        {((selectedVariant?.priceOverride || product.price) || 0).toLocaleString("vi-VN")}₫
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-600 leading-relaxed">{product.description}</p>

                            {product.brand && (
                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-3">
                                        {product.brand.logoUrl && (
                                            <img src={product.brand.logoUrl} alt={product.brand.name} className="w-12 h-12 object-contain" />
                                        )}
                                        <div>
                                            <p className="text-sm text-gray-500">Thương hiệu</p>
                                            <p className="font-semibold text-gray-800">{product.brand.name}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {Object.entries(availableAttributes).map(([attributeName, values]) => (
                                <div key={attributeName}>
                                    <h3 className="font-semibold mb-3 text-gray-800 capitalize">
                                        {attributeName}:
                                        {selectedAttributes[attributeName] && (
                                            <span className="text-orange-600 ml-2">{selectedAttributes[attributeName]}</span>
                                        )}
                                    </h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {values.map((value) => (
                                            <button
                                                key={value}
                                                onClick={() => handleAttributeSelect(attributeName, value)}
                                                className={`px-4 py-2 rounded-lg border-2 transition-all ${selectedAttributes[attributeName] === value
                                                    ? "bg-orange-500 text-white border-orange-500 shadow-md"
                                                    : "bg-white hover:border-orange-300 text-gray-700 border-gray-300"
                                                    }`}
                                            >
                                                {value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {selectedVariant && (
                                <div className="text-sm">
                                    <span className="text-gray-600">Còn lại: </span>
                                    <span className="font-semibold text-green-600">{selectedVariant.quantity} sản phẩm</span>
                                </div>
                            )}

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
                                        onClick={() => setQuantity(Math.min(selectedVariant?.quantity || 999, quantity + 1))}
                                        className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:text-orange-500 transition font-semibold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!selectedVariant || (selectedVariant.quantity === 0)}
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Thêm vào giỏ hàng
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={!selectedVariant || (selectedVariant.quantity === 0)}
                                    className="px-6 py-4 border-2 border-orange-500 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Mua ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Thông tin shop</h3>
                                <p className="text-sm text-gray-600">Việt Nam</p>
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
                        <p className="text-sm text-gray-600 mb-2">Miễn phí vận chuyển</p>
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

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Chi tiết sản phẩm</h2>
                    <div className="prose max-w-none text-gray-600">
                        <p className="mb-4">{product.description}</p>
                    </div>
                </div>

                {product.reviews && product.reviews.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Đánh giá ({product.reviews.length})
                        </h2>
                        <div className="space-y-4">
                            {product.reviews.map((review: any) => (
                                <div key={review.reviewId} className="border-b pb-4 last:border-b-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold">{review.userName}</span>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                                    <p className="text-gray-600 text-sm">{review.content}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {toastMessage && (
                <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                    {toastMessage}
                    <button onClick={() => setToastMessage(null)} className="ml-4 text-gray-300 hover:text-white">
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}