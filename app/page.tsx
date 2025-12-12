// app/page.tsx
"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link"; 
import { useSearchParams, useRouter } from "next/navigation";
import { useShop } from "./context/ShopContext";
import PopupModal from "./components/PopupModal";
import BannerSlider from "./components/BannerSlider";
import { Heart, Star, TrendingUp, Zap, Shield } from "lucide-react";

interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    category: string;
    description: string;
    sold: number;
    rating: number;
    discount: number;
    location: string;
}

const categories = [
    { id: "all", name: "Tất cả", icon: "🏪" },
    { id: "clothing", name: "Quần áo", icon: "👕" },
    { id: "shoes", name: "Giày dép", icon: "👟" },
    { id: "bags", name: "Ba lô túi xách", icon: "🎒" },
    { id: "electronics", name: "Đồ điện tử", icon: "💻" },
];

const products: Product[] = [
    { 
        id: 1, 
        name: "Áo thun cotton nam nữ form rộng unisex", 
        price: 120000, 
        originalPrice: 200000,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop", 
        category: "clothing", 
        description: "Áo thun cotton mềm mịn, thoáng mát.",
        sold: 1234,
        rating: 4.8,
        discount: 40,
        location: "Hà Nội"
    },
    { 
        id: 2, 
        name: "Giày Sneaker thể thao nam nữ đế cao", 
        price: 450000, 
        originalPrice: 650000,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", 
        category: "shoes", 
        description: "Giày sneaker phong cách trẻ trung, năng động.",
        sold: 856,
        rating: 4.9,
        discount: 31,
        location: "TP. HCM"
    },
    { 
        id: 3, 
        name: "Tai nghe Bluetooth 5.0 chống ồn", 
        price: 250000, 
        originalPrice: 500000,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", 
        category: "electronics", 
        description: "Tai nghe Bluetooth pin khỏe, âm thanh sống động.",
        sold: 2341,
        rating: 4.7,
        discount: 50,
        location: "Hà Nội"
    },
    { 
        id: 4, 
        name: "Balo học sinh sinh viên chống nước", 
        price: 190000, 
        originalPrice: 350000,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", 
        category: "bags", 
        description: "Balo học sinh nhiều ngăn, nhẹ và bền.",
        sold: 678,
        rating: 4.6,
        discount: 46,
        location: "Đà Nẵng"
    },
    { 
        id: 5, 
        name: "Áo khoác dù 2 lớp nam nữ", 
        price: 350000, 
        originalPrice: 550000,
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop", 
        category: "clothing", 
        description: "Áo khoác mùa đông giữ ấm tốt, phong cách.",
        sold: 445,
        rating: 4.5,
        discount: 36,
        location: "Hà Nội"
    },
    { 
        id: 6, 
        name: "Giày thể thao chạy bộ êm chân", 
        price: 520000, 
        originalPrice: 800000,
        image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop", 
        category: "shoes", 
        description: "Giày thể thao bền đẹp, phù hợp chạy bộ.",
        sold: 912,
        rating: 4.8,
        discount: 35,
        location: "TP. HCM"
    },
    { 
        id: 7, 
        name: "Laptop văn phòng học tập", 
        price: 15000000, 
        originalPrice: 18000000,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop", 
        category: "electronics", 
        description: "Laptop hiệu năng cao, phục vụ học tập và làm việc.",
        sold: 234,
        rating: 4.9,
        discount: 17,
        location: "Hà Nội"
    },
    { 
        id: 8, 
        name: "Túi xách nữ thời trang cao cấp", 
        price: 280000, 
        originalPrice: 450000,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop", 
        category: "bags", 
        description: "Túi xách nữ thời trang, sang trọng.",
        sold: 567,
        rating: 4.7,
        discount: 38,
        location: "TP. HCM"
    },
];

// HÀM LOẠI BỎ DẤU TIẾNG VIỆT
const removeVietnameseTones = (str: string): string => {
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    return str;
};

// COMPONENT CHÍNH
function HomeContent() {
    const { addToCart } = useShop();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState("all"); 
    const [showPopup, setShowPopup] = useState(false);
    const [sortBy, setSortBy] = useState("popular");

    const searchTerm = searchParams.get('search') || '';

    useEffect(() => {
        const timer = setTimeout(() => setShowPopup(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    // FILTER VÀ SẮP XẾP SẢN PHẨM
    const filteredProducts = useMemo(() => {
        console.log("🔄 Đang sắp xếp theo:", sortBy); // DEBUG
        
        // Bước 1: Lọc theo category
        let filtered = products.filter(p => 
            selectedCategory === "all" || p.category === selectedCategory
        );

        // Bước 2: Lọc theo tìm kiếm
        if (searchTerm.trim()) {
            filtered = filtered.filter(p => {
                const productNameNormalized = removeVietnameseTones(p.name.toLowerCase());
                const searchTermNormalized = removeVietnameseTones(searchTerm.toLowerCase());
                return productNameNormalized.includes(searchTermNormalized);
            });
        }

        // Bước 3: Sắp xếp
        const sorted = [...filtered]; // Copy mảng để không thay đổi original
        
        switch (sortBy) {
            case "best-selling":
                console.log("📊 Sắp xếp: Bán chạy nhất");
                return sorted.sort((a, b) => b.sold - a.sold);
            
            case "latest":
                console.log("🆕 Sắp xếp: Mới nhất");
                return sorted.sort((a, b) => b.id - a.id);
            
            case "price-asc":
                console.log("💰 Sắp xếp: Giá thấp → cao");
                return sorted.sort((a, b) => a.price - b.price);
            
            case "price-desc":
                console.log("💎 Sắp xếp: Giá cao → thấp");
                return sorted.sort((a, b) => b.price - a.price);
            
            case "popular":
            default:
                console.log("⭐ Sắp xếp: Phổ biến (theo sold)");
                return sorted.sort((a, b) => b.sold - a.sold);
        }
    }, [selectedCategory, searchTerm, sortBy]);

    const handleAddToCart = (product: Product) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
            category: product.category,
            quantity: 1
        });
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value;
        console.log("✅ Đã chọn:", newSort);
        setSortBy(newSort);
    };

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
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                                    selectedCategory === category.id
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
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6" />
                            KHUYẾN MÃI HOT
                        </h2>
                        <span className="text-orange-600 cursor-pointer hover:text-orange-700 font-medium">
                            Xem tất cả →
                        </span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {[1,2,3,4,5,6].map((i) => (
                            <div key={i} className="text-center cursor-pointer group">
                                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-lg mb-2 group-hover:shadow-lg transition-all">
                                    <span className="text-3xl">🎁</span>
                                </div>
                                <p className="text-xs text-gray-600">Voucher {i*10}K</p>
                            </div>
                        ))}
                    </div>
                </div>

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
                {filteredProducts.length === 0 ? (
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
                        {filteredProducts.map((product) => (
                            <Link 
                                key={product.id}
                                href={`/shop/${product.id}`}
                                className="bg-white rounded-sm shadow hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-transparent hover:border-orange-500"
                            >
                                <div className="relative">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {product.discount > 0 && (
                                        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 text-xs font-bold">
                                            -{product.discount}%
                                        </div>
                                    )}
                                    <button 
                                        className="absolute top-2 left-2 bg-white/80 hover:bg-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        <Heart className="w-4 h-4 text-orange-500" />
                                    </button>
                                    {product.sold > 1000 && (
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
                                                <span className="text-orange-500 font-bold text-lg">
                                                    ₫{(product.price / 1000).toFixed(0)}k
                                                </span>
                                            </div>
                                            {product.originalPrice && (
                                                <span className="text-gray-400 text-xs line-through">
                                                    ₫{(product.originalPrice / 1000).toFixed(0)}k
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-0.5 text-xs">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-gray-600">{product.rating}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                        <span>Đã bán {product.sold}</span>
                                        <span>{product.location}</span>
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
                        ))}
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