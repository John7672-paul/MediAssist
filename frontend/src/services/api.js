import axios from 'axios';
import {
  mockDoctors,
  mockAppointments,
  mockNotifications,
  mockAvailability,
  mockAnalytics,
  mockAIResponses
} from '../utils/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mediassist_token');
    if (token && !token.startsWith('demo_')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

// Normalize backend doctor to frontend doctor format
function normalizeDoctor(doc) {
  if (!doc) return null;
  if (doc.specialty && doc.name) return doc; // already in mock/frontend format
  return {
    id: String(doc.id),
    name: doc.user?.full_name || `Dr. ${doc.qualification || 'Specialist'}`,
    email: doc.user?.email || '',
    phone: doc.user?.phone || '',
    specialty: doc.specialization?.name || 'General Physician',
    qualification: doc.qualification || 'MBBS',
    experience: `${doc.experience_years || 0} years experience`,
    experienceYears: doc.experience_years || 0,
    location: doc.location || 'Clinic',
    consultationFee: Number(doc.consultation_fee) || 500,
    isVerified: Boolean(doc.is_verified),
    bio: doc.bio || '',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78905?auto=format&fit=crop&q=80&w=200',
    slots: {
      '2026-08-29': ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"],
      '2026-08-30': ["10:00 AM", "11:00 AM", "03:00 PM", "05:00 PM"],
      '2026-08-31': ["09:30 AM", "11:30 AM", "02:30 PM", "04:30 PM"]
    },
    availableDates: ['2026-08-29', '2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02']
  };
}

// Normalize backend appointment to frontend appointment format
function normalizeAppointment(apt) {
  if (!apt) return null;
  if (apt.doctorName && apt.patientName) return apt; // already mock format
  return {
    id: String(apt.id),
    patientId: String(apt.patient?.id || apt.patient_id || 'pat-1'),
    patientName: apt.patient?.user?.full_name || 'Patient',
    patientEmail: apt.patient?.user?.email || '',
    patientPhone: apt.patient?.user?.phone || '',
    doctorId: String(apt.doctor?.id || apt.doctor_id || 'doc-1'),
    doctorName: apt.doctor?.user?.full_name || 'Doctor',
    specialty: apt.doctor?.specialization?.name || 'General Medicine',
    doctorAvatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78905?auto=format&fit=crop&q=80&w=200',
    date: apt.appointment_date || '',
    time: apt.start_time ? apt.start_time.slice(0, 5) : '',
    type: apt.appointment_type === 'IN_PERSON' ? 'In Person' : 'Online',
    status: apt.status === 'PENDING' ? 'PENDING' : apt.status === 'CONFIRMED' ? 'UPCOMING' : apt.status,
    consultationFee: apt.doctor?.consultation_fee || 500,
    location: apt.doctor?.location || 'Clinic',
    patientNote: apt.patient_note || '',
    bookingDate: apt.created_at ? apt.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
  };
}

export const doctorService = {
  getDoctors: async (filters = {}) => {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.location && filters.location !== 'All Locations') params.location = filters.location;
      const res = await apiClient.get('/api/doctors', { params });
      if (res.data?.items && res.data.items.length > 0) {
        return res.data.items.map(normalizeDoctor);
      }
    } catch (e) {
      // fallback to mock
    }
    await delay(100);
    let result = [...mockDoctors];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
      );
    }
    if (filters.specialty && filters.specialty !== 'All Specialties') {
      result = result.filter(d => d.specialty === filters.specialty);
    }
    if (filters.consultationType && filters.consultationType !== 'All') {
      result = result.filter(d => d.consultationTypes?.includes(filters.consultationType));
    }
    return result;
  },

  getDoctorById: async (id) => {
    try {
      const numId = parseInt(id, 10);
      if (!isNaN(numId)) {
        const res = await apiClient.get(`/api/doctors/${numId}`);
        if (res.data) return normalizeDoctor(res.data);
      }
    } catch (e) {
      // fallback
    }
    await delay(100);
    const doc = mockDoctors.find(d => String(d.id) === String(id));
    if (!doc) return mockDoctors[0];
    return doc;
  },

  getDoctorSlots: async (id, date) => {
    try {
      const numId = parseInt(id, 10);
      if (!isNaN(numId) && date) {
        const res = await apiClient.get(`/api/doctors/${numId}/available-slots`, { params: { date } });
        if (res.data?.slots && res.data.slots.length > 0) {
          return res.data.slots;
        }
      }
    } catch (e) {
      // fallback
    }
    await delay(100);
    const doc = mockDoctors.find(d => String(d.id) === String(id)) || mockDoctors[0];
    return doc.slots?.[date] || ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"];
  },

  getSpecializations: async () => {
    try {
      const res = await apiClient.get('/api/specializations');
      if (res.data && Array.isArray(res.data)) return res.data;
    } catch (e) {
      // fallback
    }
    return [
      { id: 1, name: 'Dermatology', description: 'Skin, hair, and nail health' },
      { id: 2, name: 'General Physician', description: 'Comprehensive primary care' },
      { id: 3, name: 'Cardiology', description: 'Heart and cardiovascular health' },
      { id: 4, name: 'Pediatrics', description: 'Infant, child, and adolescent medicine' },
      { id: 5, name: 'Orthopedics', description: 'Bones, joints, and muscular system' },
      { id: 6, name: 'Neurology', description: 'Brain and nervous system' }
    ];
  }
};

export const appointmentService = {
  getAppointments: async (role = 'PATIENT', userId = 'pat-1') => {
    try {
      const res = await apiClient.get('/api/appointments');
      if (res.data?.items) {
        return res.data.items.map(normalizeAppointment);
      }
    } catch (e) {
      // fallback to mock
    }
    await delay(100);
    if (role === 'DOCTOR') {
      return mockAppointments.filter(a => a.doctorId === 'doc-1');
    }
    if (role === 'ADMIN') {
      return [...mockAppointments];
    }
    return mockAppointments.filter(a => a.patientId === userId || a.patientId === 'pat-1');
  },

  getAppointmentById: async (id) => {
    try {
      const numId = parseInt(id, 10);
      if (!isNaN(numId)) {
        const res = await apiClient.get(`/api/appointments/${numId}`);
        if (res.data) return normalizeAppointment(res.data);
      }
    } catch (e) {
      // fallback
    }
    await delay(100);
    const apt = mockAppointments.find(a => String(a.id) === String(id));
    if (!apt) return mockAppointments[0];
    return apt;
  },

  createAppointment: async (appointmentData) => {
    try {
      const doctorIdNum = parseInt(appointmentData.doctorId, 10) || 1;
      const payload = {
        doctor_id: doctorIdNum,
        appointment_date: appointmentData.date || '2026-08-29',
        start_time: (appointmentData.time?.includes(' ') ? '10:00:00' : appointmentData.time) || '10:00:00',
        end_time: '10:30:00',
        appointment_type: appointmentData.type === 'Online' ? 'ONLINE' : 'IN_PERSON',
        patient_note: appointmentData.patientNote || ''
      };
      const res = await apiClient.post('/api/appointments', payload);
      if (res.data) return normalizeAppointment(res.data);
    } catch (e) {
      // fallback to mock
    }
    await delay(200);
    const newApt = {
      id: `apt-${Date.now()}`,
      status: 'UPCOMING',
      bookingDate: new Date().toISOString().split('T')[0],
      ...appointmentData
    };
    mockAppointments.unshift(newApt);
    return newApt;
  },

  cancelAppointment: async (id, reason = '') => {
    try {
      const numId = parseInt(id, 10);
      if (!isNaN(numId)) {
        const res = await apiClient.patch(`/api/appointments/${numId}/cancel`);
        if (res.data) return normalizeAppointment(res.data);
      }
    } catch (e) {
      // fallback
    }
    await delay(150);
    const apt = mockAppointments.find(a => String(a.id) === String(id));
    if (apt) {
      apt.status = 'CANCELLED';
      apt.cancelReason = reason;
    }
    return apt;
  },

  rescheduleAppointment: async (id, newDate, newTime) => {
    try {
      const numId = parseInt(id, 10);
      if (!isNaN(numId)) {
        const payload = {
          appointment_date: newDate,
          start_time: (newTime?.includes(' ') ? '11:00:00' : newTime) || '11:00:00',
          end_time: '11:30:00'
        };
        const res = await apiClient.patch(`/api/appointments/${numId}/reschedule`, payload);
        if (res.data) return normalizeAppointment(res.data);
      }
    } catch (e) {
      // fallback
    }
    await delay(150);
    const apt = mockAppointments.find(a => String(a.id) === String(id));
    if (apt) {
      apt.date = newDate;
      apt.time = newTime;
      apt.status = 'UPCOMING';
    }
    return apt;
  },

  updateAppointmentStatus: async (id, status) => {
    try {
      const numId = parseInt(id, 10);
      if (!isNaN(numId)) {
        const res = await apiClient.patch(`/api/appointments/${numId}/status`, { status });
        if (res.data) return normalizeAppointment(res.data);
      }
    } catch (e) {
      // fallback
    }
    await delay(100);
    const apt = mockAppointments.find(a => String(a.id) === String(id));
    if (apt) apt.status = status;
    return apt;
  }
};

export const availabilityService = {
  getAvailability: async (doctorId) => {
    try {
      const numId = parseInt(doctorId, 10) || 1;
      const res = await apiClient.get(`/api/doctors/${numId}/availability`);
      if (res.data && Array.isArray(res.data)) return res.data;
    } catch (e) {
      // fallback
    }
    return mockAvailability;
  },
  saveAvailability: async (doctorId, schedule) => {
    try {
      const numId = parseInt(doctorId, 10) || 1;
      const res = await apiClient.post(`/api/doctors/${numId}/availability`, schedule);
      return res.data;
    } catch (e) {
      return schedule;
    }
  }
};

export const aiService = {
  sendChatMessage: async (message, conversationId = null) => {
    try {
      const res = await apiClient.post('/api/ai/chat', { message, conversation_id: conversationId });
      if (res.data?.reply) {
        return {
          reply: res.data.reply,
          conversationId: res.data.conversation_id,
          isDemoMode: res.data.is_demo_mode
        };
      }
    } catch (e) {
      // fallback to smart mock responses
    }
    await delay(300);
    const msg = message.toLowerCase();
    let reply = mockAIResponses.default;
    if (msg.includes('dermatologist') || msg.includes('doctor') || msg.includes('find') || msg.includes('skin')) {
      reply = mockAIResponses.findDoctor;
    } else if (msg.includes('availability') || msg.includes('slot') || msg.includes('time')) {
      reply = mockAIResponses.checkAvailability;
    } else if (msg.includes('my appointment') || msg.includes('upcoming') || msg.includes('show')) {
      reply = mockAIResponses.showAppointments;
    } else if (msg.includes('reschedule') || msg.includes('change')) {
      reply = mockAIResponses.reschedule;
    }
    return {
      reply: reply + "\n\n---\n⚕️ Medical Disclaimer: MediAssist provides navigation & appointment assistance only. Consult a doctor for medical diagnosis or treatment.",
      conversationId: 1,
      isDemoMode: true
    };
  }
};

export const notificationService = {
  getNotifications: async () => {
    try {
      const res = await apiClient.get('/api/notifications');
      if (res.data && Array.isArray(res.data)) {
        return res.data.map(n => ({
          id: String(n.id),
          title: n.title,
          message: n.message,
          type: n.notification_type,
          read: n.is_read,
          time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
        }));
      }
    } catch (e) {
      // fallback
    }
    await delay(100);
    return [...mockNotifications];
  },
  getUnreadCount: async () => {
    try {
      const res = await apiClient.get('/api/notifications/unread-count');
      if (typeof res.data?.count === 'number') return res.data.count;
    } catch (e) {
      // fallback
    }
    return mockNotifications.filter(n => !n.read).length;
  },
  markAsRead: async (id) => {
    try {
      const numId = parseInt(id, 10);
      if (!isNaN(numId)) {
        await apiClient.patch(`/api/notifications/${numId}/read`);
      }
    } catch (e) {
      // fallback
    }
    const n = mockNotifications.find(item => String(item.id) === String(id));
    if (n) n.read = true;
    return n;
  },
  markAllRead: async () => {
    try {
      await apiClient.patch('/api/notifications/read-all');
    } catch (e) {
      // fallback
    }
    mockNotifications.forEach(n => { n.read = true; });
  }
};

export const adminService = {
  getAnalytics: async () => {
    try {
      const res = await apiClient.get('/api/admin/analytics');
      if (res.data) {
        return {
          totalPatients: res.data.total_patients || 1240,
          totalDoctors: res.data.total_doctors || 48,
          verifiedDoctors: res.data.verified_doctors || 42,
          pendingDoctors: res.data.unverified_doctors || 6,
          totalAppointments: res.data.total_appointments || 3820,
          completedAppointments: res.data.appointments_by_status?.COMPLETED || 3410,
          cancelledAppointments: res.data.appointments_by_status?.CANCELLED || 190,
          pendingAppointments: res.data.appointments_by_status?.PENDING || 220,
          patientGrowth: mockAnalytics.patientGrowth,
          specialtyDistribution: mockAnalytics.specialtyDistribution,
          recentSignups: mockAnalytics.recentSignups
        };
      }
    } catch (e) {
      // fallback
    }
    await delay(150);
    return mockAnalytics;
  },
  getPatients: async () => {
    try {
      const res = await apiClient.get('/api/admin/patients');
      if (res.data?.items) return res.data.items;
    } catch (e) {
      // fallback
    }
    return [
      { id: 1, user_id: 1, full_name: 'John Smith', email: 'john.smith@example.com', phone: '+91 98765 43210', gender: 'Male', created_at: '2026-08-01' },
      { id: 2, user_id: 4, full_name: 'Anita Roy', email: 'anita.roy@example.com', phone: '+91 98111 22334', gender: 'Female', created_at: '2026-08-10' }
    ];
  },
  verifyDoctor: async (doctorId, isVerified) => {
    try {
      const res = await apiClient.patch(`/api/doctors/${doctorId}/verify`, { is_verified: isVerified });
      return res.data;
    } catch (e) {
      return { id: doctorId, is_verified: isVerified };
    }
  }
};
