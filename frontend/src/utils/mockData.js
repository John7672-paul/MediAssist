// Centralized Mock Data for MediAssist Application Prototype

export const mockDoctors = [
  {
    id: "doc-1",
    name: "Dr. Priya Sharma",
    specialty: "Dermatology",
    qualification: "MBBS, MD (Dermatology)",
    experience: "8 years experience",
    experienceYears: 8,
    location: "Hyderabad (Banjara Hills)",
    hospital: "MediCare Specialty Clinic",
    consultationFee: 500,
    rating: 4.9,
    reviewsCount: 124,
    avatar: "https://images.unsplash.com/photo-1594824813566-88855ce78905?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Priya Sharma is a senior dermatologist specializing in acne management, laser therapies, pediatric dermatology, and cosmetic skin care. She emphasizes holistic and evidence-based patient treatments.",
    consultationTypes: ["In Person", "Online"],
    availableDates: ["2026-08-29", "2026-08-30", "2026-08-31", "2026-09-01", "2026-09-02"],
    slots: {
      "2026-08-29": ["09:00 AM", "09:30 AM", "10:30 AM", "11:00 AM", "02:00 PM", "03:30 PM", "04:30 PM"],
      "2026-08-30": ["10:00 AM", "10:30 AM", "11:30 AM", "01:30 PM", "02:30 PM", "05:00 PM"],
      "2026-08-31": ["09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM"],
      "2026-09-01": ["10:30 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
      "2026-09-02": ["09:00 AM", "10:00 AM", "11:00 AM", "02:30 PM", "04:00 PM"]
    }
  },
  {
    id: "doc-2",
    name: "Dr. Rahul Kumar",
    specialty: "General Physician",
    qualification: "MBBS, DNB (Internal Medicine)",
    experience: "6 years experience",
    experienceYears: 6,
    location: "Hyderabad (Jubilee Hills)",
    hospital: "City Health Care Center",
    consultationFee: 400,
    rating: 4.8,
    reviewsCount: 98,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Rahul Kumar provides comprehensive primary care, lifestyle disease management, preventive health checks, and treatment for acute infectious illnesses.",
    consultationTypes: ["In Person", "Online"],
    availableDates: ["2026-08-29", "2026-08-30", "2026-08-31", "2026-09-01"],
    slots: {
      "2026-08-29": ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "04:00 PM", "04:30 PM"],
      "2026-08-30": ["09:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
      "2026-08-31": ["10:00 AM", "10:30 AM", "11:00 AM", "02:30 PM", "03:30 PM"],
      "2026-09-01": ["09:30 AM", "10:00 AM", "01:30 PM", "02:00 PM"]
    }
  },
  {
    id: "doc-3",
    name: "Dr. Anil Reddy",
    specialty: "Cardiology",
    qualification: "MBBS, MD, DM (Cardiology)",
    experience: "12 years experience",
    experienceYears: 12,
    location: "Hyderabad (Gachibowli)",
    hospital: "Apex Heart & Vascular Institute",
    consultationFee: 800,
    rating: 4.95,
    reviewsCount: 215,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Anil Reddy is a renowned cardiologist with expertise in preventive cardiology, hypertension control, ECG interpretation, and post-angioplasty care.",
    consultationTypes: ["In Person"],
    availableDates: ["2026-08-29", "2026-08-31", "2026-09-02"],
    slots: {
      "2026-08-29": ["11:00 AM", "11:30 AM", "12:00 PM", "03:00 PM", "03:30 PM"],
      "2026-08-31": ["10:00 AM", "10:30 AM", "11:30 AM", "02:00 PM"],
      "2026-09-02": ["11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM"]
    }
  },
  {
    id: "doc-4",
    name: "Dr. Ananya Roy",
    specialty: "Pediatrics",
    qualification: "MBBS, MD (Pediatrics)",
    experience: "10 years experience",
    experienceYears: 10,
    location: "Bengaluru (Koramangala)",
    hospital: "Little Care Children Hospital",
    consultationFee: 600,
    rating: 4.87,
    reviewsCount: 156,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Ananya Roy is dedicated to child health, newborn care, immunization planning, pediatric nutrition, and adolescent medicine.",
    consultationTypes: ["In Person", "Online"],
    availableDates: ["2026-08-29", "2026-08-30", "2026-09-01"],
    slots: {
      "2026-08-29": ["09:30 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"],
      "2026-08-30": ["10:00 AM", "10:30 AM", "11:00 AM", "03:00 PM"],
      "2026-09-01": ["09:00 AM", "09:30 AM", "02:30 PM", "03:30 PM"]
    }
  },
  {
    id: "doc-5",
    name: "Dr. Rajesh Varma",
    specialty: "Orthopedics",
    qualification: "MBBS, MS (Orthopedics), Fellowship in Joint Replacement",
    experience: "14 years experience",
    experienceYears: 14,
    location: "Bengaluru (Indiranagar)",
    hospital: "Bone & Joint Wellness Center",
    consultationFee: 750,
    rating: 4.91,
    reviewsCount: 180,
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Rajesh Varma specializes in joint preservation, sports injury management, arthritis therapies, and spine rehabilitation.",
    consultationTypes: ["In Person"],
    availableDates: ["2026-08-30", "2026-08-31", "2026-09-02"],
    slots: {
      "2026-08-30": ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM"],
      "2026-08-31": ["10:30 AM", "11:30 AM", "03:00 PM", "04:00 PM"],
      "2026-09-02": ["09:30 AM", "10:30 AM", "02:30 PM", "03:30 PM"]
    }
  },
  {
    id: "doc-6",
    name: "Dr. Sneha Kulkarni",
    specialty: "Neurology",
    qualification: "MBBS, MD, DM (Neurology)",
    experience: "9 years experience",
    experienceYears: 9,
    location: "Mumbai (Andheri West)",
    hospital: "Neuro Care & Brain Clinic",
    consultationFee: 900,
    rating: 4.93,
    reviewsCount: 142,
    avatar: "https://images.unsplash.com/photo-1594824813566-88855ce78905?auto=format&fit=crop&q=80&w=400",
    about: "Dr. Sneha Kulkarni offers expert evaluation and treatment for migraine, nerve disorders, epilepsy management, and vertigo.",
    consultationTypes: ["In Person", "Online"],
    availableDates: ["2026-08-29", "2026-08-30", "2026-09-01"],
    slots: {
      "2026-08-29": ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
      "2026-08-30": ["09:30 AM", "10:30 AM", "01:30 PM", "04:00 PM"],
      "2026-09-01": ["10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM"]
    }
  }
];

export const mockAppointments = [
  {
    id: "apt-101",
    patientId: "pat-1",
    patientName: "John Smith",
    patientEmail: "john.smith@example.com",
    patientPhone: "+91 98765 43210",
    doctorId: "doc-1",
    doctorName: "Dr. Priya Sharma",
    specialty: "Dermatology",
    doctorAvatar: "https://images.unsplash.com/photo-1594824813566-88855ce78905?auto=format&fit=crop&q=80&w=400",
    date: "2026-08-29",
    time: "10:30 AM",
    type: "In Person",
    status: "UPCOMING", // UPCOMING, COMPLETED, CANCELLED
    consultationFee: 500,
    location: "MediCare Specialty Clinic, Banjara Hills, Hyderabad",
    patientNote: "Consultation regarding persistent skin allergic rash on forearms.",
    bookingDate: "2026-08-25"
  },
  {
    id: "apt-102",
    patientId: "pat-1",
    patientName: "John Smith",
    patientEmail: "john.smith@example.com",
    patientPhone: "+91 98765 43210",
    doctorId: "doc-2",
    doctorName: "Dr. Rahul Kumar",
    specialty: "General Physician",
    doctorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    date: "2026-08-31",
    time: "02:30 PM",
    type: "Online",
    status: "UPCOMING",
    consultationFee: 400,
    location: "Video Consultation Link will be sent 15 mins prior",
    patientNote: "Routine health review and lab report discussion.",
    bookingDate: "2026-08-26"
  },
  {
    id: "apt-103",
    patientId: "pat-1",
    patientName: "John Smith",
    patientEmail: "john.smith@example.com",
    patientPhone: "+91 98765 43210",
    doctorId: "doc-3",
    doctorName: "Dr. Anil Reddy",
    specialty: "Cardiology",
    doctorAvatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    date: "2026-08-15",
    time: "11:00 AM",
    type: "In Person",
    status: "COMPLETED",
    consultationFee: 800,
    location: "Apex Heart Institute, Gachibowli, Hyderabad",
    patientNote: "Annual BP checkup and ECG evaluation.",
    bookingDate: "2026-08-10"
  },
  {
    id: "apt-104",
    patientId: "pat-1",
    patientName: "John Smith",
    patientEmail: "john.smith@example.com",
    patientPhone: "+91 98765 43210",
    doctorId: "doc-4",
    doctorName: "Dr. Ananya Roy",
    specialty: "Pediatrics",
    doctorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    date: "2026-08-02",
    time: "03:00 PM",
    type: "Online",
    status: "CANCELLED",
    consultationFee: 600,
    location: "Online Consultation",
    patientNote: "Schedule conflict - cancelled by patient.",
    bookingDate: "2026-07-30"
  },
  {
    id: "apt-105",
    patientId: "pat-2",
    patientName: "Sarah Williams",
    patientEmail: "sarah.williams@example.com",
    patientPhone: "+91 98123 45678",
    doctorId: "doc-1",
    doctorName: "Dr. Priya Sharma",
    specialty: "Dermatology",
    doctorAvatar: "https://images.unsplash.com/photo-1594824813566-88855ce78905?auto=format&fit=crop&q=80&w=400",
    date: "2026-08-29",
    time: "09:30 AM",
    type: "In Person",
    status: "UPCOMING",
    consultationFee: 500,
    location: "MediCare Specialty Clinic",
    patientNote: "Routine skin health review.",
    bookingDate: "2026-08-27"
  },
  {
    id: "apt-106",
    patientId: "pat-3",
    patientName: "Michael Brown",
    patientEmail: "michael.b@example.com",
    patientPhone: "+91 97654 32109",
    doctorId: "doc-1",
    doctorName: "Dr. Priya Sharma",
    specialty: "Dermatology",
    doctorAvatar: "https://images.unsplash.com/photo-1594824813566-88855ce78905?auto=format&fit=crop&q=80&w=400",
    date: "2026-08-29",
    time: "11:00 AM",
    type: "Online",
    status: "UPCOMING",
    consultationFee: 500,
    location: "Online Video Consultation",
    patientNote: "Follow-up consultation.",
    bookingDate: "2026-08-26"
  }
];

export const mockPatients = [
  {
    id: "pat-1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+91 98765 43210",
    gender: "Male",
    dob: "1994-06-15",
    totalAppointments: 4,
    status: "ACTIVE",
    createdAt: "2026-01-10"
  },
  {
    id: "pat-2",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    phone: "+91 98123 45678",
    gender: "Female",
    dob: "1990-11-22",
    totalAppointments: 2,
    status: "ACTIVE",
    createdAt: "2026-03-04"
  },
  {
    id: "pat-3",
    name: "Michael Brown",
    email: "michael.b@example.com",
    phone: "+91 97654 32109",
    gender: "Male",
    dob: "1988-03-09",
    totalAppointments: 6,
    status: "ACTIVE",
    createdAt: "2026-02-18"
  },
  {
    id: "pat-4",
    name: "Kavita Patel",
    email: "kavita.p@example.com",
    phone: "+91 91234 56789",
    gender: "Female",
    dob: "1996-08-30",
    totalAppointments: 1,
    status: "ACTIVE",
    createdAt: "2026-07-12"
  },
  {
    id: "pat-5",
    name: "David Miller",
    email: "david.m@example.com",
    phone: "+91 95432 10987",
    gender: "Male",
    dob: "1982-12-05",
    totalAppointments: 3,
    status: "INACTIVE",
    createdAt: "2026-04-01"
  }
];

export const mockNotifications = [
  {
    id: "notif-1",
    userId: "pat-1",
    title: "Appointment Confirmed",
    message: "Your appointment with Dr. Priya Sharma for Aug 29, 10:30 AM is confirmed.",
    type: "SUCCESS",
    read: false,
    timestamp: "10 minutes ago"
  },
  {
    id: "notif-2",
    userId: "pat-1",
    title: "Upcoming Appointment Reminder",
    message: "Reminder: You have a scheduled appointment tomorrow at 10:30 AM with Dr. Priya Sharma.",
    type: "INFO",
    read: false,
    timestamp: "2 hours ago"
  },
  {
    id: "notif-3",
    userId: "pat-1",
    title: "Appointment Rescheduled",
    message: "Your appointment with Dr. Rahul Kumar has been successfully moved to Aug 31, 02:30 PM.",
    type: "WARNING",
    read: true,
    timestamp: "Yesterday"
  },
  {
    id: "notif-4",
    userId: "pat-1",
    title: "AI Recommendation",
    message: "Based on your search, 3 dermatologists have new open slots this weekend.",
    type: "INFO",
    read: true,
    timestamp: "3 days ago"
  }
];

export const mockAvailability = {
  doctorId: "doc-1",
  slotDuration: "30", // minutes
  schedule: {
    Monday: { active: true, startTime: "09:00", endTime: "13:00" },
    Tuesday: { active: true, startTime: "09:00", endTime: "13:00" },
    Wednesday: { active: false, startTime: "09:00", endTime: "13:00" },
    Thursday: { active: true, startTime: "10:00", endTime: "16:00" },
    Friday: { active: true, startTime: "09:00", endTime: "14:00" },
    Saturday: { active: true, startTime: "10:00", endTime: "13:00" },
    Sunday: { active: false, startTime: "09:00", endTime: "12:00" }
  }
};

export const mockAnalytics = {
  summary: {
    totalPatients: 1248,
    totalDoctors: 42,
    totalAppointments: 3820,
    completionRate: "94.2%",
    revenue: "₹18,45,000"
  },
  appointmentsOverTime: [
    { month: "Jan", appointments: 280, completed: 260 },
    { month: "Feb", appointments: 340, completed: 315 },
    { month: "Mar", appointments: 420, completed: 395 },
    { month: "Apr", appointments: 510, completed: 480 },
    { month: "May", appointments: 630, completed: 590 },
    { month: "Jun", appointments: 720, completed: 685 },
    { month: "Jul", appointments: 890, completed: 840 },
    { month: "Aug", appointments: 960, completed: 910 }
  ],
  statusDistribution: [
    { name: "Completed", value: 78, color: "#10b981" },
    { name: "Upcoming", value: 16, color: "#0275c5" },
    { name: "Cancelled", value: 6, color: "#ef4444" }
  ],
  specialtyDistribution: [
    { specialty: "Dermatology", count: 320 },
    { specialty: "General Physician", count: 450 },
    { specialty: "Cardiology", count: 210 },
    { specialty: "Pediatrics", count: 180 },
    { specialty: "Orthopedics", count: 150 },
    { specialty: "Neurology", count: 120 }
  ]
};

export const mockAIResponses = {
  findDoctor: "I found 3 top-rated dermatologists with available appointments in Hyderabad this week:\n\n1. **Dr. Priya Sharma** (Dermatology, 8 yrs exp) - ₹500 - Available tomorrow at 10:30 AM.\n2. **Dr. Rahul Kumar** (General Physician, 6 yrs exp) - ₹400 - Available tomorrow at 09:00 AM.\n3. **Dr. Sneha Kulkarni** (Neurology, 9 yrs exp) - ₹900 - Available tomorrow at 10:00 AM.\n\nWould you like me to reserve a slot with any of these specialists?",
  checkAvailability: "Checking doctor schedules for tomorrow...\n\n- **Dr. Priya Sharma**: Slots at 09:00 AM, 10:30 AM, 02:00 PM, 04:30 PM.\n- **Dr. Rahul Kumar**: Slots at 09:00 AM, 11:00 AM, 04:00 PM.\n\nYou can tap any doctor card on the Find Doctors page to lock in your preferred time.",
  showAppointments: "Here is your next upcoming appointment:\n\n- **Doctor**: Dr. Priya Sharma (Dermatology)\n- **Date & Time**: Saturday, Aug 29, 2026 at 10:30 AM\n- **Location**: MediCare Specialty Clinic, Banjara Hills, Hyderabad\n- **Status**: Confirmed\n\nYou can manage or reschedule this appointment directly from your Appointments tab.",
  reschedule: "To reschedule your appointment with Dr. Priya Sharma, simply click the 'Reschedule' button on your upcoming appointment card, select a new date and time slot, and confirm. Alternatively, tell me your preferred new date!",
  default: "I am your MediAssist Appointment & Healthcare Navigation Assistant. I can help you search doctors by specialty, check slot availability, summarize your appointments, and guide your booking workflow."
};
