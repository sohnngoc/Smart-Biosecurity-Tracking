import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DangNhap from './pages/DangNhap';
import BanDoTongQuan from './pages/BanDoTongQuan';
import { ProtectedRoute } from './components/ProtectedRoute';

import LayoutQuanTri from './pages/QuanTriTrai/Layout';
import TongQuanTrai from './pages/QuanTriTrai/TongQuanTrai';
import BanDoNoiBo from './pages/QuanTriTrai/BanDoNoiBo';
import XeRaVao from './pages/QuanTriTrai/XeRaVao';
import NguoiRaVao from './pages/QuanTriTrai/NguoiRaVao';
import ThietBi from './pages/QuanTriTrai/ThietBi';
import CanhBao from './pages/QuanTriTrai/CanhBao';
import MoPhongRuiRo from './pages/QuanTriTrai/MoPhongRuiRo';
import MoPhongIoT from './pages/QuanTriTrai/MoPhongIoT';
import BaoCaoThongMinh from './pages/QuanTriTrai/BaoCao/BaoCaoThongMinh';
import DanhGiaDinhKy from './pages/QuanTriTrai/DanhGiaDinhKy';

// Visit Request Global Pages
import DangKyVaoTrai from './pages/DangKyVaoTrai';
import DuyetVaoTrai from './pages/DuyetVaoTrai';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dang-nhap" replace />} />
        <Route path="/dang-nhap" element={<DangNhap />} />
        
        {/* Protected Routes */}
        <Route path="/ban-do-tong-quan" element={
          <ProtectedRoute>
            <BanDoTongQuan />
          </ProtectedRoute>
        } />
        
        {/* Farm Admin Routes */}
        <Route path="/trai/:farmCode" element={
          <ProtectedRoute>
            <LayoutQuanTri />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="tong-quan" replace />} />
          <Route path="tong-quan" element={<TongQuanTrai />} />
          <Route path="ban-do-noi-bo" element={<BanDoNoiBo />} />
          <Route path="xe-ra-vao" element={<XeRaVao />} />
          <Route path="nguoi-ra-vao" element={<NguoiRaVao />} />
          <Route path="thiet-bi" element={<ThietBi />} />
          <Route path="canh-bao" element={<CanhBao />} />
          <Route path="mo-phong-rui-ro" element={<MoPhongRuiRo />} />
          <Route path="mo-phong-iot" element={<MoPhongIoT />} />
          <Route path="bao-cao-thong-minh" element={<BaoCaoThongMinh />} />
          <Route path="danh-gia-dinh-ky" element={<DanhGiaDinhKy />} />
          <Route path="dang-ky-vao-trai" element={<DangKyVaoTrai />} />
          <Route path="duyet-vao-trai" element={<DuyetVaoTrai />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
