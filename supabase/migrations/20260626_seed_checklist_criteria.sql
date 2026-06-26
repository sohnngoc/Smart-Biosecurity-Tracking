-- Xoá các criteria của CHECKLIST_NAI_HB form (nếu đã có) để thay bằng bộ chuẩn
DELETE FROM public.assessment_criteria 
WHERE form_id = (SELECT id FROM public.assessment_forms WHERE code = 'CHECKLIST_NAI_HB');

WITH cl_form AS (SELECT id FROM public.assessment_forms WHERE code = 'CHECKLIST_NAI_HB')
INSERT INTO public.assessment_criteria (form_id, group_name, criteria_code, criteria_name, criteria_description, weight, input_type, is_mandatory, evidence_required, display_order)
SELECT id, '1. Điểm sát trùng bên ngoài', 'CL_01', 'Hoạt động của hố/phun sát trùng', 'Xe có được sát trùng toàn bộ bánh và gầm trước khi vào không?', 3.0, 'checklist_status', true, true, 1 FROM cl_form UNION ALL

SELECT id, '2. Xe vận chuyển', 'CL_02', 'Thời gian lưu xe / Ngâm xe', 'Xe lưu đủ thời gian 15p tại cổng chưa?', 2.0, 'checklist_status', true, false, 2 FROM cl_form UNION ALL
SELECT id, '2. Xe vận chuyển', 'CL_03', 'Chứng nhận sát trùng xe', 'Tài xế có mang giấy chứng nhận sát trùng hợp lệ không?', 1.5, 'checklist_status', true, true, 3 FROM cl_form UNION ALL

SELECT id, '3. Cổng trại', 'CL_04', 'Luôn đóng và khoá', 'Cổng chính có được đóng kín và khoá 24/24 trừ khi có lệnh mở?', 3.0, 'checklist_status', true, false, 4 FROM cl_form UNION ALL

SELECT id, '4. Nhà tắm & Cách ly người', 'CL_05', 'Tuân thủ cách ly 48h', 'Nhân sự mới có cách ly đủ 48h trước khi vào khu sản xuất?', 3.0, 'checklist_status', true, true, 5 FROM cl_form UNION ALL
SELECT id, '4. Nhà tắm & Cách ly người', 'CL_06', 'Quy trình tắm sát trùng', 'Người có tắm gội bằng xà phòng và thay đồ BHLĐ chuẩn không?', 2.5, 'checklist_status', true, false, 6 FROM cl_form UNION ALL

SELECT id, '5. Tủ UV', 'CL_07', 'Khử trùng vật tư', 'Mọi vật dụng mang vào trại có qua tủ UV đủ 15 phút không?', 2.0, 'checklist_status', true, true, 7 FROM cl_form UNION ALL

SELECT id, '6. Khu chăn nuôi (Nái - HB)', 'CL_08', 'Lưới chắn chim/chuột', 'Lưới tại các chuồng đẻ, chuồng bầu có bị rách không?', 2.0, 'checklist_status', true, false, 8 FROM cl_form UNION ALL
SELECT id, '6. Khu chăn nuôi (Nái - HB)', 'CL_09', 'Nhúng ủng bằng Iot', 'Có nhúng ủng tại chậu Iot trước cửa mỗi chuồng không?', 2.5, 'checklist_status', true, false, 9 FROM cl_form UNION ALL
SELECT id, '6. Khu chăn nuôi (Nái - HB)', 'CL_10', 'Vệ sinh dụng cụ thú y', 'Kim tiêm, xilanh có được luộc sôi và thay kim theo bầy không?', 3.0, 'checklist_status', true, true, 10 FROM cl_form UNION ALL

SELECT id, '7. Khu xuất / chuyển heo', 'CL_11', 'Phun bệ xuất heo', 'Bệ xuất heo có được phun sát trùng ngay sau khi bắt heo không?', 3.0, 'checklist_status', true, false, 11 FROM cl_form UNION ALL

SELECT id, '8. Kiểm soát heo bệnh/chết', 'CL_12', 'Xử lý xác chết', 'Xác heo có được xử lý (đốt/chôn) trong vòng 24h không?', 3.0, 'checklist_status', true, true, 12 FROM cl_form UNION ALL

SELECT id, '9. Ghi chép sổ sách', 'CL_13', 'Sổ nhật ký khách ra vào', 'Có ghi chép và ký tên đầy đủ khách và xe ra vào không?', 1.5, 'checklist_status', true, false, 13 FROM cl_form;
