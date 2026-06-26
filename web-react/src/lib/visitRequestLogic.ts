import { supabase } from './supabaseClient';

export interface FarmVisitRequest {
  id?: string;
  farm_id: string;
  requester_id?: string;
  requester_name: string;
  department: string;
  position: string;
  vehicle_plate_number?: string;
  has_vehicle: boolean;
  estimated_visit_date: string;
  visit_session: 'morning' | 'afternoon' | 'full_day';
  visit_purpose: string;
  visit_purpose_detail?: string;
  swab_available: boolean;
  swab_result?: 'not_available' | 'negative' | 'positive' | 'pending' | 'not_applicable';
  swab_date?: string;
  swab_attachment_urls?: string[];
  requester_note?: string;
  vet_note?: string;
  status?: 'draft' | 'submitted' | 'pending_vet_approval' | 'approved' | 'rejected' | 'need_more_info' | 'cancelled' | 'completed';
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  need_more_info_reason?: string;
  created_at?: string;
  updated_at?: string;
  // Joins
  farm?: { farm_name: string };
}

// 1. Submit a new request
export async function submitVisitRequest(payload: FarmVisitRequest) {
  // Enforce validation logically
  if (!payload.farm_id || !payload.requester_name || !payload.department || !payload.position || !payload.estimated_visit_date || !payload.visit_session || !payload.visit_purpose) {
    throw new Error('Missing required fields');
  }

  // Get current user if possible
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  const dataToInsert = {
    ...payload,
    requester_id: userId,
    status: 'pending_vet_approval',
    // Supabase jsonb array handling
    swab_attachment_urls: payload.swab_attachment_urls || []
  };

  const { data, error } = await supabase.from('farm_visit_requests').insert([dataToInsert]).select().single();
  if (error) throw error;
  return data;
}

// 2. Get my requests
export async function getMyVisitRequests() {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  let query = supabase.from('farm_visit_requests').select(`*, farm:farm_id(farm_name)`).order('created_at', { ascending: false });
  
  if (userId) {
    // If auth is properly set up, filter by requester_id.
    // For demo/simplicity if no auth is enforced, we might fetch all. But let's assume we filter.
    query = query.eq('requester_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// 3. Get pending requests for Vet
export async function getPendingVetApprovalRequests() {
  const { data, error } = await supabase
    .from('farm_visit_requests')
    .select(`*, farm:farm_id(farm_name)`)
    .in('status', ['submitted', 'pending_vet_approval', 'need_more_info'])
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// 4. Approve request
export async function approveVisitRequest(id: string, vetNote: string) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  const { data, error } = await supabase
    .from('farm_visit_requests')
    .update({
      status: 'approved',
      approved_by: userId,
      approved_at: new Date().toISOString(),
      vet_note: vetNote
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 5. Reject request
export async function rejectVisitRequest(id: string, reason: string, vetNote: string) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  if (!reason) throw new Error('Rejection reason is required');

  const { data, error } = await supabase
    .from('farm_visit_requests')
    .update({
      status: 'rejected',
      rejected_by: userId,
      rejected_at: new Date().toISOString(),
      rejection_reason: reason,
      vet_note: vetNote
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 6. Request more info
export async function requestMoreInfoVisitRequest(id: string, reason: string, vetNote: string) {
  if (!reason) throw new Error('Reason is required');

  const { data, error } = await supabase
    .from('farm_visit_requests')
    .update({
      status: 'need_more_info',
      need_more_info_reason: reason,
      vet_note: vetNote
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 7. Get Farm Visit Logs (for Dashboard)
export async function getApprovedVisitLogsByFarm(farmId: string) {
  // Get approved requests from last 7 days + future
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('farm_visit_requests')
    .select(`*`)
    .eq('farm_id', farmId)
    .in('status', ['approved'])
    .gte('estimated_visit_date', dateStr)
    .order('estimated_visit_date', { ascending: true });

  if (error) throw error;
  return data;
}

// Dictionary mappings for UI
export const visitSessionMap: Record<string, string> = {
  'morning': 'Sáng',
  'afternoon': 'Chiều',
  'full_day': 'Cả ngày'
};

export const swabResultMap: Record<string, string> = {
  'not_available': 'Chưa có',
  'negative': 'Âm tính',
  'positive': 'Dương tính',
  'pending': 'Đang chờ kết quả',
  'not_applicable': 'Không áp dụng'
};

export const statusMap: Record<string, { label: string, color: string }> = {
  'draft': { label: 'Bản nháp', color: 'bg-gray-100 text-gray-700' },
  'submitted': { label: 'Đã gửi', color: 'bg-blue-100 text-blue-700' },
  'pending_vet_approval': { label: 'Chờ Vet duyệt', color: 'bg-yellow-100 text-yellow-700' },
  'approved': { label: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
  'rejected': { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
  'need_more_info': { label: 'Cần bổ sung thông tin', color: 'bg-orange-100 text-orange-700' },
  'cancelled': { label: 'Đã hủy', color: 'bg-gray-200 text-gray-500' },
  'completed': { label: 'Hoàn thành', color: 'bg-teal-100 text-teal-700' }
};
