# Book a Doctor - REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Module (`/auth`)

### 1.1 Register User
- **Route**: `POST /register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "drjanesmith@bookadoctor.com",
  "password": "doctor123",
  "role": "doctor", 
  "phone": "9876543210"
}
```
*Note: `role` can be `patient` (default) or `doctor`. Registering as a doctor automatically instantiates an approved-pending doctor profile record.*

- **Response (201 Created)**:
```json
{
  "success": true,
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "id": "60d0fe2c58962c00155a3031",
    "name": "Jane Smith",
    "email": "drjanesmith@bookadoctor.com",
    "role": "doctor",
    "phone": "9876543210"
  }
}
```

### 1.2 Login User
- **Route**: `POST /login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "drjanesmith@bookadoctor.com",
  "password": "doctor123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "id": "60d0fe2c58962c00155a3031",
    "name": "Dr. Jane Smith",
    "email": "drjanesmith@bookadoctor.com",
    "role": "doctor",
    "phone": "9876543210",
    "doctorProfile": {
      "_id": "60d0fe2c58962c00155a3032",
      "userId": "60d0fe2c58962c00155a3031",
      "specialization": "Cardiology",
      "qualification": "MD",
      "experience": 12,
      "hospital": "Metro Hospital",
      "consultationFee": 1000,
      "approvalStatus": "approved"
    }
  }
}
```

### 1.3 Logout User
- **Route**: `POST /logout`
- **Access**: Private (Authenticated)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 1.4 Forgot Password
- **Route**: `POST /forgot-password`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "drjanesmith@bookadoctor.com"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password reset token generated. In production, this goes to email.",
  "resetToken": "f784d16858e..."
}
```

### 1.5 Reset Password
- **Route**: `POST /reset-password`
- **Access**: Public
- **Request Body**:
```json
{
  "token": "f784d16858e...",
  "newPassword": "newsecurepassword123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

### 1.6 Get Profile
- **Route**: `GET /profile`
- **Access**: Private (Authenticated)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "60d0fe2c58962c00155a3031",
    "name": "Dr. Jane Smith",
    "email": "drjanesmith@bookadoctor.com",
    "role": "doctor",
    "phone": "9876543210",
    "doctorProfile": { ... }
  }
}
```

### 1.7 Update Profile
- **Route**: `PUT /profile`
- **Access**: Private (Authenticated)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body** (optional fields):
```json
{
  "name": "Dr. Jane A. Smith",
  "phone": "9111111111",
  "hospital": "City Cardiology Center",
  "consultationFee": 1100
}
```
*Note: Both core User settings and Doctor practice settings (if role is doctor) are updated dynamically.*

---

## 2. Doctors Module (`/doctors`)

### 2.1 Get Approved Doctors (List & Search)
- **Route**: `GET /`
- **Access**: Public
- **Query Parameters (Filters)**:
  - `search`: Searches name, hospital, specialization.
  - `specialization`: Exact clinical specialty (e.g., `Cardiology`).
  - `hospital`: Matches clinic.
  - `experience`: Minimum years (GTE).
  - `minFee` / `maxFee`: Consultation fee ranges.
  - `sortBy`: Sorting order (`fee_low`, `fee_high`, `experience`).
  - `page`: Page number (default 1).
  - `limit`: Items per page (default 10).
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 1,
  "pagination": { "total": 1, "page": 1, "pages": 1, "limit": 10 },
  "doctors": [ ... ]
}
```

---

## 3. Appointments Module (`/appointments`)

### 3.1 Book Appointment
- **Route**: `POST /`
- **Access**: Private (Patient only)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
```json
{
  "doctorId": "60d0fe2c58962c00155a3032",
  "date": "2026-06-25",
  "time": "10:00 AM - 11:00 AM",
  "reason": "General heart checkup"
}
```
- **Response (210 Created)**:
```json
{
  "success": true,
  "message": "Appointment booked successfully. Status: Pending approval.",
  "appointment": { ... }
}
```

### 3.2 Update Appointment (Reschedule / Cancel)
- **Route**: `PUT /:id`
- **Access**: Private (Patient owner, Doctor owner, Admin)
- **Request Body**:
```json
{
  "status": "Cancelled"
}
```
*Note: Doctors can transition status to `Approved`, `Rejected`, `Completed`. Patients can cancel or reschedule.*

---

## 4. Medical Reports Locker (`/reports`)

### 4.1 Upload Report File
- **Route**: `POST /upload`
- **Access**: Private (Patient only)
- **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: multipart/form-data`
- **Form-Data**:
  - `doctorId`: "60d0fe2c58962c00155a3032"
  - `reportFile`: `<binary file (pdf/jpg)>`
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Report uploaded successfully",
  "report": {
    "_id": "60d0fe2c58962c00155a3055",
    "patientId": "60d0fe2c58962c00155a3025",
    "doctorId": "60d0fe2c58962c00155a3032",
    "fileUrl": "/uploads/reportFile-1718712390-1234.pdf",
    "fileName": "blood_report.pdf",
    "fileType": "PDF"
  }
}
```

---

## 5. Admin Console (`/admin`)

### 5.1 Admin Stats Overview
- **Route**: `GET /dashboard`
- **Access**: Private (Admin only)
- **Response (200 OK)**:
```json
{
  "success": true,
  "stats": {
    "users": { "total": 6, "patients": 2, "doctors": 3 },
    "doctorsByStatus": { "pending": 1, "approved": 2, "rejected": 0 },
    "appointmentsByStatus": { "Pending": 1, "Approved": 1, "Completed": 1, "Cancelled": 0 },
    "totalRevenue": 700,
    "recentAppointments": [ ... ]
  }
}
```
