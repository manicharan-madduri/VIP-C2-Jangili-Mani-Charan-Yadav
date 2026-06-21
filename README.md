# Book a Doctor - Full Stack MERN Healthcare Booking Platform

"Book a Doctor" is a production-ready web application built using the MERN stack (MongoDB, Express, React, Node.js) with Bootstrap 5. It establishes a secure channel between patients, medical practitioners, and system administrators, enabling scheduling, digital medical locker storage, and prescription auditing.

---

## 🚀 Key Features

- **Patient Portal**: Search approved doctors with complex filters (experience, consultation fee range, specialties, hospitals), book appointments with double-booking prevention, upload medical records (PDFs/Images) sharing them with assigned doctors, view clinical prescriptions.
- **Doctor Portal**: Manage practice details, consultation hours and slot schedules, review bookings, approve/reject requests, and write digital prescriptions.
- **Admin Console**: Monitor platform-wide diagnostics (revenue volume, user counts), review doctor credential details, approve/reject pending registrations, and delete/suspend accounts.
- **Security & UX**: Complete Light/Dark mode toggler, JWT access/refresh token authentications, Role-Based Access Control (RBAC) middlewares, input validations, custom glassmorphism components, and dynamic in-app notifications.

---

## 📂 Project Architecture

```text
book-a-doctor/
├── backend/
│   ├── config/             # DB & Multer upload config
│   ├── controllers/        # Route controllers (auth, doctor, patient, appointment, report, admin)
│   ├── middleware/         # JWT auth guards, role checkers, Multer file filters, error interceptors
│   ├── models/             # Mongoose schemas (User, Doctor, Appointment, Report, Notification)
│   ├── routes/             # Route endpoint routers
│   ├── services/           # In-app notification logging service
│   ├── utils/              # JWT helpers, Custom Error classes, Database seeders
│   ├── validators/         # express-validator rules
│   ├── tests/              # Jest/Supertest integration suites
│   ├── uploads/            # Local reports and file storage folder
│   ├── app.js              # Express app config
│   └── server.js           # Server startup script
├── frontend/
│   ├── public/             # HTML template & assets
│   ├── src/
│   │   ├── api/            # Axios interceptor instance
│   │   ├── components/     # Navbar, Footer, Route Protectors, Modals
│   │   ├── context/        # Auth context, Theme (Light/Dark) provider
│   │   ├── pages/          # Home, Dashboards, Listings, Profiles, Login, Register
│   │   ├── App.css         # Styling, glassmorphic card utilities, animations
│   │   ├── App.js          # Core Router mapping
│   │   └── index.js        # React DOM render mount
│   └── package.json
└── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (Local Community Server or Atlas Cluster)

### 1. Database & Backend Configuration
1. Navigate into the backend folder:
   ```bash
   cd backend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Configure your environment variables. Rename or create a `.env` file inside `backend/` and configure:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/book-a-doctor
   JWT_SECRET=yoursecretaccesskey
   JWT_REFRESH_SECRET=yoursecretrefreshkey
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   UPLOAD_PATH=uploads
   ```

### 2. Seed Mock Data (Optional but Recommended)
To seed mock doctors, patients, upcoming bookings, and an administrator, run the database seeder script:
```bash
npm run seed
```
**Default Seed Accounts**:
- **Admin**: `admin@bookadoctor.com` / Password: `admin123`
- **Approved Doctor**: `drjanesmith@bookadoctor.com` / Password: `doctor123`
- **Patient**: `johndoe@gmail.com` / Password: `patient123`

### 3. Run Backend Server
- To start the server in development mode (with nodemon):
  ```bash
  npm run dev
  ```
- To start the server in production mode:
  ```bash
  npm run start
  ```

### 4. Run Backend Tests
Run the API integration tests (using Jest and Supertest):
```bash
npm run test
```

---

### 5. Frontend Configuration & Running
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the React development dev-server:
   ```bash
   npm start
   ```
4. Access the application in your browser at: `http://localhost:3000`

---

## 🚀 Production Deployment Guide

### Backend Hosting
1. Setup a production MongoDB instance (e.g. MongoDB Atlas) and obtain the connection URI.
2. Setup environment variables on your cloud provider (Heroku, Render, AWS, digitalOcean).
3. If using local storage upload on a cloud hosting with ephemeral filesystems (like Heroku), configure Multer to store uploads directly on **Cloudinary** or **AWS S3** by replacing the storage config in `backend/middleware/upload.js`.

### Frontend Build & Hosting
1. Build the production React assets:
   ```bash
   cd frontend
   npm run build
   ```
2. Serve the static assets inside `frontend/build/`:
   - **Static CDN Hosting (Preferred)**: Deploy to Vercel, Netlify, or AWS S3. Set the API base URL to your production backend.
   - **Express Static Routing (Single Dyno/VPS)**: Set up Express in `backend/app.js` to serve the React built folder:
     ```javascript
     app.use(express.static(path.join(__dirname, '../frontend/build')));
     app.get('*', (req, res) => {
       res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
     });
     ```
