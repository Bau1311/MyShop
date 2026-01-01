'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import adminApi from '../../../services/adminApi';

interface Category {
    categoryId: number;
    name: string;
}

interface Brand {
    brandId: number;
    name: string;
}

interface ImagePreview {
    url: string;
    file?: File;
}

interface Variant {
    sku: string;
    quantity: number;
    attributesJson: string;
    priceOverride?: number;
}

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        brandId: '',
        status: 'ACTIVE',
    });

    const [images, setImages] = useState<ImagePreview[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);

    useEffect(() => {
        loadDropdownData();
    }, []);

    const loadDropdownData = async () => {
        try {
            const [categoriesData, brandsData] = await Promise.all([
                adminApi.getCategories(),
                adminApi.getBrands(),
            ]);
            setCategories(categoriesData || []);
            setBrands(brandsData || []);
        } catch (error) {
            console.error('Error loading dropdown data:', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                // Create preview
                const previewUrl = URL.createObjectURL(file);

                // Upload to server
                const response = await adminApi.uploadProductImage(file);

                return {
                    url: response.imageUrl,
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);
            setImages([...images, ...uploadedImages]);
        } catch (error: any) {
            alert('Lỗi upload ảnh: ' + (error.message || 'Vui lòng thử lại'));
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const addVariant = () => {
        setVariants([
            ...variants,
            { sku: '', quantity: 0, attributesJson: '{}', priceOverride: undefined },
        ]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof Variant, value: any) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.categoryId) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        setLoading(true);
        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                categoryId: parseInt(formData.categoryId),
                brandId: formData.brandId ? parseInt(formData.brandId) : null,
                status: formData.status,
                imageUrls: images.map((img) => img.url),
                variants: variants.length > 0 ? variants : null,
            };

            await adminApi.createProduct(productData);
            alert('Tạo sản phẩm thành công!');
            router.push('/admin/products');
        } catch (error: any) {
            console.error('Error creating product:', error);
            alert('Lỗi: ' + (error.message || 'Không thể tạo sản phẩm'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên sản phẩm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                    min="0"
                                    step="1000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="ACTIVE">Đang bán</option>
                                    <option value="INACTIVE">Ngừng bán</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Danh mục <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.categoryId} value={cat.categoryId}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thương hiệu
                                </label>
                                <select
                                    value={formData.brandId}
                                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">-- Không chọn --</option>
                                    {brands.map((brand) => (
                                        <option key={brand.brandId} value={brand.brandId}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Hình ảnh sản phẩm</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block w-full cursor-pointer">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600">
                                        {uploading ? 'Đang tải lên...' : 'Click để chọn ảnh'}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Hỗ trợ: JPG, PNG (tối đa 5MB)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        {images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={img.url}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        {index === 0 && (
                                            <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                                                Ảnh chính
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Variants (Optional) */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Biến thể (Tùy chọn)</h2>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm biến thể
                        </button>
                    </div>

                    {variants.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                            Chưa có biến thể nào. Click "Thêm biến thể" để thêm.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {variants.map((variant, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-medium">Biến thể #{index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">SKU</label>
                                            <input
                                                type="text"
                                                value={variant.sku}
                                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Số lượng</label>
                                            <input
                                                type="number"
                                                value={variant.quantity}
                                                onChange={(e) => updateVariant(index, 'quantity', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Thuộc tính (JSON)</label>
                                            <input
                                                type="text"
                                                value={variant.attributesJson}
                                                onChange={(e) => updateVariant(index, 'attributesJson', e.target.value)}
                                                placeholder='{"color":"Red"}'
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Giá ghi đè</label>
                                            <input
                                                type="number"
                                                value={variant.priceOverride || ''}
                                                onChange={(e) => updateVariant(index, 'priceOverride', e.target.value ? parseFloat(e.target.value) : undefined)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                min="0"
                                                step="1000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
                    </button>
                    <Link
                        href="/admin/products"
                        className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-center"
                    >
                        Hủy
                    </Link>
                </div>
            </form>
        </div>
    );
}
