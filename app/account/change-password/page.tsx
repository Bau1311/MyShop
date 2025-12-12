'use client';

import { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordPage() {
  const { user } = useShop();
  const router = useRouter();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<any>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect nếu chưa đăng nhập
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: any = {};

    // Validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Kiểm tra mật khẩu hiện tại
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      
      if (userData.password !== formData.currentPassword) {
        setErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' });
        return;
      }

      // Cập nhật mật khẩu mới
      userData.password = formData.newPassword;
      localStorage.setItem('user', JSON.stringify(userData));

      // Hiển thị thông báo thành công
      setShowSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Thông báo thành công */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ✓ Đổi mật khẩu thành công!
        </div>
      )}

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.username || user.name}</p>
                </div>
              </div>

              <nav className="mt-4 space-y-1">
                <a href="/account/profile" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Tài Khoản Của Tôi
                </a>
                
                <a href="/account/profile" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <span className="ml-8 text-sm">Hồ Sơ</span>
                </a>
                <a href="/account/change-password" className="flex items-center gap-3 px-3 py-2 text-orange-500 bg-orange-50 rounded-lg">
                  <span className="ml-8 text-sm">Đổi Mật Khẩu</span>
                </a>

                <a href="/account/orders" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Đơn Mua
                </a>

                <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Kho Voucher
                </a>
              </nav>
            </div>
          </div>

          {/* FORM ĐỔI MẬT KHẨU */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="border-b pb-4 mb-6">
                <h1 className="text-xl font-medium text-gray-800">Đổi Mật Khẩu</h1>
                <p className="text-sm text-gray-500 mt-1">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
              </div>

              <div className="max-w-xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Mật khẩu hiện tại */}
                  <div className="flex items-start">
                    <label className="w-40 text-right pr-6 text-gray-600 pt-3">Mật khẩu hiện tại</label>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                          placeholder="Nhập mật khẩu hiện tại"
                          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pr-12 ${
                            errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Mật khẩu mới */}
                  <div className="flex items-start">
                    <label className="w-40 text-right pr-6 text-gray-600 pt-3">Mật khẩu mới</label>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                          placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pr-12 ${
                            errors.newPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Xác nhận mật khẩu mới */}
                  <div className="flex items-start">
                    <label className="w-40 text-right pr-6 text-gray-600 pt-3">Xác nhận mật khẩu</label>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          placeholder="Nhập lại mật khẩu mới"
                          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pr-12 ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Nút xác nhận */}
                  <div className="flex items-center">
                    <div className="w-40"></div>
                    <div className="flex-1">
                      <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 rounded-lg font-medium transition-colors"
                      >
                        Xác nhận
                      </button>
                    </div>
                  </div>

                  {/* Gợi ý bảo mật */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6">
                    <h3 className="font-semibold text-gray-800 mb-2">💡 Gợi ý tạo mật khẩu mạnh:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Sử dụng ít nhất 6 ký tự</li>
                      <li>• Kết hợp chữ hoa, chữ thường và số</li>
                      <li>• Không sử dụng thông tin cá nhân dễ đoán</li>
                      <li>• Không chia sẻ mật khẩu cho người khác</li>
                    </ul>
                  </div>

                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}