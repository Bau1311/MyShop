'use client';

import { useEffect, useState } from 'react';

interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PopupModal({ isOpen, onClose }: PopupModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isOpen);
  }, [isOpen]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Popup Container */}
      <div 
        className={`relative w-[90%] max-w-[600px] bg-gradient-to-br from-purple-500 via-purple-600 to-pink-400 rounded-3xl p-10 text-center shadow-2xl transform transition-transform duration-300 ${
          show ? 'scale-100' : 'scale-75'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
        >
          <span className="text-2xl text-gray-600">×</span>
        </button>

        {/* Logo */}
        <div className="mb-6">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <svg 
              className="w-16 h-16 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-.93-7-5.06-7-9V8.3l7-3.5 7 3.5V11c0 3.94-3.14 8.07-7 9z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
          KHUYẾN MÃI LỚN NHẤT THÁNG 11
        </h2>
        
        {/* Subtitle */}
        <p className="text-white/90 text-lg mb-8 drop-shadow">
          Từ 26.10 - 25.11
        </p>

        {/* Offers Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Free Ship */}
          <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg">
            <div className="text-sm text-gray-600 mb-1">FREESHIP</div>
            <div className="text-3xl font-bold text-orange-500">35,000</div>
            <div className="text-xs text-gray-500">ĐỒNG</div>
          </div>

          {/* Voucher */}
          <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg">
            <div className="text-sm text-gray-600 mb-1">VOUCHER TỚI</div>
            <div className="text-3xl font-bold text-blue-500">4,300</div>
            <div className="text-xs text-gray-500">ĐỒNG</div>
          </div>

          {/* Discount */}
          <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg">
            <div className="text-sm text-gray-600 mb-1">GIẢM</div>
            <div className="text-3xl font-bold text-red-500">45%</div>
            <div className="text-xs text-gray-500 invisible">.</div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="bg-white text-purple-600 font-bold text-lg px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg hover:scale-105 transform duration-200"
        >
          Mua Sắm Ngay
        </button>

        {/* Fine Print */}
        <p className="text-white/70 text-xs mt-6">
          * Áp dụng cho đơn hàng từ 0đ. Chi tiết xem tại Kênh Khuyến Mãi
        </p>
      </div>
    </div>
  );
}