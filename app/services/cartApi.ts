// API Base URL
const API_URL = 'http://localhost:8080/api';

// ==================== TYPES ====================

export interface VariantItem {
    variantId: number;
    quantity: number;
    priceSnapshot: number; // Price from cart
}

export interface AddressResponse {
    addressId: number;
    recipientName: string;
    phone: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
}

export interface PaymentMethod {
    code: string;
    name: string;
}

export interface ShippingMethod {
    id: number;
    name: string;
    baseFee: number;
    estimatedDays: number;
}

export interface CheckoutItemResponse {
    variantId: number;
    productId: number;
    productName: string;
    imageUrl?: string;
    attributesJson: string;
    quantity: number;
    price: number;
    lineTotal: number;
}

export interface CheckoutResponse {
    items: CheckoutItemResponse[];
    totalAmount: number;
    shippingFee: number;
    voucherDiscountAmount: number;
    finalTotalAmount: number;
    addressList: AddressResponse[];
    paymentMethods: PaymentMethod[];
    shippingMethods: ShippingMethod[];
}

export interface CalculateTotalRequest {
    variants: VariantItem[];
    shippingMethodId?: number;
    voucherCode?: string;
}

export interface CalculateTotalResponse {
    totalAmount: number;
    shippingFee: number;
    voucherDiscountAmount: number;
    finalTotalAmount: number;
}

export interface AddressRequest {
    recipientName: string;
    phone: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
}

export interface OrderItem {
    variantId: number;
    quantity: number;
    price: number;
}

export interface OrderCreateRequest {
    userId: number;
    paymentMethod: string;
    note: string;
    addressId: number;  // Backend expects addressId, not addressRequest
    items: OrderItem[];
    voucherCode?: string;
    shippingMethodId?: number;
}

export interface OrderCreateResponse {
    orderId: number;
    status: string;
    message: string;
}

// ==================== API SERVICE ====================

export const orderApi = {
    /**
     * Get checkout information including items, addresses, payment methods, etc.
     */
    async getCheckoutInfo(userId: number, request: { variants: VariantItem[] }): Promise<CheckoutResponse> {
        // Fetch real addresses from API
        let addressList: AddressResponse[] = [];
        try {
            const addressResponse = await fetch(`${API_URL}/addresses?userId=${userId}`);
            if (addressResponse.ok) {
                addressList = await addressResponse.json();
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }

        const paymentMethods: PaymentMethod[] = [
            { code: 'COD', name: 'Thanh toán khi nhận hàng' },
            { code: 'BANKING', name: 'Chuyển khoản ngân hàng' },
        ];

        const shippingMethods: ShippingMethod[] = [
            { id: 1, name: 'Giao hàng tiêu chuẩn', baseFee: 30000, estimatedDays: 3 },
            { id: 2, name: 'Giao hàng nhanh', baseFee: 50000, estimatedDays: 1 },
        ];

        return {
            items: [],
            totalAmount: 0,
            shippingFee: 30000,
            voucherDiscountAmount: 0,
            finalTotalAmount: 0,
            addressList,
            paymentMethods,
            shippingMethods,
        };
    },

    /**
     * Calculate total amount with shipping and voucher
     */
    async calculateTotal(request: CalculateTotalRequest): Promise<CalculateTotalResponse> {
        try {
            // Get userId from localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                throw new Error('User not logged in');
            }
            const user = JSON.parse(userStr);

            const requestBody = {
                variants: request.variants,
                shippingMethodId: request.shippingMethodId || null,
                voucherCode: request.voucherCode || null,
                paymentMethodCode: null,
            };

            // Call backend select-shipping endpoint
            const response = await fetch(`${API_URL}/checkout/select-shipping?userId=${user.userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Backend error:', errorText);
                throw new Error('Failed to calculate total');
            }

            const data = await response.json();

            return {
                totalAmount: data.subtotal || 0,
                shippingFee: data.shippingFee || 0,
                voucherDiscountAmount: data.orderDiscount || 0,
                finalTotalAmount: data.finalTotal || 0,
            };
        } catch (error) {
            console.error('Error calculating total:', error);
            // Return fallback values
            const shippingFee = request.shippingMethodId === 2 ? 50000 : 30000;
            return {
                totalAmount: 0,
                shippingFee,
                voucherDiscountAmount: 0,
                finalTotalAmount: shippingFee,
            };
        }
    },

    /**
     * Create a new order
     */
    async createOrder(request: OrderCreateRequest): Promise<OrderCreateResponse> {
        try {
            const response = await fetch(`${API_URL}/orders/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to create order');
            }

            return await response.json();
        } catch (error: any) {
            console.error('❌ Error creating order:', error);
            throw error;
        }
    },

    /**
     * Get all orders for a user
     */
    async getUserOrders(userId: number): Promise<any[]> {
        try {
            const response = await fetch(`${API_URL}/orders/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to fetch orders');
            }

            return await response.json();
        } catch (error: any) {
            console.error('❌ Error fetching orders:', error);
            throw error;
        }
    },
};