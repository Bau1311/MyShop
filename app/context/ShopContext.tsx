"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  description?: string;
  quantity?: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  category?: string;
  colors?: string[];
  sizes?: string[];
};

type CartItem = {
  id: number;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  description?: string;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  category?: string;
  colors?: string[];
  sizes?: string[];
};

type User = {
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  avatar?: string | null;
};

type Order = {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipping" | "completed" | "cancelled";
  items: CartItem[];
  totalAmount: number;
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    note?: string;
  };
  paymentMethod: "cod" | "banking";
};

interface ShopContextProps {
  user: User | null;
  setUser: (u: User | null) => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  cart: CartItem[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: number, color?: string | null, size?: string | null) => void;
  clearCart: () => void;
  updateQuantity: (id: number, quantity: number, color?: string | null, size?: string | null) => void;
  decreaseQuantity: (id: number, color?: string | null, size?: string | null) => void;
  isInitialized: boolean;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Omit<Order, "id" | "orderNumber" | "date">) => string;
  getOrderById: (id: string) => Order | undefined;
  cancelOrder: (id: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  products: Product[];
  buyNowItem: CartItem | null;
  setBuyNowItem: (item: CartItem | null) => void;
}

const ShopContext = createContext<ShopContextProps | undefined>(undefined);

export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  const [products] = useState<Product[]>([
    {
      id: 1,
      name: "Áo thun",
      price: 120000,
      image: "/images/banner1.jpg",
      description: "Áo thun cotton thoáng mát, dễ phối đồ.",
    },
    {
      id: 2,
      name: "Giày Sneaker",
      price: 450000,
      image: "/images/banner2.jpg",
      description: "Giày thể thao năng động, mang êm chân.",
    },
    {
      id: 3,
      name: "Tai nghe Bluetooth",
      price: 250000,
      image: "/images/banner3.jpg",
      description: "Tai nghe không dây, pin lâu, âm thanh rõ nét.",
    },
    {
      id: 4,
      name: "Balo học sinh",
      price: 190000,
      image: "/images/banner1.jpg",
      description: "Balo chống nước, nhiều ngăn tiện lợi.",
    },
    {
      id: 5,
      name: "Áo khoác",
      price: 350000,
      image: "/images/banner2.jpg",
      description: "Áo khoác giữ ấm, phù hợp cả đi học và đi chơi.",
    },
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedUser = localStorage.getItem("user");
    const savedCart = localStorage.getItem("cart");
    const savedOrders = localStorage.getItem("orders");
    const savedSelected = localStorage.getItem("selectedProduct");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem("cart");
      }
    }

    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch {
        localStorage.removeItem("orders");
      }
    }

    if (savedSelected) {
      try {
        setSelectedProduct(JSON.parse(savedSelected));
      } catch {
        localStorage.removeItem("selectedProduct");
      }
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    if (selectedProduct)
      localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
    else localStorage.removeItem("selectedProduct");
  }, [selectedProduct, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (cart.length > 0) localStorage.setItem("cart", JSON.stringify(cart));
    else localStorage.removeItem("cart");
  }, [cart, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (orders.length > 0) localStorage.setItem("orders", JSON.stringify(orders));
    else localStorage.removeItem("orders");
  }, [orders, isInitialized]);

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setUser((prev) => (prev ? { ...prev, ...userData } : null));
      return true;
    } catch {
      return false;
    }
  };

  const addToCart = (product: Product) => {
    if (!user) {
      if (typeof window !== "undefined") {
        const confirm = window.confirm(
          "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Đăng nhập ngay?"
        );
        if (confirm) window.location.href = "/login";
      }
      return;
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          item.selectedColor === product.selectedColor &&
          item.selectedSize === product.selectedSize
      );

      let newCart;
      if (existing) {
        newCart = prev.map((item) =>
          item.id === product.id &&
          item.selectedColor === product.selectedColor &&
          item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        newCart = [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            images: product.images,
            description: product.description,
            quantity: product.quantity || 1,
            selectedColor: product.selectedColor,
            selectedSize: product.selectedSize,
            category: product.category,
            colors: product.colors,
            sizes: product.sizes,
          },
        ];
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(newCart));
      }

      return newCart;
    });
  };

  const updateQuantity = (id: number, quantity: number, color?: string | null, size?: string | null) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id &&
        item.selectedColor === color &&
        item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const decreaseQuantity = (id: number, color?: string | null, size?: string | null) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id &&
          item.selectedColor === color &&
          item.selectedSize === size
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number, color?: string | null, size?: string | null) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            item.selectedColor === color &&
            item.selectedSize === size
          )
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const addOrder = (orderData: Omit<Order, "id" | "orderNumber" | "date">): string => {
    const orderId = `ORD${Date.now()}`;
    const orderNumber = `#${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      orderNumber,
      date: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return orderId;
  };

  const getOrderById = (id: string): Order | undefined =>
    orders.find((order) => order.id === id);

  const cancelOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: "cancelled" } : order
      )
    );
  };

  return (
    <ShopContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        decreaseQuantity,
        isInitialized,
        orders,
        setOrders,
        addOrder,
        getOrderById,
        cancelOrder,
        selectedProduct,
        setSelectedProduct,
        products,
        buyNowItem,
        setBuyNowItem,
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