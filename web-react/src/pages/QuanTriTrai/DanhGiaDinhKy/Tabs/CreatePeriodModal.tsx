import { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { X, Calendar, Save } from 'lucide-react';

interface CreatePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePeriodModal({ isOpen, onClose, onSuccess }: CreatePeriodModalProps) {
  const [periodName, setPeriodName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodName || !startDate || !endDate) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError('');

    // Deactivate old periods
    await supabase.from('assessment_periods').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert new period
    const { error: insertError } = await supabase.from('assessment_periods').insert([{
      period_name: periodName,
      start_date: startDate,
      end_date: endDate,
      is_active: true
    }]);

    setLoading(false);

    if (insertError) {
      setError('Lỗi khi tạo kỳ đánh giá. Tên kỳ có thể đã tồn tại.');
      console.error(insertError);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center">
            <Calendar className="mr-2" size={24} />
            Khởi tạo Kỳ đánh giá mới
          </h2>
          <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
            <strong>Lưu ý:</strong> Khi khởi tạo kỳ mới, hệ thống sẽ tự động tạo Phiên Đánh Giá rỗng cho toàn bộ Trại đang hoạt động trong hệ thống.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên kỳ đánh giá</label>
            <input
              type="text"
              placeholder="VD: Tháng 7/2026"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={periodName}
              onChange={e => setPeriodName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
              <input
                type="date"
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
              <input
                type="date"
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium disabled:opacity-50"
            >
              {loading ? 'Đang khởi tạo...' : (
                <>
                  <Save size={18} className="mr-2" />
                  Xác nhận Khởi tạo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
