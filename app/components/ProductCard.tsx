"use client";
import { useShop } from "../context/ShopContext";

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useShop();

  return (
    <div className="border p-3 rounded-lg shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col items-center">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-cover rounded-md mb-2"
      />
      <h3 className="font-medium text-center">{product.name}</h3>
      <p className="text-orange-500 font-semibold">
        {product.price.toLocaleString()}₫
      </p>
      <button
        onClick={() => addToCart(product)}
        className="bg-orange-500 text-white mt-2 py-1 px-3 rounded w-full hover:bg-orange-600"
      >
        Thêm vào giỏ
      </button>
    </div>
  );
}
