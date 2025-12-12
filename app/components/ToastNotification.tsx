// app/components/ToastNotification.tsx
import React, { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

// Định nghĩa kiểu dữ liệu (Interface) cho props
interface ToastProps {
  message: string | null;
  onClose: () => void; // Hàm đóng không nhận tham số và không trả về gì
}

const ToastNotification: React.FC<ToastProps> = ({ message, onClose }) => {
  // useEffect để quản lý việc tự động đóng thông báo
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Tự động đóng sau 3 giây

      // Cleanup function: Xóa timer nếu component unmount hoặc message thay đổi
      return () => clearTimeout(timer);
    }
  }, [message, onClose]); // Chỉ chạy lại khi message hoặc onClose thay đổi

  if (!message) return null;

  return (
    <div className="fixed top-5 right-5 z-50 p-4 rounded-lg shadow-xl bg-green-500 text-white flex items-center gap-3 transition-all duration-300 animate-slideIn">
      <CheckCircle className="w-6 h-6 flex-shrink-0" />
      <p className="font-medium">{message}</p>
      <button 
        onClick={onClose}
        className="ml-4 p-1 rounded-full hover:bg-green-600 transition flex-shrink-0"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Tailwind animation class (Bạn cần đảm bảo keyframes 'slideIn' được định nghĩa trong CSS toàn cục) */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ToastNotification;