"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// ✅ ĐÚNG API URL
const API_BASE_URL = 'http://localhost:8080/api';

// ==================== TYPES ====================
export interface VariantInfo {
  variantId: number;
  sku: string;
  quantity: number;
  attributesJson: string;
  priceOverride: number | null;
  status: string;
  createdAt: string;
}

export interface ImageInfo {
  imageId: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductDetailResponse {
  productId: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  images: ImageInfo[];
  variants: VariantInfo[];
  reviews: any[];
  totalReviews: number;
}

export interface CartItemResponse {
  itemId: number;
  variantId: number;
  productId: number;
  productName: string;
  attributesJson: string;
  quantity: number;
  priceSnapshot: number;
  discountSnapshot: number;
  finalPrice: number;
  lineTotal: number;
}

export interface CartDetailResponse {
  cartId: number;
  userId: number;
  sessionId: string;
  isActive: boolean;
  currency: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  items: CartItemResponse[];
  totalAmount: number;
}

// ==================== SHOP CONTEXT TYPES ====================
type Product = {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity?: number;
  variantId?: number;
  selectedVariant?: VariantInfo;
};

type CartItem = {
  itemId: number;
  variantId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  attributesJson: string;
  lineTotal: number;
  image?: string;
};

type User = {
  userId?: number;
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  avatar?: string | null;
  role?: string;
  status?: string;
};

type Order = {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  items: CartItem[];
  totalAmount: number;
  customerInfo: any;
  paymentMethod: 'cod' | 'banking';
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
};

interface ShopContextProps {
  user: User | null;
  setUser: (u: User | null) => void;
  cart: CartItem[];
  addToCart: (p: Product) => Promise<void>;
  removeFromCart: (variantId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  updateQuantity: (variantId: number, quantity: number) => Promise<void>;
  decreaseQuantity: (variantId: number) => Promise<void>;
  isInitialized: boolean;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  buyNowItem: CartItem | null;
  setBuyNowItem: (item: CartItem | null) => void;
  loadCartFromAPI: () => Promise<void>;
  getProductById: (id: number) => Promise<ProductDetailResponse | null>;
  selectedCartItems: Set<number>;
  setSelectedCartItems: (items: Set<number>) => void;
}

const ShopContext = createContext<ShopContextProps | undefined>(undefined);

export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [selectedCartItems, setSelectedCartItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedUser = localStorage.getItem("user");
    const savedOrders = localStorage.getItem("orders");

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch {
        localStorage.removeItem("user");
      }
    }

    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch {
        localStorage.removeItem("orders");
      }
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (user?.userId) {
      loadCartFromAPI();
    } else {
      setCart([]);
    }
  }, [user?.userId]);

  useEffect(() => {
    if (!isInitialized) return;
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (orders.length > 0) localStorage.setItem("orders", JSON.stringify(orders));
    else localStorage.removeItem("orders");
  }, [orders, isInitialized]);

  const loadCartFromAPI = async () => {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load cart');
      }

      const data: CartDetailResponse = await response.json();

      const cartItems: CartItem[] = data.items.map(item => ({
        itemId: item.itemId,
        variantId: item.variantId,
        productId: item.productId,
        productName: item.productName,
        price: item.priceSnapshot,
        quantity: item.quantity,
        attributesJson: item.attributesJson,
        lineTotal: item.priceSnapshot * item.quantity, // Recalculate to ensure accuracy
      }));

      setCart(cartItems);
    } catch (error) {
      console.error("❌ Lỗi khi load giỏ hàng:", error);
    }
  };

  const addToCart = async (product: Product) => {
    if (!user) {
      if (typeof window !== "undefined") {
        const confirm = window.confirm(
          "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Đăng nhập ngay?"
        );
        if (confirm) window.location.href = "/login";
      }
      return;
    }

    const cartId = localStorage.getItem('cartId');

    if (!cartId) {
      alert("Không tìm thấy giỏ hàng. Vui lòng đăng nhập lại!");
      return;
    }

    if (!product.variantId) {
      alert("Vui lòng chọn phiên bản sản phẩm");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${cartId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId: product.variantId,
          quantity: product.quantity || 1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AddToCart] Error:', errorText);
        throw new Error(errorText || 'Không thể thêm vào giỏ hàng');
      }

      const data: CartDetailResponse = await response.json();

      const cartItems: CartItem[] = data.items.map(item => ({
        itemId: item.itemId,
        variantId: item.variantId,
        productId: item.productId,
        productName: item.productName,
        price: item.priceSnapshot,
        quantity: item.quantity,
        attributesJson: item.attributesJson,
        lineTotal: item.lineTotal,
      }));

      setCart(cartItems);

      if (typeof window !== "undefined") {
        alert("Đã thêm vào giỏ hàng!");
      }
    } catch (error: any) {
      console.error("❌ [AddToCart] Exception:", error);
      alert(error.message || "Không thể thêm vào giỏ hàng");
    }
  };

  const updateQuantity = async (variantId: number, quantity: number) => {
    if (quantity < 1) return;

    try {
      // Update cart locally - calculate lineTotal with current price
      setCart(prevCart =>
        prevCart.map(item =>
          item.variantId === variantId
            ? { ...item, quantity, lineTotal: item.price * quantity }
            : item
        )
      );
    } catch (error: any) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      alert(error.message || "Không thể cập nhật số lượng");
    }
  };

  const decreaseQuantity = async (variantId: number) => {
    const item = cart.find((i) => i.variantId === variantId);
    if (!item) return;

    if (item.quantity <= 1) {
      await removeFromCart(variantId);
    } else {
      await updateQuantity(variantId, item.quantity - 1);
    }
  };

  const removeFromCart = async (variantId: number) => {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${cartId}/remove/${variantId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa sản phẩm');
      }

      await loadCartFromAPI();
    } catch (error: any) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      alert(error.message || "Không thể xóa sản phẩm");
    }
  };

  const clearCart = async () => {
    setCart([]);
  };
  const getProductById = async (id: number): Promise<ProductDetailResponse | null> => {
    const { productApiService } = await import('@/app/services/productApi');
    return productApiService.getProductById(id);
  };

  return (
    <ShopContext.Provider
      value={{
        user,
        setUser,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        decreaseQuantity,
        isInitialized,
        orders,
        setOrders,
        selectedProduct,
        setSelectedProduct,
        buyNowItem,
        setBuyNowItem,
        loadCartFromAPI,
        getProductById,
        selectedCartItems,
        setSelectedCartItems,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within a ShopProvider");
  return ctx;
};