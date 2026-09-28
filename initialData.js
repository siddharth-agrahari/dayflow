export const INITIAL_EMPLOYEES = [
  {
    id: "EMP-1001",
    employeeId: "EMP-1001",
    name: "Eleanor Vance",
    email: "admin@dayflow.com",
    password: "password123",
    role: "admin",
    designation: "Chief HR Officer & Admin",
    department: "Human Resources",
    joiningDate: "2021-03-15",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    personalDetails: {
      phone: "+1 (555) 234-5678",
      address: "742 Evergreen Terrace, San Francisco, CA",
      dob: "1988-06-21",
      gender: "Female",
      maritalStatus: "Married",
      emergencyContact: "David Vance (+1 555-987-6543)",
      bloodGroup: "O+"
    },
    jobDetails: {
      department: "Human Resources",
      designation: "Chief HR Officer & Admin",
      manager: "Board of Directors",
      workLocation: "San Francisco HQ (Hybrid)",
      employmentType: "Full-time",
      workSchedule: "09:00 AM - 06:00 PM (Mon-Fri)"
    },
    salaryStructure: {
      baseSalary: 9500,
      hra: 3200,
      specialAllowance: 1800,
      transportAllowance: 500,
      pfDeduction: 1140,
      taxDeduction: 1850,
      otherDeductions: 210,
      netSalary: 11800,
      bankName: "Silicon Valley Bank",
      accountNumber: "**** **** 8821",
      ifscCode: "SVB000491",
      pan: "ABCDV9912X"
    },
    leaveBalances: {
      paid: { total: 18, used: 2, remaining: 16 },
      sick: { total: 12, used: 1, remaining: 11 },
      unpaid: { total: 5, used: 0, remaining: 5 },
      casual: { total: 8, used: 2, remaining: 6 }
    },
    documents: [
      { id: "doc-1", title: "Employment Contract", type: "PDF", size: "2.4 MB", date: "2021-03-15" },
      { id: "doc-2", title: "Identity Verification & Passport", type: "PDF", size: "1.1 MB", date: "2021-03-15" },
      { id: "doc-3", title: "Executive HR Certifications", type: "PDF", size: "3.8 MB", date: "2023-01-10" }
    ]
  },
  {
    id: "EMP-1002",
    employeeId: "EMP-1002",
    name: "Alex Rivera",
    email: "alex@dayflow.com",
    password: "password123",
    role: "employee",
    designation: "Senior Full Stack Engineer",
    department: "Engineering",
    joiningDate: "2022-01-10",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    personalDetails: {
      phone: "+1 (555) 345-6789",
      address: "120 Market Street, Apt 4B, San Francisco, CA",
      dob: "1994-04-12",
      gender: "Non-binary",
      maritalStatus: "Single",
      emergencyContact: "Elena Rivera (+1 555-876-5432)",
      bloodGroup: "A+"
    },
    jobDetails: {
      department: "Engineering",
      designation: "Senior Full Stack Engineer",
      manager: "Sarah Jenkins (VP Eng)",
      workLocation: "Remote (Global)",
      employmentType: "Full-time",
      workSchedule: "09:30 AM - 06:30 PM (Mon-Fri)"
    },
    salaryStructure: {
      baseSalary: 8200,
      hra: 2800,
      specialAllowance: 1500,
      transportAllowance: 400,
      pfDeduction: 984,
      taxDeduction: 1450,
      otherDeductions: 166,
      netSalary: 10300,
      bankName: "Chase Bank",
      accountNumber: "**** **** 4192",
      ifscCode: "CHAS00918",
      pan: "BNPAX3421K"
    },
    leaveBalances: {
      paid: { total: 18, used: 4, remaining: 14 },
      sick: { total: 12, used: 3, remaining: 9 },
      unpaid: { total: 5, used: 0, remaining: 5 },
      casual: { total: 8, used: 1, remaining: 7 }
    },
    documents: [
      { id: "doc-4", title: "Offer Letter & NDA", type: "PDF", size: "1.8 MB", date: "2022-01-10" },
      { id: "doc-5", title: "AWS Solutions Architect Certificate", type: "PDF", size: "950 KB", date: "2023-05-20" }
    ]
  },
  {
    id: "EMP-1003",
    employeeId: "EMP-1003",
    name: "Marcus Chen",
    email: "marcus@dayflow.com",
    password: "password123",
    role: "employee",
    designation: "Lead Product Designer",
    department: "Design & UX",
    joiningDate: "2022-06-01",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    personalDetails: {
      phone: "+1 (555) 456-7890",
      address: "88 King St, Seattle, WA",
      dob: "1991-11-03",
      gender: "Male",
      maritalStatus: "Single",
      emergencyContact: "Henry Chen (+1 555-765-4321)",
      bloodGroup: "B+"
    },
    jobDetails: {
      department: "Design & UX",
      designation: "Lead Product Designer",
      manager: "Eleanor Vance",
      workLocation: "Seattle Office",
      employmentType: "Full-time",
      workSchedule: "09:00 AM - 06:00 PM (Mon-Fri)"
    },
    salaryStructure: {
      baseSalary: 7800,
      hra: 2600,
      specialAllowance: 1200,
      transportAllowance: 400,
      pfDeduction: 936,
      taxDeduction: 1320,
      otherDeductions: 144,
      netSalary: 9600,
      bankName: "Bank of America",
      accountNumber: "**** **** 7234",
      ifscCode: "BOFA00311",
      pan: "MCNCX8891P"
    },
    leaveBalances: {
      paid: { total: 18, used: 6, remaining: 12 },
      sick: { total: 12, used: 2, remaining: 10 },
      unpaid: { total: 5, used: 0, remaining: 5 },
      casual: { total: 8, used: 3, remaining: 5 }
    },
    documents: [
      { id: "doc-6", title: "Joining NDA & IP Assignment", type: "PDF", size: "1.5 MB", date: "2022-06-01" },
      { id: "doc-7", title: "Design Portfolio & Credentials", type: "PDF", size: "8.2 MB", date: "2022-06-01" }
    ]
  },
  {
    id: "EMP-1004",
    employeeId: "EMP-1004",
    name: "Sophia Rodriguez",
    email: "sophia@dayflow.com",
    password: "password123",
    role: "employee",
    designation: "Product Marketing Manager",
    department: "Marketing",
    joiningDate: "2023-02-15",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    personalDetails: {
      phone: "+1 (555) 567-8901",
      address: "412 Sunset Blvd, Los Angeles, CA",
      dob: "1995-09-18",
      gender: "Female",
      maritalStatus: "Single",
      emergencyContact: "Maria Rodriguez (+1 555-654-3210)",
      bloodGroup: "O-"
    },
    jobDetails: {
      department: "Marketing",
      designation: "Product Marketing Manager",
      manager: "Eleanor Vance",
      workLocation: "Los Angeles Hub",
      employmentType: "Full-time",
      workSchedule: "09:00 AM - 06:00 PM (Mon-Fri)"
    },
    salaryStructure: {
      baseSalary: 7200,
      hra: 2400,
      specialAllowance: 1100,
      transportAllowance: 350,
      pfDeduction: 864,
      taxDeduction: 1180,
      otherDeductions: 106,
      netSalary: 8900,
      bankName: "Wells Fargo",
      accountNumber: "**** **** 3319",
      ifscCode: "WFAR00822",
      pan: "SRDZ99214L"
    },
    leaveBalances: {
      paid: { total: 18, used: 1, remaining: 17 },
      sick: { total: 12, used: 1, remaining: 11 },
      unpaid: { total: 5, used: 0, remaining: 5 },
      casual: { total: 8, used: 0, remaining: 8 }
    },
    documents: [
      { id: "doc-8", title: "Marketing Director Recommendation", type: "PDF", size: "620 KB", date: "2023-02-15" }
    ]
  },
  {
    id: "EMP-1005",
    employeeId: "EMP-1005",
    name: "Devon Knight",
    email: "devon@dayflow.com",
    password: "password123",
    role: "employee",
    designation: "DevOps & Cloud Architect",
    department: "Engineering",
    joiningDate: "2023-08-01",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    personalDetails: {
      phone: "+1 (555) 678-9012",
      address: "303 Pine St, Austin, TX",
      dob: "1992-12-05",
      gender: "Male",
      maritalStatus: "Married",
      emergencyContact: "Chloe Knight (+1 555-543-2109)",
      bloodGroup: "AB+"
    },
    jobDetails: {
      department: "Engineering",
      designation: "DevOps & Cloud Architect",
      manager: "Sarah Jenkins",
      workLocation: "Austin HQ",
      employmentType: "Full-time",
      workSchedule: "10:00 AM - 07:00 PM (Mon-Fri)"
    },
    salaryStructure: {
      baseSalary: 8500,
      hra: 2900,
      specialAllowance: 1600,
      transportAllowance: 450,
      pfDeduction: 1020,
      taxDeduction: 1520,
      otherDeductions: 110,
      netSalary: 10800,
      bankName: "PNC Bank",
      accountNumber: "**** **** 9104",
      ifscCode: "PNCB00213",
      pan: "DKNG77123F"
    },
    leaveBalances: {
      paid: { total: 18, used: 5, remaining: 13 },
      sick: { total: 12, used: 0, remaining: 12 },
      unpaid: { total: 5, used: 0, remaining: 5 },
      casual: { total: 8, used: 2, remaining: 6 }
    },
    documents: [
      { id: "doc-9", title: "Certified Kubernetes Administrator (CKA)", type: "PDF", size: "1.2 MB", date: "2023-08-01" }
    ]
  }
];

export const INITIAL_LEAVE_REQUESTS = [
  {
    id: "LR-901",
    employeeId: "EMP-1002",
    employeeName: "Alex Rivera",
    employeeAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    department: "Engineering",
    leaveType: "Paid",
    fromDate: "2026-08-28",
    toDate: "2026-08-30",
    days: 3,
    reason: "Attending annual React & AI Engineering Conference in Seattle.",
    status: "Pending",
    appliedOn: "2026-08-22",
    adminComment: ""
  },
  {
    id: "LR-902",
    employeeId: "EMP-1003",
    employeeName: "Marcus Chen",
    employeeAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    department: "Design & UX",
    leaveType: "Sick",
    fromDate: "2026-08-24",
    toDate: "2026-08-25",
    days: 2,
    reason: "Severe viral fever and physician recommended bed rest.",
    status: "Approved",
    appliedOn: "2026-08-20",
    adminComment: "Approved. Please take rest and get well soon!"
  },
  {
    id: "LR-903",
    employeeId: "EMP-1004",
    employeeName: "Sophia Rodriguez",
    employeeAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    department: "Marketing",
    leaveType: "Casual",
    fromDate: "2026-09-02",
    toDate: "2026-09-04",
    days: 3,
    reason: "Family gathering and sister's wedding anniversary.",
    status: "Pending",
    appliedOn: "2026-08-21",
    adminComment: ""
  },
  {
    id: "LR-904",
    employeeId: "EMP-1005",
    employeeName: "Devon Knight",
    employeeAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    department: "Engineering",
    leaveType: "Paid",
    fromDate: "2026-08-10",
    toDate: "2026-08-14",
    days: 5,
    reason: "Summer mountain hiking trip with family.",
    status: "Approved",
    appliedOn: "2026-08-01",
    adminComment: "Approved. Have a great vacation!"
  }
];

// Comprehensive Multi-Week Attendance History (Aug 1 - Aug 23, 2026)
export const INITIAL_ATTENDANCE_LOGS = [
  // --- Week 4 (Aug 17 - Aug 23, 2026) ---
  // Sun Aug 23, 2026 (Today)
  {
    id: "ATT-20260823-1001",
    employeeId: "EMP-1001",
    employeeName: "Eleanor Vance",
    department: "Human Resources",
    date: "2026-08-23",
    checkIn: "08:55 AM",
    checkOut: "05:45 PM",
    workHours: "8h 50m",
    status: "Present",
    mode: "Office",
    notes: "Regular shift"
  },
  {
    id: "ATT-20260823-1002",
    employeeId: "EMP-1002",
    employeeName: "Alex Rivera",
    department: "Engineering",
    date: "2026-08-23",
    checkIn: "09:12 AM",
    checkOut: null,
    workHours: "In Progress",
    status: "Present",
    mode: "Remote",
    notes: "Sprint work"
  },
  {
    id: "ATT-20260823-1003",
    employeeId: "EMP-1003",
    employeeName: "Marcus Chen",
    department: "Design & UX",
    date: "2026-08-23",
    checkIn: "09:30 AM",
    checkOut: null,
    workHours: "In Progress",
    status: "Present",
    mode: "Office",
    notes: "Design review"
  },
  {
    id: "ATT-20260823-1004",
    employeeId: "EMP-1004",
    employeeName: "Sophia Rodriguez",
    department: "Marketing",
    date: "2026-08-23",
    checkIn: null,
    checkOut: null,
    workHours: "0h 0m",
    status: "Absent",
    mode: "-",
    notes: "Pending check-in"
  },
  {
    id: "ATT-20260823-1005",
    employeeId: "EMP-1005",
    employeeName: "Devon Knight",
    department: "Engineering",
    date: "2026-08-23",
    checkIn: "10:02 AM",
    checkOut: null,
    workHours: "In Progress",
    status: "Present",
    mode: "Office",
    notes: "Infra maintenance"
  },

  // Sat Aug 22, 2026
  {
    id: "ATT-20260822-1001",
    employeeId: "EMP-1001",
    employeeName: "Eleanor Vance",
    department: "Human Resources",
    date: "2026-08-22",
    checkIn: "08:50 AM",
    checkOut: "06:10 PM",
    workHours: "9h 20m",
    status: "Present",
    mode: "Office"
  },
  {
    id: "ATT-20260822-1002",
    employeeId: "EMP-1002",
    employeeName: "Alex Rivera",
    department: "Engineering",
    date: "2026-08-22",
    checkIn: "09:05 AM",
    checkOut: "06:30 PM",
    workHours: "9h 25m",
    status: "Present",
    mode: "Remote"
  },
  {
    id: "ATT-20260822-1003",
    employeeId: "EMP-1003",
    employeeName: "Marcus Chen",
    department: "Design & UX",
    date: "2026-08-22",
    checkIn: "09:15 AM",
    checkOut: "01:30 PM",
    workHours: "4h 15m",
    status: "Half-day",
    mode: "Office"
  },
  {
    id: "ATT-20260822-1004",
    employeeId: "EMP-1004",
    employeeName: "Sophia Rodriguez",
    department: "Marketing",
    date: "2026-08-22",
    checkIn: "09:00 AM",
    checkOut: "05:55 PM",
    workHours: "8h 55m",
    status: "Present",
    mode: "Office"
  },
  {
    id: "ATT-20260822-1005",
    employeeId: "EMP-1005",
    employeeName: "Devon Knight",
    department: "Engineering",
    date: "2026-08-22",
    checkIn: "09:45 AM",
    checkOut: "06:40 PM",
    workHours: "8h 55m",
    status: "Present",
    mode: "Office"
  },

  // Fri Aug 21, 2026
  {
    id: "ATT-20260821-1002",
    employeeId: "EMP-1002",
    employeeName: "Alex Rivera",
    department: "Engineering",
    date: "2026-08-21",
    checkIn: "09:10 AM",
    checkOut: "06:15 PM",
    workHours: "9h 05m",
    status: "Present",
    mode: "Remote"
  },
  {
    id: "ATT-20260821-1003",
    employeeId: "EMP-1003",
    employeeName: "Marcus Chen",
    department: "Design & UX",
    date: "2026-08-21",
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
    workHours: "9h 00m",
    status: "Present",
    mode: "Office"
  },

  // Thu Aug 20, 2026
  {
    id: "ATT-20260820-1002",
    employeeId: "EMP-1002",
    employeeName: "Alex Rivera",
    department: "Engineering",
    date: "2026-08-20",
    checkIn: "09:20 AM",
    checkOut: "06:00 PM",
    workHours: "8h 40m",
    status: "Present",
    mode: "Remote"
  },
  {
    id: "ATT-20260820-1003",
    employeeId: "EMP-1003",
    employeeName: "Marcus Chen",
    department: "Design & UX",
    date: "2026-08-20",
    checkIn: "-",
    checkOut: "-",
    workHours: "0h 0m",
    status: "Leave",
    mode: "On Leave"
  },

  // Wed Aug 19, 2026
  {
    id: "ATT-20260819-1002",
    employeeId: "EMP-1002",
    employeeName: "Alex Rivera",
    department: "Engineering",
    date: "2026-08-19",
    checkIn: "09:00 AM",
    checkOut: "06:10 PM",
    workHours: "9h 10m",
    status: "Present",
    mode: "Office"
  },

  // Tue Aug 18, 2026
  {
    id: "ATT-20260818-1002",
    employeeId: "EMP-1002",
    employeeName: "Alex Rivera",
    department: "Engineering",
    date: "2026-08-18",
    checkIn: "09:15 AM",
    checkOut: "06:00 PM",
    workHours: "8h 45m",
    status: "Present",
    mode: "Remote"
  },

  // Mon Aug 17, 2026
  {
    id: "ATT-20260817-1002",
    employeeId: "EMP-1002",
    employeeName: "Alex Rivera",
    department: "Engineering",
    date: "2026-08-17",
    checkIn: "08:55 AM",
    checkOut: "06:20 PM",
    workHours: "9h 25m",
    status: "Present",
    mode: "Office"
  },

  // --- Week 3 (Aug 10 - Aug 16, 2026) ---
  {
    id: "ATT-20260814-1002",
    employeeId: "EMP-1002",
    employeeName: "Alex Rivera",
    department: "Engineering",
    date: "2026-08-14",
    checkIn: "09:00 AM",
    checkOut: "05:45 PM",
    workHours: "8h 45m",
    status: "Present",
    mode: "Office"
  },
  {
    id: "ATT-20260813-1002",
    employeeId: "EMP-1002",
    employeeName: "Alex Rivera",
    department: "Engineering",
    date: "2026-08-13",
    checkIn: "09:05 AM",
    checkOut: "06:10 PM",
    workHours: "9h 05m",
    status: "Present",
    mode: "Remote"
  },
  {
    id: "ATT-20260812-1002",
    employeeId: "EMP-1002",
    employeeName: "Alex Rivera",
    department: "Engineering",
    date: "2026-08-12",
    checkIn: "09:30 AM",
    checkOut: "01:45 PM",
    workHours: "4h 15m",
    status: "Half-day",
    mode: "Office"
  },
  {
    id: "ATT-20260811-1002",
    employeeId: "EMP-1002",
    employeeName: "Alex Rivera",
    department: "Engineering",
    date: "2026-08-11",
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
    workHours: "9h 00m",
    status: "Present",
    mode: "Remote"
  },
  {
    id: "ATT-20260810-1002",
    employeeId: "EMP-1002",
    employeeName: "Alex Rivera",
    department: "Engineering",
    date: "2026-08-10",
    checkIn: "08:50 AM",
    checkOut: "06:15 PM",
    workHours: "9h 25m",
    status: "Present",
    mode: "Office"
  }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    title: "🎉 Dayflow Q3 All-Hands & Product Roadmap Presentation",
    content: "Join us this Friday at 4:00 PM PST for the company town hall celebrating our new HRMS rollout and Q3 achievements.",
    date: "2026-08-22",
    category: "Company Event",
    author: "Eleanor Vance (CHRO)"
  },
  {
    id: "ann-2",
    title: "🌴 Upcoming Labor Day Public Holiday",
    content: "The office will remain closed on Monday, September 7th for Labor Day. Paid time off is automatically applied.",
    date: "2026-08-20",
    category: "Holiday",
    author: "HR Operations"
  },
  {
    id: "ann-3",
    title: "🔒 Security Compliance & Annual Cybersecurity Refresher",
    content: "Please ensure you have completed the annual security training modules before month end.",
    date: "2026-08-15",
    category: "Compliance",
    author: "IT Security"
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "leave",
    title: "New Leave Application",
    message: "Alex Rivera applied for 3 days of Paid Leave (Aug 28 - Aug 30).",
    time: "10 mins ago",
    read: false
  },
  {
    id: "notif-2",
    type: "attendance",
    title: "Attendance Regularization",
    message: "Devon Knight checked in at 10:02 AM today.",
    time: "4 hours ago",
    read: false
  },
  {
    id: "notif-3",
    type: "payroll",
    title: "August Payroll Processed",
    message: "Monthly salary structures have been updated and validated.",
    time: "Yesterday",
    read: true
  }
];
