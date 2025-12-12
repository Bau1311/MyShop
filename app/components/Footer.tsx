export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Về chúng tôi */}
          <div>
            <h3 className="text-lg font-bold mb-4">Về MyShop</h3>
            <p className="text-gray-300 text-sm">
              Clone của Shopee được xây dựng bằng Next.js, React và Tailwind CSS.
            </p>
          </div>

          {/* Liên kết */}
          <div>
            <h3 className="text-lg font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="/" className="hover:text-orange-400 transition">Trang chủ</a></li>
              <li><a href="/cart" className="hover:text-orange-400 transition">Giỏ hàng</a></li>
              <li><a href="/login" className="hover:text-orange-400 transition">Đăng nhập</a></li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="text-lg font-bold mb-4">Liên hệ</h3>
            <p className="text-gray-300 text-sm">
              📧 Email: support@myshop.com<br/>
              📞 Hotline: 1900-xxxx
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          © 2025 MyShop Clone. Made with ❤️ using Next.js
        </div>
      </div>
    </footer>
  );
}