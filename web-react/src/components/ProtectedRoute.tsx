import { Navigate } from 'react-router-dom';
import { useNguoiDung } from '../hooks/useNguoiDung';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useNguoiDung();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">Đang tải dữ liệu...</div>;
  }

  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  return <>{children}</>;
}
