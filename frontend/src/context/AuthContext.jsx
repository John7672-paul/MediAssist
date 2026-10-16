import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const DEMO_USERS = {
  PATIENT: {
    id: 'pat-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+91 98765 43210',
    role: 'PATIENT',
    dob: '1994-06-15',
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  },
  DOCTOR: {
    id: 'doc-1',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@mediassist.com',
    phone: '+91 98989 89898',
    role: 'DOCTOR',
    specialty: 'Dermatology',
    qualification: 'MBBS, MD (Dermatology)',
    experience: '8 years experience',
    location: 'Hyderabad (Banjara Hills)',
    consultationFee: 500,
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78905?auto=format&fit=crop&q=80&w=200'
  },
  ADMIN: {
    id: 'adm-1',
    name: 'Sarah Connor (System Admin)',
    email: 'admin@mediassist.com',
    phone: '+91 90000 00000',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mediassist_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.PATIENT; // Default to Patient demo
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('mediassist_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mediassist_user');
    }
  }, [user]);

  const loginDemo = (role) => {
    setLoading(true);
    setTimeout(() => {
      const demoUser = DEMO_USERS[role] || DEMO_USERS.PATIENT;
      setUser(demoUser);
      localStorage.setItem('mediassist_token', `demo_token_${role.toLowerCase()}`);
      setLoading(false);
    }, 150);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Attempt real backend authentication
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password }, { timeout: 4000 });
      if (res.data?.access_token) {
        const token = res.data.access_token;
        localStorage.setItem('mediassist_token', token);

        // Fetch current user details
        const meRes = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const realUser = {
          id: String(meRes.data.id),
          name: meRes.data.full_name,
          email: meRes.data.email,
          phone: meRes.data.phone || '',
          role: meRes.data.role,
          avatar: meRes.data.role === 'DOCTOR'
            ? DEMO_USERS.DOCTOR.avatar
            : meRes.data.role === 'ADMIN'
            ? DEMO_USERS.ADMIN.avatar
            : DEMO_USERS.PATIENT.avatar
        };
        setUser(realUser);
        setLoading(false);
        return { success: true, user: realUser };
      }
    } catch (err) {
      // If network error or backend not available, fallback to mock demo authentication
      console.warn('Backend login unavailable, using demo mode fallback:', err?.message);
    }

    // Demo fallback logic
    let matchedUser = DEMO_USERS.PATIENT;
    if (email.toLowerCase().includes('doctor')) matchedUser = DEMO_USERS.DOCTOR;
    if (email.toLowerCase().includes('admin')) matchedUser = DEMO_USERS.ADMIN;

    setUser(matchedUser);
    localStorage.setItem('mediassist_token', `demo_token_${matchedUser.role.toLowerCase()}`);
    setLoading(false);
    return { success: true, user: matchedUser };
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        full_name: userData.fullName || userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || null,
        role: userData.role || 'PATIENT'
      }, { timeout: 4000 });

      if (res.data?.id) {
        // Auto-login after registration
        return await login(userData.email, userData.password);
      }
    } catch (err) {
      console.warn('Backend register unavailable, using demo mode fallback:', err?.message);
    }

    // Demo fallback
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.fullName || userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'PATIENT',
      avatar: DEMO_USERS.PATIENT.avatar
    };
    setUser(newUser);
    localStorage.setItem('mediassist_token', 'demo_token_patient');
    setLoading(false);
    return { success: true, user: newUser };
  };

  const updateUserProfile = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mediassist_user');
    localStorage.removeItem('mediassist_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginDemo,
      login,
      register,
      updateUserProfile,
      logout,
      isAuthenticated: !!user,
      role: user ? user.role : 'GUEST'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
