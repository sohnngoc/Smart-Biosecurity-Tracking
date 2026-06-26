-- Xoá các criteria của HARDWARE form (nếu đã có từ script trước) để thay bằng bộ 14+ nhóm chuẩn
DELETE FROM public.assessment_criteria 
WHERE form_id = (SELECT id FROM public.assessment_forms WHERE code = 'HARDWARE');

WITH hw_form AS (SELECT id FROM public.assessment_forms WHERE code = 'HARDWARE')
INSERT INTO public.assessment_criteria (form_id, group_name, criteria_code, criteria_name, criteria_description, weight, input_type, is_mandatory, evidence_required, display_order)
SELECT id, '1. Điểm sát trùng cách trại 100-300m', 'HW_01', 'Hố sát trùng, hệ thống phun sương', 'Hố nước sát trùng đủ sâu, vòi phun hoạt động tốt, ướt toàn bộ gầm xe', 3.0, 'score_1_5', true, true, 1 FROM hw_form UNION ALL
SELECT id, '1. Điểm sát trùng cách trại 100-300m', 'HW_02', 'Biển báo, hàng rào tạm', 'Có biển báo cách ly, Barie cản xe để dừng sát trùng', 1.0, 'score_1_5', false, false, 2 FROM hw_form UNION ALL

SELECT id, '2. Cổng trại', 'HW_03', 'Hệ thống phun sát trùng cổng chính', 'Hoạt động tự động, áp lực nước mạnh, đủ phủ kín xe', 3.0, 'score_1_5', true, true, 3 FROM hw_form UNION ALL
SELECT id, '2. Cổng trại', 'HW_04', 'Nhà bảo vệ và khu tiếp nhận đồ', 'Sạch sẽ, có thiết bị sát trùng UV hoặc Ozon cho vật dụng nhỏ', 2.0, 'score_1_5', true, false, 4 FROM hw_form UNION ALL

SELECT id, '3. Hàng rào và vành đai', 'HW_05', 'Tình trạng hàng rào bao quanh', 'Hàng rào kiên cố, không có lỗ hổng > 5cm, không bị cỏ dại che lấp', 3.0, 'score_1_5', true, true, 5 FROM hw_form UNION ALL
SELECT id, '3. Hàng rào và vành đai', 'HW_06', 'Rãnh thoát nước vành đai', 'Không đọng nước, thông thoáng, lưới chặn rác tốt', 1.5, 'score_1_5', false, false, 6 FROM hw_form UNION ALL

SELECT id, '4. Nhà tắm sát trùng', 'HW_07', 'Khu vực chia bẩn - sạch', 'Vách ngăn rõ ràng, tuân thủ nguyên tắc 1 chiều', 3.0, 'score_1_5', true, false, 7 FROM hw_form UNION ALL
SELECT id, '4. Nhà tắm sát trùng', 'HW_08', 'Nguồn nước và xà phòng', 'Đầy đủ nước nóng/lạnh, xà phòng sát khuẩn chuyên dụng', 2.5, 'score_1_5', true, false, 8 FROM hw_form UNION ALL

SELECT id, '5. Tủ UV', 'HW_09', 'Hoạt động của bóng đèn UV', 'Tất cả bóng đèn sáng, có lịch theo dõi giờ bật và thay bóng', 3.0, 'score_1_5', true, true, 9 FROM hw_form UNION ALL

SELECT id, '6. Khu chăn nuôi', 'HW_10', 'Lưới chống chuột, chim', 'Lưới nguyên vẹn ở tất cả các lỗ thông gió, cửa sổ chuồng', 2.0, 'score_1_5', true, false, 10 FROM hw_form UNION ALL
SELECT id, '6. Khu chăn nuôi', 'HW_11', 'Tấm Cooling Pad', 'Sạch sẽ, không đóng cặn rêu, che chắn tốt', 1.5, 'score_1_5', false, false, 11 FROM hw_form UNION ALL

SELECT id, '7. Khu xuất / chuyển heo', 'HW_12', 'Bệ xuất heo', 'Dốc thoải, dễ vệ sinh, xa khu chăn nuôi chính, có hố sát trùng riêng', 3.0, 'score_1_5', true, true, 12 FROM hw_form UNION ALL

SELECT id, '8. Nguồn nước sử dụng', 'HW_13', 'Hệ thống lọc và bể chứa', 'Bể kín, có mái che, hệ thống châm Clo/thuốc sát trùng tự động', 2.5, 'score_1_5', true, false, 13 FROM hw_form UNION ALL

SELECT id, '9. Khu xử lý phân và heo chết', 'HW_14', 'Lò đốt / Hố chôn / Biogas', 'Tách biệt hoàn toàn, xử lý triệt để không gây rò rỉ mầm bệnh', 3.0, 'score_1_5', true, true, 14 FROM hw_form UNION ALL

SELECT id, '10. Camera giám sát', 'HW_15', 'Tầm nhìn và lưu trữ', 'Bao quát cổng trại, nhà tắm, khu xuất heo. Lưu trữ tối thiểu 30 ngày', 1.5, 'score_1_5', false, false, 15 FROM hw_form;
