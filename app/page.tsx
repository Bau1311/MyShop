"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useShop } from "./context/ShopContext";
import PopupModal from "./components/PopupModal";
import BannerSlider from "./components/BannerSlider";
import { Heart, Star, TrendingUp, Zap, Shield, ChevronLeft, ChevronRight } from "lucide-react";

// ✅ Import từ file productApi mới
import { productApiService, ProductSearchResponse } from "./services/productApi";

const toNumber = (v: any): number => {
    if (v === null || v === undefined) return 0;
    const num = typeof v === "number" ? v : Number(v);
    return isNaN(num) ? 0 : num;
};

const normalizeProduct = (p: any) => {
    return {
        ...p,
        originalPrice: toNumber(p.originalPrice),
        discountAmount: toNumber(p.discountAmount),
        finalPrice: toNumber(p.finalPrice),
        totalPurchaseCount: toNumber(p.totalPurchaseCount ?? 0),
        rating: p.rating ?? 4.8,
        imageUrl: p.imageUrl && p.imageUrl.trim() ? p.imageUrl : "https://via.placeholder.com/400x400?text=No+Image",
    };
};

const categories = [
    { id: "all", name: "Tất cả", icon: "🏪" },
    { id: "clothing", name: "Quần áo", icon: "👕" },
    { id: "shoes", name: "Giày dép", icon: "👟" },
    { id: "bags", name: "Ba lô túi xách", icon: "🎒" },
    { id: "electronics", name: "Đồ điện tử", icon: "💻" },
];

// COMPONENT CHÍNH
function HomeContent() {
    const { addToCart, user, loadCartFromAPI } = useShop();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showPopup, setShowPopup] = useState(false);
    const [sortBy, setSortBy] = useState("popular");

    const [products, setProducts] = useState<ProductSearchResponse[]>([]);
    const [topSelling, setTopSelling] = useState<ProductSearchResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchResults, setSearchResults] = useState<ProductSearchResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);

    const searchTerm = searchParams.get('search') || '';

    // Load products từ API
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);

            const allProducts = await productApiService.getTop50Products();
            const bestSellers = await productApiService.getTopSellingProducts();

            const normalizedProducts = allProducts.map(normalizeProduct);
            const normalizedBestSellers = bestSellers.map(normalizeProduct);

            setProducts(normalizedProducts);
            setTopSelling(normalizedBestSellers);

        } catch (error) {
            console.error("❌ Lỗi khi tải sản phẩm:", error);
            console.error("❌ Error type:", typeof error);
            console.error("❌ Error message:", error instanceof Error ? error.message : String(error));
            alert("Không thể kết nối với máy chủ. Vui lòng kiểm tra:\\n1. Backend đang chạy tại http://localhost:8080\\n2. CORS đã được cấu hình\\n3. Database có dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    // Search products
    useEffect(() => {
        if (searchTerm.trim()) {
            handleSearch(searchTerm);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    }, [searchTerm]);

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        try {
            setIsSearching(true);
            const results = await productApiService.searchProducts(query);
            setSearchResults(results.map(normalizeProduct));
        } catch (error) {
            console.error("Lỗi khi tìm kiếm:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setShowPopup(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    const filteredProducts = useMemo(() => {
        let baseProducts = searchTerm ? searchResults : products;
        let filtered = baseProducts;

        if (!searchTerm && selectedCategory !== "all") {
            // Filter by category nếu cần
        }

        const sorted = [...filtered];

        switch (sortBy) {
            case "best-selling":
                return sorted.sort((a, b) => (b.totalPurchaseCount || 0) - (a.totalPurchaseCount || 0));

            case "latest":
                return sorted.sort((a, b) => b.productId - a.productId);

            case "price-asc":
                return sorted.sort((a, b) => a.finalPrice - b.finalPrice);

            case "price-desc":
                return sorted.sort((a, b) => b.finalPrice - a.finalPrice);

            case "popular":
            default:
                return sorted.sort((a, b) => (b.totalPurchaseCount || 0) - (a.totalPurchaseCount || 0));
        }
    }, [products, searchResults, selectedCategory, searchTerm, sortBy]);

    const handleAddToCart = async (product: ProductSearchResponse) => {
        try {
            // Kiểm tra đăng nhập
            if (!user) {
                const confirm = window.confirm(
                    "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Đăng nhập ngay?"
                );
                if (confirm) {
                    router.push("/login");
                }
                return;
            }

            // ⚡ CHUYỂN THẲNG SANG TRANG CHI TIẾT
            // User sẽ xem thông tin đầy đủ và thêm vào giỏ ở đó
            router.push(`/shop/${product.productId}`);

        } catch (error) {
            console.error('❌ Error:', error);
            alert("Đã có lỗi xảy ra. Vui lòng thử lại!");
        }
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value;
        setSortBy(newSort);
    };

    const calculateDiscount = (original: number, final: number): number => {
        if (original <= final) return 0;
        return Math.round(((original - final) / original) * 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-orange-50 to-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-6">

                {/* CATEGORIES BAR */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => {
                                    setSelectedCategory(category.id);
                                    if (searchTerm) {
                                        router.push('/');
                                    }
                                }}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${selectedCategory === category.id
                                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105"
                                    : "bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200"
                                    }`}
                            >
                                <span className="text-xl">{category.icon}</span>
                                <span>{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* BANNER + SIDEBAR */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    <div className="lg:col-span-3">
                        <BannerSlider />
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                            <Shield className="w-8 h-8 mb-2" />
                            <h3 className="font-bold mb-1">Miễn phí vận chuyển</h3>
                            <p className="text-sm opacity-90">Đơn từ 0đ</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                            <Zap className="w-8 h-8 mb-2" />
                            <h3 className="font-bold mb-1">Flash Sale</h3>
                            <p className="text-sm opacity-90">Giảm đến 50%</p>
                        </div>
                    </div>
                </div>

                {/* KHUYẾN MÃI HOT */}
                {!searchTerm && topSelling.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
                                <TrendingUp className="w-6 h-6" />
                                SẢN PHẨM BÁN CHẠY
                            </h2>
                            {topSelling.length > 5 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                                        disabled={carouselIndex === 0}
                                        className={`p-2 rounded-full border-2 transition-all ${carouselIndex === 0
                                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                            : 'border-orange-500 text-orange-500 hover:bg-orange-50 active:scale-95'
                                            }`}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-gray-600 min-w-[60px] text-center">
                                        {carouselIndex + 1} / {Math.ceil(topSelling.length / 5)}
                                    </span>
                                    <button
                                        onClick={() => setCarouselIndex(Math.min(Math.ceil(topSelling.length / 5) - 1, carouselIndex + 1))}
                                        disabled={carouselIndex >= Math.ceil(topSelling.length / 5) - 1}
                                        className={`p-2 rounded-full border-2 transition-all ${carouselIndex >= Math.ceil(topSelling.length / 5) - 1
                                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                            : 'border-orange-500 text-orange-500 hover:bg-orange-50 active:scale-95'
                                            }`}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {topSelling.slice(carouselIndex * 5, carouselIndex * 5 + 5).map((product) => {
                                const discount = calculateDiscount(product.originalPrice, product.finalPrice);
                                return (
                                    <Link
                                        key={product.productId}
                                        href={`/shop/${product.productId}`}
                                        className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-200 hover:border-orange-500"
                                    >
                                        <div className="relative">
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {discount > 0 && (
                                                <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 text-xs font-bold">
                                                    -{discount}%
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="text-sm text-gray-800 mb-2 line-clamp-2 h-10">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-orange-500 font-bold text-sm">
                                                    {product.finalPrice.toLocaleString("vi-VN")}₫
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-xs text-gray-600">{product.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* PRODUCT HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {searchTerm ? (
                            <>
                                KẾT QUẢ TÌM KIẾM
                                <span className="text-lg font-normal text-orange-600 ml-2">
                                    "{searchTerm}"
                                </span>
                            </>
                        ) : selectedCategory === "all" ? (
                            "GỢI Ý HÔM NAY"
                        ) : (
                            categories.find(c => c.id === selectedCategory)?.name.toUpperCase()
                        )}
                    </h2>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">{filteredProducts.length} sản phẩm</span>
                        <select
                            value={sortBy}
                            onChange={handleSortChange}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500 cursor-pointer bg-white"
                        >
                            <option value="popular">Phổ biến</option>
                            <option value="latest">Mới nhất</option>
                            <option value="best-selling">Bán chạy</option>
                            <option value="price-asc">Giá thấp đến cao</option>
                            <option value="price-desc">Giá cao đến thấp</option>
                        </select>
                    </div>
                </div>

                {/* PRODUCTS GRID */}
                {isSearching ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-md">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tìm kiếm...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-md">
                        <p className="text-gray-400 text-6xl mb-4">🔍</p>
                        <p className="text-gray-500 text-xl font-medium mb-2">
                            Không tìm thấy sản phẩm nào
                        </p>
                        <p className="text-gray-400">
                            Vui lòng thử từ khóa khác hoặc xem các sản phẩm khác
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => router.push('/')}
                                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                            >
                                Xem tất cả sản phẩm
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {filteredProducts.map((product) => {
                            const discount = calculateDiscount(product.originalPrice, product.finalPrice);

                            return (
                                <Link
                                    key={product.productId}
                                    href={`/shop/${product.productId}`}
                                    className="bg-white rounded-sm shadow hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-transparent hover:border-orange-500"
                                >
                                    <div className="relative">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {discount > 0 && (
                                            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 text-xs font-bold">
                                                -{discount}%
                                            </div>
                                        )}
                                        <button
                                            className="absolute top-2 left-2 bg-white/80 hover:bg-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            <Heart className="w-4 h-4 text-orange-500" />
                                        </button>
                                        {(product.totalPurchaseCount || 0) > 1000 && (
                                            <div className="absolute bottom-0 left-0 bg-red-600 text-white px-2 py-0.5 text-xs font-bold">
                                                HOT
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3">
                                        <h3 className="text-sm text-gray-800 mb-2 line-clamp-2 h-10 group-hover:text-orange-600">
                                            {product.name}
                                        </h3>

                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <div className="flex items-center gap-1 mb-1">
                                                    <span className="text-orange-500 font-bold text-base">
                                                        {product.finalPrice.toLocaleString("vi-VN")}₫
                                                    </span>
                                                </div>
                                                {product.originalPrice > product.finalPrice && (
                                                    <span className="text-gray-400 text-xs line-through">
                                                        {product.originalPrice.toLocaleString("vi-VN")}₫
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-0.5 text-xs">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-gray-600">{product.rating}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                            <span>Đã bán {product.totalPurchaseCount}</span>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleAddToCart(product);
                                            }}
                                            className="w-full bg-orange-500 text-white py-2 rounded-sm hover:bg-orange-600 active:scale-95 transition-all duration-200 text-sm font-medium"
                                        >
                                            Thêm vào giỏ
                                        </button>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* POPUP MODAL */}
            <PopupModal
                isOpen={showPopup}
                onClose={() => setShowPopup(false)}
            />
        </div>
    );
}

// WRAP VỚI SUSPENSE
export default function HomePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-orange-500 text-xl">Đang tải...</div>
            </div>
        }>
            <HomeContent />
        </Suspense>
    );
}