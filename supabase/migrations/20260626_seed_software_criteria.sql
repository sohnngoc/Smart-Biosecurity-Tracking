-- Xoá các criteria của SOFTWARE form (nếu đã có từ script trước) để thay bằng bộ chuẩn
DELETE FROM public.assessment_criteria 
WHERE form_id = (SELECT id FROM public.assessment_forms WHERE code = 'SOFTWARE');

WITH sw_form AS (SELECT id FROM public.assessment_forms WHERE code = 'SOFTWARE')
INSERT INTO public.assessment_criteria (form_id, group_name, criteria_code, criteria_name, criteria_description, weight, input_type, is_mandatory, evidence_required, display_order)
SELECT id, '1. Quy trình sát trùng xe', 'SW_01', 'Tuân thủ thời gian ngâm xe', 'Xe lưu tại cổng đủ 15 phút sát trùng trước khi vào trại', 3.0, 'score_1_5', true, true, 1 FROM sw_form UNION ALL
SELECT id, '1. Quy trình sát trùng xe', 'SW_02', 'Lấy mẫu test nhanh bề mặt', 'Bảo vệ lấy mẫu gầm xe/bánh xe test nhanh theo quy định', 2.0, 'score_1_5', false, false, 2 FROM sw_form UNION ALL

SELECT id, '2. Quy trình tắm sát trùng người', 'SW_03', 'Tắm gội bằng xà phòng', 'Nhân sự tắm gội kỹ lưỡng, thay toàn bộ quần áo đồ dùng cá nhân', 3.0, 'score_1_5', true, false, 3 FROM sw_form UNION ALL
SELECT id, '2. Quy trình tắm sát trùng người', 'SW_04', 'Tuân thủ quy trình 1 chiều', 'Không đi ngược từ khu sạch ra khu bẩn để lấy đồ', 2.5, 'score_1_5', true, false, 4 FROM sw_form UNION ALL

SELECT id, '3. Quy trình gửi hình ảnh bằng chứng', 'SW_05', 'Chụp ảnh Zalo xe cám', 'Gửi ảnh sát trùng xe cám lên group Zalo trong vòng 5 phút', 1.5, 'score_1_5', true, true, 5 FROM sw_form UNION ALL
SELECT id, '3. Quy trình gửi hình ảnh bằng chứng', 'SW_06', 'Chụp ảnh khoá cổng', 'Bảo vệ chụp ảnh khoá cổng vào lúc 20:00 hàng ngày', 1.0, 'score_1_5', false, true, 6 FROM sw_form UNION ALL

SELECT id, '4. Quy trình ghi chép sổ sách', 'SW_07', 'Sổ nhật ký ra vào', 'Ghi chú đầy đủ tên, giờ vào, giờ ra, lý do, biển số xe', 2.0, 'score_1_5', true, true, 7 FROM sw_form UNION ALL

SELECT id, '5. Quy trình cách ly', 'SW_08', 'Cách ly đủ thời gian', 'Nhân sự mới hoặc trở lại trại phải ở khu cách ly đúng 48h (hoặc tuỳ quy định)', 3.0, 'score_1_5', true, false, 8 FROM sw_form UNION ALL

SELECT id, '6. Quy trình vệ sinh sau xuất/chuyển heo', 'SW_09', 'Phun thuốc sát trùng bệ xuất', 'Phun thuốc ngay lập tức sau khi xe bắt heo rời đi', 3.0, 'score_1_5', true, false, 9 FROM sw_form UNION ALL
SELECT id, '6. Quy trình vệ sinh sau xuất/chuyển heo', 'SW_10', 'Ngâm đồ BHLĐ', 'Ngâm ủng, quần áo ngay sau khi tiếp xúc với xe ngoài', 2.0, 'score_1_5', true, false, 10 FROM sw_form UNION ALL

SELECT id, '7. Quy trình báo cáo sự cố', 'SW_11', 'Khai báo y tế / Dịch tễ', 'Báo cáo ngay cho Quản lý nếu nhân sự đi ngang vùng dịch hoặc có triệu chứng bệnh', 3.0, 'score_1_5', true, false, 11 FROM sw_form;
