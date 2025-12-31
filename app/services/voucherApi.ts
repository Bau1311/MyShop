const API_BASE_URL = 'http://localhost:8080/api';

export interface VoucherResponse {
    voucherId: number;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountAmount: number;
    minOrderValue: number | null;
    maxDiscount: number | null;
    startDate: string;
    endDate: string;
    userVoucherStatus: string;
    isSaved: boolean;
}

export const voucherApi = {
    async getAvailableVouchers(): Promise<VoucherResponse[]> {
        try {
            // Get userId from localStorage (same as addresses API)
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                console.error('User not logged in');
                return [];
            }

            const user = JSON.parse(userStr);
            if (!user.userId) {
                console.error('User ID not found');
                return [];
            }

            const response = await fetch(
                `${API_BASE_URL}/vouchers/available?userId=${user.userId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                console.error('Failed to fetch vouchers:', response.status);
                return [];
            }

            return response.json();
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            return [];
        }
    },
};

// Helper function to calculate voucher discount (for display only)
export function calculateVoucherDiscount(
    voucher: VoucherResponse,
    subtotal: number
): number {
    // Check min order value
    if (voucher.minOrderValue && subtotal < voucher.minOrderValue) {
        return 0;
    }

    let discount = 0;

    if (voucher.discountType === 'percentage') {
        discount = (subtotal * voucher.discountAmount) / 100;

        // Apply max discount
        if (voucher.maxDiscount && discount > voucher.maxDiscount) {
            discount = voucher.maxDiscount;
        }
    } else {
        discount = voucher.discountAmount;
    }

    // Don't exceed subtotal
    if (discount > subtotal) {
        discount = subtotal;
    }

    return discount;
}

// Helper to check if voucher is usable for current cart
export function isVoucherUsable(
    voucher: VoucherResponse,
    cartTotal: number
): boolean {
    // Check status
    if (voucher.userVoucherStatus === 'used' ||
        voucher.userVoucherStatus === 'expired' ||
        voucher.userVoucherStatus === 'UNAVAILABLE') {
        return false;
    }

    // Check min order value
    if (voucher.minOrderValue && cartTotal < voucher.minOrderValue) {
        return false;
    }

    // Check expiry
    const now = new Date();
    const endDate = new Date(voucher.endDate);
    if (endDate < now) {
        return false;
    }

    return true;
}
