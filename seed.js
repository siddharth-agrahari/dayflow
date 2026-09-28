import bcrypt from 'bcryptjs';
import { db } from './database.js';

export async function seedDatabase(force = false) {
  // If already seeded and not forced, return
  if (!force && db.count('employees') > 0) {
    return;
  }

  console.log('🌱 Seeding Dayflow HRMS 2.0 database with production seed data...');

  const ORG_ID = 'org-dayflow-global';
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);

  const organization = {
    id: ORG_ID,
    name: 'Dayflow Technologies Inc.',
    slug: 'dayflow',
    domain: 'dayflow.com',
    currency: 'USD',
    currencySymbol: '$',
    timezone: 'America/Los_Angeles',
    address: '100 Innovation Way, Suite 400, San Francisco, CA 94105',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=dayflow',
    createdAt: '2024-01-01T00:00:00.000Z'
  };

  const departments = [
    { id: 'dept-eng', organizationId: ORG_ID, name: 'Engineering', code: 'ENG', description: 'Core product engineering, infrastructure and QA' },
    { id: 'dept-des', organizationId: ORG_ID, name: 'Design & UX', code: 'DES', description: 'Product design, UI/UX systems and research' },
    { id: 'dept-hr', organizationId: ORG_ID, name: 'Human Resources', code: 'HR', description: 'People operations, talent acquisition and culture' },
    { id: 'dept-mkt', organizationId: ORG_ID, name: 'Marketing', code: 'MKT', description: 'Brand marketing, demand gen and communications' },
    { id: 'dept-prd', organizationId: ORG_ID, name: 'Product', code: 'PRD', description: 'Product strategy, management and roadmaps' },
    { id: 'dept-sal', organizationId: ORG_ID, name: 'Sales', code: 'SAL', description: 'Enterprise sales, partnerships and customer success' }
  ];

  const designations = [
    { id: 'desig-1', organizationId: ORG_ID, title: 'Chief HR Officer & Admin', departmentId: 'dept-hr', level: 'Executive' },
    { id: 'desig-2', organizationId: ORG_ID, title: 'VP of Engineering', departmentId: 'dept-eng', level: 'Executive' },
    { id: 'desig-3', organizationId: ORG_ID, title: 'Lead Product Designer', departmentId: 'dept-des', level: 'Lead' },
    { id: 'desig-4', organizationId: ORG_ID, title: 'Senior Full Stack Engineer', departmentId: 'dept-eng', level: 'Senior' },
    { id: 'desig-5', organizationId: ORG_ID, title: 'Product Marketing Manager', departmentId: 'dept-mkt', level: 'Mid-Senior' },
    { id: 'desig-6', organizationId: ORG_ID, title: 'DevOps & Cloud Architect', departmentId: 'dept-eng', level: 'Senior' },
    { id: 'desig-7', organizationId: ORG_ID, title: 'HR Operations Specialist', departmentId: 'dept-hr', level: 'Mid' },
    { id: 'desig-8', organizationId: ORG_ID, title: 'Backend Engineer', departmentId: 'dept-eng', level: 'Mid' },
    { id: 'desig-9', organizationId: ORG_ID, title: 'Frontend Developer', departmentId: 'dept-eng', level: 'Mid' },
    { id: 'desig-10', organizationId: ORG_ID, title: 'QA Automation Engineer', departmentId: 'dept-eng', level: 'Mid' },
    { id: 'desig-11', organizationId: ORG_ID, title: 'Senior Product Manager', departmentId: 'dept-prd', level: 'Senior' },
    { id: 'desig-12', organizationId: ORG_ID, title: 'Enterprise Account Executive', departmentId: 'dept-sal', level: 'Senior' }
  ];

  const shifts = [
    {
      id: 'shift-morning',
      organizationId: ORG_ID,
      name: 'Standard Morning Shift',
      startTime: '09:00',
      endTime: '18:00',
      gracePeriodMins: 15,
      breakDurationMins: 60,
      isDefault: true
    },
    {
      id: 'shift-flexible',
      organizationId: ORG_ID,
      name: 'Flexible Engineering Shift',
      startTime: '10:00',
      endTime: '19:00',
      gracePeriodMins: 30,
      breakDurationMins: 60,
      isDefault: false
    },
    {
      id: 'shift-night',
      organizationId: ORG_ID,
      name: 'Global Support Night Shift',
      startTime: '22:00',
      endTime: '07:00',
      gracePeriodMins: 15,
      breakDurationMins: 60,
      isDefault: false
    }
  ];

  const holidays = [
    { id: 'hol-1', organizationId: ORG_ID, name: "New Year's Day", date: '2026-01-01', description: 'National public holiday', isRestricted: false, year: 2026 },
    { id: 'hol-2', organizationId: ORG_ID, name: 'Memorial Day', date: '2026-05-25', description: 'Federal holiday', isRestricted: false, year: 2026 },
    { id: 'hol-3', organizationId: ORG_ID, name: 'Independence Day', date: '2026-07-04', description: '4th of July Celebration', isRestricted: false, year: 2026 },
    { id: 'hol-4', organizationId: ORG_ID, name: 'Labor Day', date: '2026-09-07', description: 'Labor Day observance', isRestricted: false, year: 2026 },
    { id: 'hol-5', organizationId: ORG_ID, name: 'Thanksgiving Day', date: '2026-11-26', description: 'Thanksgiving holiday', isRestricted: false, year: 2026 },
    { id: 'hol-6', organizationId: ORG_ID, name: 'Christmas Day', date: '2026-12-25', description: 'Christmas Day observance', isRestricted: false, year: 2026 }
  ];

  const rawEmployees = [
    {
      employeeId: 'EMP-1001',
      name: 'Eleanor Vance',
      email: 'admin@dayflow.com',
      role: 'super_admin',
      department: 'Human Resources',
      designation: 'Chief HR Officer & Admin',
      joiningDate: '2021-03-15',
      managerId: null,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, San Francisco, CA',
      baseSalary: 9500,
      hra: 3200,
      specialAllowance: 1800,
      transportAllowance: 500,
      pfDeduction: 1140,
      taxDeduction: 1850,
      otherDeductions: 210,
      bankName: 'Silicon Valley Bank',
      accountNumber: '**** **** 8821'
    },
    {
      employeeId: 'EMP-1002',
      name: 'Alex Rivera',
      email: 'alex@dayflow.com',
      role: 'employee',
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      joiningDate: '2022-01-10',
      managerId: 'EMP-1004',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 345-6789',
      address: '120 Market Street, Apt 4B, San Francisco, CA',
      baseSalary: 8200,
      hra: 2800,
      specialAllowance: 1500,
      transportAllowance: 400,
      pfDeduction: 984,
      taxDeduction: 1450,
      otherDeductions: 166,
      bankName: 'Chase Bank',
      accountNumber: '**** **** 4192'
    },
    {
      employeeId: 'EMP-1003',
      name: 'Marcus Chen',
      email: 'marcus@dayflow.com',
      role: 'manager',
      department: 'Design & UX',
      designation: 'Lead Product Designer',
      joiningDate: '2022-06-01',
      managerId: 'EMP-1001',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 456-7890',
      address: '88 King St, Seattle, WA',
      baseSalary: 7800,
      hra: 2600,
      specialAllowance: 1200,
      transportAllowance: 400,
      pfDeduction: 936,
      taxDeduction: 1320,
      otherDeductions: 144,
      bankName: 'Bank of America',
      accountNumber: '**** **** 7234'
    },
    {
      employeeId: 'EMP-1004',
      name: 'Sarah Jenkins',
      email: 'sarah@dayflow.com',
      role: 'manager',
      department: 'Engineering',
      designation: 'VP of Engineering',
      joiningDate: '2021-08-15',
      managerId: 'EMP-1001',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 567-8901',
      address: '412 Valencia St, San Francisco, CA',
      baseSalary: 11000,
      hra: 3500,
      specialAllowance: 2200,
      transportAllowance: 500,
      pfDeduction: 1320,
      taxDeduction: 2100,
      otherDeductions: 280,
      bankName: 'First Republic Bank',
      accountNumber: '**** **** 3391'
    },
    {
      employeeId: 'EMP-1005',
      name: 'Sophia Rodriguez',
      email: 'sophia@dayflow.com',
      role: 'employee',
      department: 'Marketing',
      designation: 'Product Marketing Manager',
      joiningDate: '2022-09-15',
      managerId: 'EMP-1001',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 678-9012',
      address: '500 Howard St, San Francisco, CA',
      baseSalary: 7200,
      hra: 2400,
      specialAllowance: 1100,
      transportAllowance: 350,
      pfDeduction: 864,
      taxDeduction: 1200,
      otherDeductions: 136,
      bankName: 'Wells Fargo',
      accountNumber: '**** **** 9012'
    },
    {
      employeeId: 'EMP-1006',
      name: 'Devon Knight',
      email: 'devon@dayflow.com',
      role: 'employee',
      department: 'Engineering',
      designation: 'DevOps & Cloud Architect',
      joiningDate: '2023-02-01',
      managerId: 'EMP-1004',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 789-0123',
      address: '320 Austin Blvd, Austin, TX',
      baseSalary: 8500,
      hra: 2800,
      specialAllowance: 1600,
      transportAllowance: 400,
      pfDeduction: 1020,
      taxDeduction: 1520,
      otherDeductions: 160,
      bankName: 'Citibank',
      accountNumber: '**** **** 5561'
    },
    {
      employeeId: 'EMP-1007',
      name: 'Maya Patel',
      email: 'maya@dayflow.com',
      role: 'admin',
      department: 'Human Resources',
      designation: 'HR Operations Specialist',
      joiningDate: '2023-04-10',
      managerId: 'EMP-1001',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 890-1234',
      address: '210 Mission St, San Francisco, CA',
      baseSalary: 6800,
      hra: 2200,
      specialAllowance: 1000,
      transportAllowance: 300,
      pfDeduction: 816,
      taxDeduction: 1100,
      otherDeductions: 134,
      bankName: 'Silicon Valley Bank',
      accountNumber: '**** **** 6781'
    },
    {
      employeeId: 'EMP-1008',
      name: 'Liam O\'Connor',
      email: 'liam@dayflow.com',
      role: 'employee',
      department: 'Engineering',
      designation: 'Backend Engineer',
      joiningDate: '2023-07-01',
      managerId: 'EMP-1004',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 901-2345',
      address: '15 Beacon St, Boston, MA',
      baseSalary: 7400,
      hra: 2500,
      specialAllowance: 1200,
      transportAllowance: 350,
      pfDeduction: 888,
      taxDeduction: 1280,
      otherDeductions: 132,
      bankName: 'Chase Bank',
      accountNumber: '**** **** 8119'
    },
    {
      employeeId: 'EMP-1009',
      name: 'Emma Watson',
      email: 'emma@dayflow.com',
      role: 'employee',
      department: 'Engineering',
      designation: 'Frontend Developer',
      joiningDate: '2023-09-01',
      managerId: 'EMP-1004',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 012-3456',
      address: '900 Broadway, New York, NY',
      baseSalary: 7100,
      hra: 2400,
      specialAllowance: 1100,
      transportAllowance: 350,
      pfDeduction: 852,
      taxDeduction: 1200,
      otherDeductions: 148,
      bankName: 'TD Bank',
      accountNumber: '**** **** 2091'
    },
    {
      employeeId: 'EMP-1010',
      name: 'Noah Kim',
      email: 'noah@dayflow.com',
      role: 'employee',
      department: 'Engineering',
      designation: 'QA Automation Engineer',
      joiningDate: '2023-11-15',
      managerId: 'EMP-1004',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 123-4567',
      address: '710 Pine St, San Francisco, CA',
      baseSalary: 6700,
      hra: 2200,
      specialAllowance: 1000,
      transportAllowance: 300,
      pfDeduction: 804,
      taxDeduction: 1120,
      otherDeductions: 126,
      bankName: 'Bank of America',
      accountNumber: '**** **** 9441'
    },
    {
      employeeId: 'EMP-1011',
      name: 'Lucas Silva',
      email: 'lucas@dayflow.com',
      role: 'employee',
      department: 'Product',
      designation: 'Senior Product Manager',
      joiningDate: '2022-03-01',
      managerId: 'EMP-1001',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 234-5670',
      address: '1020 Folsom St, San Francisco, CA',
      baseSalary: 8600,
      hra: 2900,
      specialAllowance: 1600,
      transportAllowance: 400,
      pfDeduction: 1032,
      taxDeduction: 1550,
      otherDeductions: 168,
      bankName: 'Capital One',
      accountNumber: '**** **** 1290'
    },
    {
      employeeId: 'EMP-1012',
      name: 'Chloe Bennett',
      email: 'chloe@dayflow.com',
      role: 'employee',
      department: 'Sales',
      designation: 'Enterprise Account Executive',
      joiningDate: '2022-08-01',
      managerId: 'EMP-1001',
      avatar: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 345-6780',
      address: '540 Michigan Ave, Chicago, IL',
      baseSalary: 7900,
      hra: 2600,
      specialAllowance: 1300,
      transportAllowance: 400,
      pfDeduction: 948,
      taxDeduction: 1380,
      otherDeductions: 152,
      bankName: 'Chase Bank',
      accountNumber: '**** **** 7712'
    }
  ];

  const users = [];
  const employees = [];
  const leaveBalances = [];

  for (const emp of rawEmployees) {
    const userId = `usr-${emp.employeeId.toLowerCase()}`;
    const employeeRecordId = emp.employeeId;

    const gross = emp.baseSalary + emp.hra + emp.specialAllowance + emp.transportAllowance;
    const deductions = emp.pfDeduction + emp.taxDeduction + emp.otherDeductions;
    const net = gross - deductions;

    users.push({
      id: userId,
      organizationId: ORG_ID,
      employeeId: employeeRecordId,
      email: emp.email.toLowerCase(),
      passwordHash: defaultPasswordHash,
      role: emp.role,
      status: 'Active',
      createdAt: '2024-01-01T00:00:00.000Z'
    });

    employees.push({
      id: employeeRecordId,
      organizationId: ORG_ID,
      userId: userId,
      employeeId: employeeRecordId,
      name: emp.name,
      email: emp.email.toLowerCase(),
      role: emp.role,
      department: emp.department,
      designation: emp.designation,
      managerId: emp.managerId,
      joiningDate: emp.joiningDate,
      status: 'Active',
      avatar: emp.avatar,
      personalDetails: {
        phone: emp.phone,
        address: emp.address,
        dob: '1992-05-18',
        gender: emp.name.includes('Eleanor') || emp.name.includes('Sophia') || emp.name.includes('Maya') || emp.name.includes('Emma') || emp.name.includes('Chloe') ? 'Female' : 'Male',
        maritalStatus: 'Single',
        emergencyContact: 'Family Contact (+1 555-999-0000)',
        bloodGroup: 'O+'
      },
      jobDetails: {
        department: emp.department,
        designation: emp.designation,
        manager: emp.managerId ? rawEmployees.find(r => r.employeeId === emp.managerId)?.name || 'Executive Staff' : 'Board of Directors',
        workLocation: emp.name.includes('Alex') || emp.name.includes('Devon') ? 'Remote (Global)' : 'San Francisco HQ',
        employmentType: 'Full-time',
        workSchedule: '09:00 AM - 06:00 PM (Mon-Fri)',
        shiftId: 'shift-morning'
      },
      salaryStructure: {
        baseSalary: emp.baseSalary,
        hra: emp.hra,
        specialAllowance: emp.specialAllowance,
        transportAllowance: emp.transportAllowance,
        pfDeduction: emp.pfDeduction,
        taxDeduction: emp.taxDeduction,
        otherDeductions: emp.otherDeductions,
        grossSalary: gross,
        totalDeductions: deductions,
        netSalary: net,
        bankName: emp.bankName,
        accountNumber: emp.accountNumber,
        ifscCode: 'SVB000491',
        pan: `DAYFLOW${emp.employeeId.replace('EMP-', '')}X`
      },
      onboardingCompleted: true,
      profileCompletion: 100,
      documents: [
        { id: `doc-${emp.employeeId}-1`, title: 'Employment Contract', category: 'Contract', fileName: 'contract.pdf', fileSize: '2.4 MB', uploadedAt: emp.joiningDate }
      ]
    });

    leaveBalances.push({
      id: `lb-${emp.employeeId}`,
      organizationId: ORG_ID,
      employeeId: employeeRecordId,
      year: 2026,
      paid: { total: 18, used: emp.employeeId === 'EMP-1002' ? 4 : 2, remaining: emp.employeeId === 'EMP-1002' ? 14 : 16 },
      sick: { total: 12, used: emp.employeeId === 'EMP-1002' ? 3 : 1, remaining: emp.employeeId === 'EMP-1002' ? 9 : 11 },
      casual: { total: 8, used: 1, remaining: 7 },
      unpaid: { total: 5, used: 0, remaining: 5 }
    });
  }

  // Today string
  const today = new Date().toISOString().split('T')[0];

  // Helper date generator for recent days
  const getDateDaysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const attendance = [
    // Today's Punches
    {
      id: `ATT-${today.replace(/-/g, '')}-1001`,
      organizationId: ORG_ID,
      employeeId: 'EMP-1001',
      employeeName: 'Eleanor Vance',
      department: 'Human Resources',
      date: today,
      checkIn: '08:50 AM',
      checkOut: null,
      workHours: 'In Progress',
      workedMinutes: 240,
      overtimeMinutes: 0,
      status: 'Present',
      workMode: 'Office'
    },
    {
      id: `ATT-${today.replace(/-/g, '')}-1002`,
      organizationId: ORG_ID,
      employeeId: 'EMP-1002',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      date: today,
      checkIn: '09:05 AM',
      checkOut: null,
      workHours: 'In Progress',
      workedMinutes: 225,
      overtimeMinutes: 0,
      status: 'Present',
      workMode: 'Remote'
    },
    {
      id: `ATT-${today.replace(/-/g, '')}-1003`,
      organizationId: ORG_ID,
      employeeId: 'EMP-1003',
      employeeName: 'Marcus Chen',
      department: 'Design & UX',
      date: today,
      checkIn: '09:12 AM',
      checkOut: null,
      workHours: 'In Progress',
      workedMinutes: 218,
      overtimeMinutes: 0,
      status: 'Present',
      workMode: 'Office'
    },
    {
      id: `ATT-${today.replace(/-/g, '')}-1004`,
      organizationId: ORG_ID,
      employeeId: 'EMP-1004',
      employeeName: 'Sarah Jenkins',
      department: 'Engineering',
      date: today,
      checkIn: '08:45 AM',
      checkOut: null,
      workHours: 'In Progress',
      workedMinutes: 245,
      overtimeMinutes: 0,
      status: 'Present',
      workMode: 'Office'
    },
    {
      id: `ATT-${today.replace(/-/g, '')}-1005`,
      organizationId: ORG_ID,
      employeeId: 'EMP-1005',
      employeeName: 'Sophia Rodriguez',
      department: 'Marketing',
      date: today,
      checkIn: '-',
      checkOut: '-',
      workHours: '0h 0m',
      workedMinutes: 0,
      overtimeMinutes: 0,
      status: 'Leave',
      workMode: 'On Leave'
    },
    {
      id: `ATT-${today.replace(/-/g, '')}-1006`,
      organizationId: ORG_ID,
      employeeId: 'EMP-1006',
      employeeName: 'Devon Knight',
      department: 'Engineering',
      date: today,
      checkIn: '09:40 AM',
      checkOut: null,
      workHours: 'In Progress',
      workedMinutes: 190,
      overtimeMinutes: 0,
      status: 'Late',
      workMode: 'Remote'
    },
    // Past attendance logs (e.g. yesterday, 2 days ago, 3 days ago)
    {
      id: `ATT-${getDateDaysAgo(1).replace(/-/g, '')}-1002`,
      organizationId: ORG_ID,
      employeeId: 'EMP-1002',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      date: getDateDaysAgo(1),
      checkIn: '09:00 AM',
      checkOut: '06:10 PM',
      workHours: '9h 10m',
      workedMinutes: 550,
      overtimeMinutes: 10,
      status: 'Present',
      workMode: 'Office'
    },
    {
      id: `ATT-${getDateDaysAgo(2).replace(/-/g, '')}-1002`,
      organizationId: ORG_ID,
      employeeId: 'EMP-1002',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      date: getDateDaysAgo(2),
      checkIn: '09:15 AM',
      checkOut: '06:00 PM',
      workHours: '8h 45m',
      workedMinutes: 525,
      overtimeMinutes: 0,
      status: 'Present',
      workMode: 'Remote'
    },
    {
      id: `ATT-${getDateDaysAgo(3).replace(/-/g, '')}-1002`,
      organizationId: ORG_ID,
      employeeId: 'EMP-1002',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      date: getDateDaysAgo(3),
      checkIn: '08:55 AM',
      checkOut: '06:20 PM',
      workHours: '9h 25m',
      workedMinutes: 565,
      overtimeMinutes: 25,
      status: 'Present',
      workMode: 'Office'
    },
    {
      id: `ATT-${getDateDaysAgo(4).replace(/-/g, '')}-1002`,
      organizationId: ORG_ID,
      employeeId: 'EMP-1002',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      date: getDateDaysAgo(4),
      checkIn: '09:30 AM',
      checkOut: '01:45 PM',
      workHours: '4h 15m',
      workedMinutes: 255,
      overtimeMinutes: 0,
      status: 'Half-day',
      workMode: 'Office'
    }
  ];

  const attendanceCorrections = [
    {
      id: 'cor-1',
      organizationId: ORG_ID,
      employeeId: 'EMP-1006',
      employeeName: 'Devon Knight',
      attendanceId: `ATT-${getDateDaysAgo(2).replace(/-/g, '')}-1006`,
      date: getDateDaysAgo(2),
      requestedCheckIn: '09:00 AM',
      requestedCheckOut: '06:00 PM',
      reason: 'Network disconnect during evening remote checkout',
      status: 'Pending',
      adminNotes: '',
      createdAt: new Date().toISOString()
    }
  ];

  const leaves = [
    {
      id: 'LR-101',
      organizationId: ORG_ID,
      employeeId: 'EMP-1002',
      employeeName: 'Alex Rivera',
      employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      department: 'Engineering',
      leaveType: 'Paid',
      fromDate: '2026-09-21',
      toDate: '2026-09-23',
      days: 3,
      isHalfDay: false,
      reason: 'Attending annual full-stack engineering conference and tech summit',
      status: 'Pending',
      adminComment: '',
      appliedOn: today
    },
    {
      id: 'LR-102',
      organizationId: ORG_ID,
      employeeId: 'EMP-1005',
      employeeName: 'Sophia Rodriguez',
      employeeAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      department: 'Marketing',
      leaveType: 'Casual',
      fromDate: today,
      toDate: today,
      days: 1,
      isHalfDay: false,
      reason: 'Personal family appointment',
      status: 'Approved',
      adminComment: 'Approved by HR Director Vance',
      appliedOn: getDateDaysAgo(2)
    },
    {
      id: 'LR-103',
      organizationId: ORG_ID,
      employeeId: 'EMP-1006',
      employeeName: 'Devon Knight',
      employeeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      department: 'Engineering',
      leaveType: 'Sick',
      fromDate: getDateDaysAgo(7),
      toDate: getDateDaysAgo(6),
      days: 2,
      isHalfDay: false,
      reason: 'Severe seasonal flu with doctor medical certificate',
      status: 'Approved',
      adminComment: 'Medical certificate verified',
      appliedOn: getDateDaysAgo(8)
    },
    {
      id: 'LR-104',
      organizationId: ORG_ID,
      employeeId: 'EMP-1008',
      employeeName: 'Liam O\'Connor',
      employeeAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      department: 'Engineering',
      leaveType: 'Paid',
      fromDate: getDateDaysAgo(15),
      toDate: getDateDaysAgo(12),
      days: 4,
      isHalfDay: false,
      reason: 'Family trip',
      status: 'Rejected',
      adminComment: 'Overlaps with critical Q3 production release freeze',
      appliedOn: getDateDaysAgo(18)
    }
  ];

  const payrollRuns = [
    {
      id: 'pr-2026-08',
      organizationId: ORG_ID,
      month: 'August 2026',
      year: 2026,
      totalEmployees: 12,
      totalGross: 121500,
      totalDeductions: 28400,
      totalNet: 93100,
      status: 'Published',
      generatedAt: '2026-08-25T10:00:00.000Z',
      lockedAt: '2026-08-28T14:00:00.000Z',
      publishedAt: '2026-08-31T09:00:00.000Z'
    },
    {
      id: 'pr-2026-09',
      organizationId: ORG_ID,
      month: 'September 2026',
      year: 2026,
      totalEmployees: 12,
      totalGross: 121500,
      totalDeductions: 28400,
      totalNet: 93100,
      status: 'Draft',
      generatedAt: '2026-09-10T11:00:00.000Z',
      lockedAt: null,
      publishedAt: null
    }
  ];

  const payslips = rawEmployees.map(emp => {
    const gross = emp.baseSalary + emp.hra + emp.specialAllowance + emp.transportAllowance;
    const deductions = emp.pfDeduction + emp.taxDeduction + emp.otherDeductions;
    const net = gross - deductions;

    return {
      id: `ps-202608-${emp.employeeId}`,
      organizationId: ORG_ID,
      payrollRunId: 'pr-2026-08',
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.department,
      designation: emp.designation,
      month: 'August 2026',
      year: 2026,
      baseSalary: emp.baseSalary,
      hra: emp.hra,
      specialAllowance: emp.specialAllowance,
      transportAllowance: emp.transportAllowance,
      bonus: 0,
      otherEarnings: 0,
      grossSalary: gross,
      totalDeductions: deductions,
      pfDeduction: emp.pfDeduction,
      taxDeduction: emp.taxDeduction,
      otherDeductions: emp.otherDeductions,
      lossOfPay: 0,
      netSalary: net,
      bankName: emp.bankName,
      accountNumber: emp.accountNumber,
      ifscCode: 'SVB000491',
      pan: `DAYFLOW${emp.employeeId.replace('EMP-', '')}X`,
      status: 'Disbursed',
      generatedAt: '2026-08-25T10:00:00.000Z'
    };
  });

  const announcements = [
    {
      id: 'ann-1',
      organizationId: ORG_ID,
      title: '🎉 Dayflow Q3 All-Hands & Product Roadmap Presentation',
      content: 'Join us this Friday at 4:00 PM PST for the company town hall celebrating our new HRMS 2.0 rollout and Q3 strategic achievements.',
      date: today,
      publishDate: today,
      expiryDate: '2026-10-01',
      priority: 'High',
      category: 'Company Event',
      author: 'Eleanor Vance (CHRO)'
    },
    {
      id: 'ann-2',
      organizationId: ORG_ID,
      title: '🌴 Upcoming Labor Day Public Holiday Office Closure',
      content: 'The office will remain closed on Monday, September 7th for Labor Day. Paid time off is automatically applied for all team members.',
      date: getDateDaysAgo(2),
      publishDate: getDateDaysAgo(2),
      expiryDate: '2026-09-10',
      priority: 'Normal',
      category: 'Holiday',
      author: 'HR Operations'
    },
    {
      id: 'ann-3',
      organizationId: ORG_ID,
      title: '🔒 Annual SOC2 Security Compliance Refresher Due',
      content: 'Please ensure you have completed the annual security training modules before month end in compliance with our enterprise audit standards.',
      date: getDateDaysAgo(5),
      publishDate: getDateDaysAgo(5),
      expiryDate: '2026-09-30',
      priority: 'Urgent',
      category: 'Compliance',
      author: 'IT Security'
    }
  ];

  const notifications = [
    {
      id: 'notif-1',
      organizationId: ORG_ID,
      userId: 'usr-emp-1001',
      employeeId: 'EMP-1001',
      type: 'leave',
      title: 'New Leave Application',
      message: 'Alex Rivera applied for 3 days of Paid Leave (Sep 21 - Sep 23).',
      link: '/leave-approvals',
      read: false,
      createdAt: '10 mins ago'
    },
    {
      id: 'notif-2',
      organizationId: ORG_ID,
      userId: 'usr-emp-1001',
      employeeId: 'EMP-1001',
      type: 'attendance',
      title: 'Attendance Correction Request',
      message: 'Devon Knight requested an attendance regularization for checkout time.',
      link: '/attendance',
      read: false,
      createdAt: '2 hours ago'
    },
    {
      id: 'notif-3',
      organizationId: ORG_ID,
      userId: 'usr-emp-1002',
      employeeId: 'EMP-1002',
      type: 'payroll',
      title: 'August Payslip Disbursed',
      message: 'Your August 2026 payslip is ready for viewing and download.',
      link: '/payroll',
      read: true,
      createdAt: 'Yesterday'
    }
  ];

  const auditLogs = [
    {
      id: 'aud-1',
      organizationId: ORG_ID,
      actorId: 'EMP-1001',
      actorName: 'Eleanor Vance',
      actorRole: 'super_admin',
      action: 'PAYROLL_PUBLISHED',
      entity: 'PayrollRun',
      entityId: 'pr-2026-08',
      metadata: { month: 'August 2026', totalEmployees: 12, totalNet: 93100 },
      ipAddress: '192.168.1.10',
      timestamp: '2026-08-31T09:00:00.000Z'
    },
    {
      id: 'aud-2',
      organizationId: ORG_ID,
      actorId: 'EMP-1001',
      actorName: 'Eleanor Vance',
      actorRole: 'super_admin',
      action: 'LEAVE_APPROVED',
      entity: 'LeaveRequest',
      entityId: 'LR-102',
      metadata: { employee: 'Sophia Rodriguez', days: 1, leaveType: 'Casual' },
      ipAddress: '192.168.1.10',
      timestamp: getDateDaysAgo(2)
    },
    {
      id: 'aud-3',
      organizationId: ORG_ID,
      actorId: 'EMP-1001',
      actorName: 'Eleanor Vance',
      actorRole: 'super_admin',
      action: 'EMPLOYEE_CREATED',
      entity: 'Employee',
      entityId: 'EMP-1012',
      metadata: { employeeName: 'Chloe Bennett', designation: 'Enterprise Account Executive' },
      ipAddress: '192.168.1.10',
      timestamp: '2024-08-01T10:00:00.000Z'
    }
  ];

  // Save everything into database
  db.reset({
    organizations: [organization],
    departments,
    designations,
    shifts,
    holidays,
    users,
    employees,
    leave_balances: leaveBalances,
    attendance,
    attendance_corrections: attendanceCorrections,
    leaves,
    payroll_runs: payrollRuns,
    payslips,
    documents: [],
    announcements,
    notifications,
    audit_logs: auditLogs
  });

  console.log('✅ Dayflow HRMS 2.0 database successfully initialized & seeded!');
}
