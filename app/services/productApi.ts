// ============================================
// ✅ FILE: app/services/productApi.ts (FULL CODE)
// ============================================

const API_URL = 'http://localhost:8080/api';

export interface ProductSearchResponse {
  productId: number;
  name: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  imageUrl: string | null;
  totalPurchaseCount: number | null;
  rating: number;
}

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

export interface BrandInfo {
  brandId: number;
  name: string;
  slug: string;
  logoUrl: string;
  website: string;
  description: string;
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
  brand?: BrandInfo;
  images: ImageInfo[];
  variants: VariantInfo[];
  reviews: any[];
  totalReviews: number;
}

export const productApiService = {
  /**
   * Lấy top 50 sản phẩm
   */
  async getTop50Products(): Promise<ProductSearchResponse[]> {
    const url = `${API_URL}/products/top`;
    console.log('📡 [API] Calling:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ [API] Error:', error);
      throw new Error(`Failed to fetch top products: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  /**
   * Lấy sản phẩm bán chạy
   */
  async getTopSellingProducts(): Promise<ProductSearchResponse[]> {
    const url = `${API_URL}/products/top-selling`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ [API] Error:', error);
      throw new Error(`Failed to fetch top selling: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  /**
   * Tìm kiếm sản phẩm
   */
  async searchProducts(keyword: string): Promise<ProductSearchResponse[]> {
    const url = `${API_URL}/products/search?keyword=${encodeURIComponent(keyword)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ [API] Error:', error);
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  /**
   * ✅ FIX: Lấy chi tiết sản phẩm - XỬ LÝ LỖI 500
   */
  async getProductById(id: number): Promise<ProductDetailResponse | null> {
    const url = `${API_URL}/products/id/${id}`;
    console.log('📡 [API] Calling:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ [API] Error:', error);
        console.error('❌ [API] Status:', response.status);
        return null; // ✅ Trả về null thay vì throw error
      }

      const data = await response.json();
      console.log('✅ [API] Product detail:', data);
      return data;

    } catch (error) {
      console.error('❌ [API] Exception:', error);
      return null; // ✅ Trả về null nếu có exception
    }
  },
};