const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

dotenv.config();

// Seeder Data
const usersData = [
  {
    name: 'System Admin',
    email: 'admin@bookadoctor.com',
    password: 'admin123',
    role: 'admin',
    phone: '1234567890'
  },
  {
    name: 'Dr. Jane Smith',
    email: 'drjanesmith@bookadoctor.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '9876543210'
  },
  {
    name: 'Dr. Robert Chen',
    email: 'drrobertchen@bookadoctor.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '8765432109'
  },
  {
    name: 'Dr. Sarah Jenkins',
    email: 'drsarahj@bookadoctor.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '7654321098'
  },
  {
    name: 'John Doe',
    email: 'johndoe@gmail.com',
    password: 'patient123',
    role: 'patient',
    phone: '5551234567'
  },
  {
    name: 'Mary Jane',
    email: 'maryjane@gmail.com',
    password: 'patient123',
    role: 'patient',
    phone: '5557654321'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book-a-doctor');
    console.log('Database connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();
    await Report.deleteMany();
    await Notification.deleteMany();
    console.log('Previous database records cleared.');

    // 1. Create Users (this will run bcrypt pre-save hashing)
    const createdUsers = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} seed users (passwords encrypted).`);

    // Extract User IDs
    const drSmith = createdUsers.find(u => u.email === 'drjanesmith@bookadoctor.com');
    const drChen = createdUsers.find(u => u.email === 'drrobertchen@bookadoctor.com');
    const drSarah = createdUsers.find(u => u.email === 'drsarahj@bookadoctor.com');
    const patientJohn = createdUsers.find(u => u.email === 'johndoe@gmail.com');
    const patientMary = createdUsers.find(u => u.email === 'maryjane@gmail.com');

    // 2. Create Doctor Profiles
    const doctorProfiles = [
      {
        userId: drSmith._id,
        specialization: 'Cardiology',
        qualification: 'MD, FACC',
        experience: 12,
        hospital: 'Metro Heart Institute',
        consultationFee: 1000,
        profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=250&auto=format&fit=crop',
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableTimeSlots: ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '03:00 PM - 04:00 PM'],
        approvalStatus: 'approved'
      },
      {
        userId: drChen._id,
        specialization: 'Pediatrics',
        qualification: 'MD, DCH',
        experience: 8,
        hospital: 'St. Jude Children Hospital',
        consultationFee: 700,
        profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop',
        availableDays: ['Tuesday', 'Thursday'],
        availableTimeSlots: ['11:00 AM - 12:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM'],
        approvalStatus: 'approved'
      },
      {
        userId: drSarah._id,
        specialization: 'Dermatology',
        qualification: 'MBBS, MD (Skin)',
        experience: 5,
        hospital: 'DermaCare Laser Clinic',
        consultationFee: 1200,
        profileImage: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=250&auto=format&fit=crop',
        availableDays: ['Monday', 'Tuesday', 'Wednesday'],
        availableTimeSlots: ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM'],
        approvalStatus: 'pending' // Pending approval for admin review testing
      }
    ];

    const seededDoctors = await Doctor.insertMany(doctorProfiles);
    console.log(`Created ${seededDoctors.length} doctor profiles.`);

    // 3. Create Seed Appointments
    const docSmithProfile = seededDoctors.find(d => d.userId.toString() === drSmith._id.toString());
    const docChenProfile = seededDoctors.find(d => d.userId.toString() === drChen._id.toString());

    const appointmentsData = [
      {
        doctorId: docSmithProfile._id,
        patientId: patientJohn._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '10:00 AM - 11:00 AM',
        reason: 'Routine cardiac health screening.',
        status: 'Approved'
      },
      {
        doctorId: docSmithProfile._id,
        patientId: patientMary._id,
        date: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        time: '09:00 AM - 10:00 AM',
        reason: 'Consultation for high blood pressure symptoms.',
        status: 'Pending'
      },
      {
        doctorId: docChenProfile._id,
        patientId: patientJohn._id,
        date: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
        time: '11:00 AM - 12:00 PM',
        reason: 'Childhood vaccination follow up.',
        status: 'Completed',
        prescription: 'Vaccinated. Child is active. Review in 3 months.'
      }
    ];

    await Appointment.insertMany(appointmentsData);
    console.log('Created seed appointments.');

    // 4. Create Seed Notifications
    const notificationsData = [
      {
        userId: drSmith._id,
        message: 'New appointment request from Mary Jane for day after tomorrow at 09:00 AM',
        read: false
      },
      {
        userId: patientJohn._id,
        message: 'Your appointment with Dr. Robert Chen is completed.',
        read: true
      }
    ];

    await Notification.insertMany(notificationsData);
    console.log('Created seed notifications.');

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
