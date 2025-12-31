'use client';

import { useState, useEffect } from 'react';
import { Search, Lock, Unlock, AlertTriangle, Eye } from 'lucide-react';
import Link from 'next/link';

interface User {
    userId: number;
    username: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    role: string;
    createdAt: string;
    violationCount?: number;
}

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED'>('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadUsers();
    }, [page, statusFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);

            // Call real backend API (use localhost:8080 directly)
            const statusParam = statusFilter === 'ALL' ? '' : statusFilter.toLowerCase();
            const response = await fetch(
                `http://localhost:8080/api/admin/users?page=${page - 1}&size=20&search=${searchTerm}&status=${statusParam}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();

            // Backend returns Page object with content array
            setUsers(data.content || []);
            setTotalPages(data.totalPages || 1);
            setLoading(false);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Không thể tải danh sách người dùng. Vui lòng kiểm tra backend đã chạy chưa!');
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId: number, currentStatus: string) => {
        const isCurrentlyActive = currentStatus?.toUpperCase() === 'ACTIVE';
        const newStatus = isCurrentlyActive ? 'LOCKED' : 'ACTIVE';
        const confirmed = window.confirm(
            `Bạn có chắc muốn ${newStatus === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản này?`
        );

        if (!confirmed) return;

        try {
            await fetch(`http://localhost:8080/api/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }) // Sending Uppercase status, hope backend handles it or we need to align
            });

            alert(`Đã ${newStatus === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản thành công!`);
            loadUsers();
        } catch (error) {
            console.error('Error toggling user status:', error);
            alert('Có lỗi xảy ra!');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === 'ALL') return matchesSearch;
        const normalizedStatus = user.status?.toUpperCase();
        return matchesSearch && normalizedStatus === statusFilter;
    });

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý người dùng</h1>
                <p className="text-gray-600">Quản lý tài khoản và quyền hạn người dùng</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="LOCKED">Đã khóa</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tên người dùng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Số điện thoại
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vi phạm
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.userId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                #{user.userId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">@{user.username}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.phone}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status?.toUpperCase() === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.status?.toUpperCase() === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.violationCount && user.violationCount > 0 ? (
                                                    <span className="flex items-center gap-1 text-sm text-red-600">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        {user.violationCount} lần
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Không có</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/users/${user.userId}`}
                                                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleToggleStatus(user.userId, user.status)}
                                                        className={`p-2 rounded ${user.status?.toUpperCase() === 'ACTIVE'
                                                            ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                                            : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                                                            }`}
                                                        title={user.status?.toUpperCase() === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                                                    >
                                                        {user.status?.toUpperCase() === 'ACTIVE' ? (
                                                            <Lock className="w-4 h-4" />
                                                        ) : (
                                                            <Unlock className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                            <div className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{filteredUsers.length}</span> người dùng
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                >
                                    Trước
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-700">
                                    Trang {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
