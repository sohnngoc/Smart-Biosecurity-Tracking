import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  vi: {
    translation: {
      login_title: "Hệ Thống Theo Dõi",
      login_subtitle: "An Toàn Sinh Học Thông Minh",
      login_tagline: "Phòng ngừa. Truy vết. Bảo vệ.",
      email: "Tài khoản",
      password: "Mật khẩu",
      remember_me: "Ghi nhớ đăng nhập",
      login_btn: "Đăng nhập",
      logging_in: "Đang tải dữ liệu...",
      invalid_login: "Thông tin đăng nhập không hợp lệ",
      overview: "Tổng quan hệ thống",
      farm_admin: "Quản trị trại",
      map_title: "Hệ Thống BioTrace",
      map_subtitle: "Bản đồ tổng quan hệ thống trại",
      add_farm: "Thêm trại mới",
      refresh: "Làm mới",
      logout: "Đăng xuất"
    }
  },
  en: {
    translation: {
      login_title: "BioTrace",
      login_subtitle: "Tracking System",
      login_tagline: "Prevent. Track. Protect.",
      email: "Email",
      password: "Password",
      remember_me: "Remember me",
      login_btn: "Login",
      logging_in: "Logging in...",
      invalid_login: "Invalid credentials",
      overview: "System Overview",
      farm_admin: "Farm Admin",
      map_title: "BioTrace System",
      map_subtitle: "Farm System Global Map",
      add_farm: "Add New Farm",
      refresh: "Refresh",
      logout: "Logout"
    }
  },
  th: {
    translation: {
      login_title: "ระบบติดตาม",
      login_subtitle: "ความปลอดภัยทางชีวภาพอัจฉริยะ",
      login_tagline: "ป้องกัน. ติดตาม. ปกป้อง.",
      email: "อีเมล",
      password: "รหัสผ่าน",
      remember_me: "จดจำการเข้าสู่ระบบ",
      login_btn: "เข้าสู่ระบบ",
      logging_in: "กำลังโหลด...",
      invalid_login: "ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง",
      overview: "ภาพรวมระบบ",
      farm_admin: "ผู้ดูแลฟาร์ม",
      map_title: "ระบบติดตามความปลอดภัยทางชีวภาพอัจฉริยะ",
      map_subtitle: "แผนที่ภาพรวมระบบฟาร์ม",
      add_farm: "เพิ่มฟาร์มใหม่",
      refresh: "รีเฟรช",
      logout: "ออกจากระบบ"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false, // react already safes from xss
    }
  });

export default i18n;
