'use client';

import { useState, useEffect, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { useRouter } from 'next/navigation';
import AccountSidebar from '../../components/AccountSidebar';

export default function ProfilePage() {
  const { user, setUser } = useShop();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    birthday: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [isEditing, setIsEditing] = useState({
    phone: false,
    birthday: false,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setFormData({
        username: user.username || user.email?.split('@')[0] || 'user',
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || 'male',
        birthday: user.birthday || '',
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user, router]);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên';
    }

    if (isEditing.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Số điện thoại phải có 10 chữ số';
      }
    }

    if (isEditing.birthday && formData.birthday) {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 120) {
        newErrors.birthday = 'Ngày sinh không hợp lệ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('Kích thước file phải nhỏ hơn 1MB');
        return;
      }

      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Chỉ chấp nhận file .JPEG hoặc .PNG');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Update user in context
    setUser({
      ...user,
      ...formData,
      avatar: avatarPreview,
    });

    setIsEditing({
      phone: false,
      birthday: false,
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ✓ Đã lưu thông tin thành công!
        </div>
      )}

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* SIDEBAR - SỬ DỤNG COMPONENT MỚI */}
          <div className="lg:col-span-1">
            <AccountSidebar user={user} avatarPreview={avatarPreview} />
          </div>

          {/* NỘI DUNG CHÍNH */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="border-b pb-4 mb-6">
                <h1 className="text-xl font-medium text-gray-800">Hồ Sơ Của Tôi</h1>
                <p className="text-sm text-gray-500 mt-1">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM */}
                <div className="lg:col-span-2">
                  <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="flex items-start">
                      <label className="w-32 text-right pr-6 text-gray-600 pt-2">Tên đăng nhập</label>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.username}
                          disabled
                          className="w-full px-4 py-2 bg-gray-50 text-gray-500 rounded cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex items-start">
                      <label className="w-32 text-right pr-6 text-gray-600 pt-2">Tên</label>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <label className="w-32 text-right pr-6 text-gray-600 pt-2">Email</label>
                      <div className="flex-1">
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full px-4 py-2 bg-gray-50 text-gray-500 rounded cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <label className="w-32 text-right pr-6 text-gray-600 pt-2">Số điện thoại</label>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={!isEditing.phone}
                            className={`flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 ${isEditing.phone ? 'border-gray-300' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                              } ${errors.phone ? 'border-red-500' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => setIsEditing({ ...isEditing, phone: !isEditing.phone })}
                            className="text-blue-600 hover:text-blue-700 text-sm whitespace-nowrap font-medium"
                          >
                            {isEditing.phone ? 'Hủy' : 'Thay Đổi'}
                          </button>
                        </div>
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <label className="w-32 text-right pr-6 text-gray-600">Giới tính</label>
                      <div className="flex-1 flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={formData.gender === 'male'}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-gray-700">Nam</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={formData.gender === 'female'}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-gray-700">Nữ</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="other"
                            checked={formData.gender === 'other'}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-gray-700">Khác</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <label className="w-32 text-right pr-6 text-gray-600 pt-2">Ngày sinh</label>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={formData.birthday}
                            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                            disabled={!isEditing.birthday}
                            className={`flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 ${isEditing.birthday ? 'border-gray-300' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                              } ${errors.birthday ? 'border-red-500' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => setIsEditing({ ...isEditing, birthday: !isEditing.birthday })}
                            className="text-blue-600 hover:text-blue-700 text-sm whitespace-nowrap font-medium"
                          >
                            {isEditing.birthday ? 'Hủy' : 'Thay Đổi'}
                          </button>
                        </div>
                        {errors.birthday && <p className="text-red-500 text-sm mt-1">{errors.birthday}</p>}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-32"></div>
                      <div className="flex-1">
                        <button
                          type="submit"
                          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 rounded font-medium transition-colors"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>

                  </form>
                </div>

                {/* AVATAR */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center border-l pl-8">
                  <div className="w-32 h-32 rounded-full bg-purple-200 flex items-center justify-center overflow-hidden mb-4 border-4 border-white shadow-lg">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl">👤</span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded text-sm transition-colors"
                  >
                    Chọn Ảnh
                  </button>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Dung lượng file tối đa 1 MB<br />
                    Định dạng: .JPEG, .PNG
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}