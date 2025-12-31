// ==================== CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:8080'; // ⭐ HARD-CODE để test

console.log('🔧 Admin API Base URL:', API_BASE_URL);

// ==================== HELPER FUNCTION ====================
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    console.log('📤 Fetching:', url);

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        console.log('📥 Response:', response.status, url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', {
                url,
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return null;
        }

        const data = await response.json();
        console.log('✅ Data received:', url);
        return data;
    } catch (error) {
        console.error('❌ Fetch Error:', error);
        throw error;
    }
}

// ==================== DASHBOARD APIs ====================
export const getDashboardStats = async (period: 'day' | 'month' | 'year' = 'month') => {
    return fetchAPI(`/api/admin/dashboard/stats?period=${period}`);
};

export const getRevenueChartData = async (period: 'day' | 'month' | 'year' = 'month') => {
    return fetchAPI(`/api/admin/dashboard/revenue-chart?period=${period}`);
};

// ==================== USER MANAGEMENT APIs ====================
export const getUsers = async (page = 0, size = 20, search?: string, status?: string) => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(search && { search }),
        ...(status && { status }),
    });

    return fetchAPI(`/api/admin/users?${params}`);
};

export const getUserDetail = async (userId: number) => {
    return fetchAPI(`/api/admin/users/${userId}`);
};

export const updateUserStatus = async (userId: number, status: string) => {
    return fetchAPI(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

// ==================== ORDER MANAGEMENT APIs ====================
export const getOrders = async (page = 0, size = 20, status?: string, search?: string) => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(status && { status }),
        ...(search && { search }),
    });

    return fetchAPI(`/api/admin/orders?${params}`);
};

export const getOrderDetail = async (orderId: number) => {
    return fetchAPI(`/api/admin/orders/${orderId}`);
};

export const updateOrderStatus = async (orderId: number, status: string) => {
    console.log('🔄 Updating order status:', orderId, status);
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Backend returns empty body - don't try to parse JSON
    return { success: true };
};

// ==================== VOUCHER MANAGEMENT APIs ====================
export const getVouchers = async (page = 0, size = 20, status?: string) => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(status && { status }),
    });

    return fetchAPI(`/api/admin/vouchers?${params}`);
};

export const createVoucher = async (data: any) => {
    return fetchAPI('/api/admin/vouchers', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateVoucher = async (voucherId: number, data: any) => {
    return fetchAPI(`/api/admin/vouchers/${voucherId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const deleteVoucher = async (voucherId: number) => {
    return fetchAPI(`/api/admin/vouchers/${voucherId}`, {
        method: 'DELETE',
    });
};

export const toggleVoucher = async (voucherId: number) => {
    return fetchAPI(`/api/admin/vouchers/${voucherId}/toggle`, {
        method: 'PUT',
    });
};

// ==================== PRODUCT MANAGEMENT APIs ====================
export const getProducts = async (page = 0, size = 100, search?: string) => {
    try {
        let data;

        if (search && search.trim() !== '') {
            // Search products
            data = await fetchAPI(`/api/products/search?keyword=${encodeURIComponent(search.trim())}`);
        } else {
            // Get top products
            data = await fetchAPI('/api/products/top');
        }

        // Format response to match pagination format
        const products = Array.isArray(data) ? data : [];

        return {
            content: products,
            totalPages: 1,
            totalElements: products.length,
            number: page,
            size: size
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            content: [],
            totalPages: 0,
            totalElements: 0,
            number: 0,
            size: size
        };
    }
};

export const deleteProduct = async (productId: number) => {
    return fetchAPI(`/api/products/id/${productId}`, {
        method: 'DELETE',
    });
};

// ==================== EXPORT DEFAULT ====================
const adminApi = {
    // Dashboard
    getDashboardStats,
    getRevenueChartData,

    // Users
    getUsers,
    getUserDetail,
    updateUserStatus,

    // Orders
    getOrders,
    getOrderDetail,
    updateOrderStatus,

    // Vouchers
    getVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    toggleVoucher,

    // Products
    getProducts,
    deleteProduct,
};

export default adminApi;