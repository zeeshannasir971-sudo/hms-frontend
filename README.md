## Executive Summary
The Hospital Management System (HMS) is a comprehensive web-based application designed to streamline hospital operations, manage patient care, and provide efficient healthcare services. The system is built using modern technologies with a NestJS backend and Next.js frontend, providing a robust, scalable, and user-friendly platform for healthcare management.
## System Architecture
### Technology Stack
**Backend (hms-backend):**
- **Framework:** NestJS (Node.js)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer for profile pictures
- **Real-time:** WebSocket support for notifications
- **API Documentation:** RESTful API design

**Frontend (hms-frontend):**
- **Framework:** Next.js 13+ with App Router
- **Styling:** Tailwind CSS
- **State Management:** React Hooks and Context
- **HTTP Client:** Axios with interceptors
- **UI Components:** Custom component library
- **Authentication:** JWT token-based with localStorage

### Database Design

The system uses MongoDB with the following main collections:

1. **Users Collection** - Core user information and authentication
2. **Patients Collection** - Patient-specific medical information
3. **Doctors Collection** - Doctor profiles and specializations
4. **Appointments Collection** - Appointment scheduling and management
5. **Departments Collection** - Hospital departments and services
6. **Queue Collection** - Patient queue management system
7. **Medical Records Collection** - Patient medical history and records
8. **Notifications Collection** - System notifications and alerts
9. **System Settings Collection** - Application configuration
10. **Audit Logs Collection** - System activity tracking

## Core Modules Analysis

### 1. Authentication Module (`/modules/auth`)

**Purpose:** Handles user authentication, registration, and password management

**Key Features:**
- JWT-based authentication with role-based access control
- User registration with role-specific approval workflow
- Password reset functionality with 6-digit verification codes
- Hard-coded admin accounts for security
- Session management and token refresh

**API Endpoints:**
- `POST /auth/login` - User authentication
- `POST /auth/register` - New user registration
- `POST /auth/reset-password` - Initiate password reset
- `POST /auth/confirm-reset-password` - Complete password reset
- `POST /auth/logout` - User logout

**Security Features:**
- Password hashing with ecrypt
- JWT token expiration and validation
- Role-based route protection
- Admin accounts excluded from password reset
### 2. Users Module (`/modules/users`)

**Purpose:** Manages user profiles, permissions, and user-related operations
**Key Features:**
- User profile management with image upload
- Role-based permissions system
- User status management (active/inactive)
- Profile picture upload and storage
- User search and filtering

**User Roles:**
- **Admin:** Full system access and user management
- **Doctor:** Patient care, appointments, medical records
- **Staff:** Operational tasks, queue management, reports
- **Patient:** Appointment booking, medical record access

**Approval Workflow:**
- Doctors and Staff require admin approval before login
- Patients get immediate access upon registration
- Approval status tracking with timestamps and reasons

### 3. Appointments Module (`/modules/appointments`)

**Purpose:** Manages appointment scheduling, availability, and appointment lifecycle

**Key Features:**
- Appointment creation and scheduling
- Doctor availability management
- Appointment status tracking (scheduled, completed, cancelled)
- Time slot management and conflict prevention
- Appointment history and reporting

**Appointment Statuses:**
- `scheduled` - Appointment booked and confirmed
- `completed` - Appointment finished successfully
- `cancelled` - Appointment cancelled by patient or doctor
- `no-show` - Patient didn't attend appointment

### 4. Queue Management Module (`/modules/queue`)

**Purpose:** Manages patient queues, wait times, and consultation flow

**Key Features:**
- Real-time queue position tracking
- Estimated wait time calculations
- Queue status management
- Doctor-specific queue handling
- Patient check-in and check-out

**Queue Statuses:**
- `waiting` - Patient in queue waiting for consultation
- `in-consultation` - Patient currently with doctor
- `completed` - Consultation finished
- `cancelled` - Patient left queue

### 5. Doctors Module (`/modules/doctors`)

**Purpose:** Manages doctor profiles, specializations, and availability

**Key Features:**
- Doctor profile management
- Specialization and department assignment
- Availability scheduling
- Doctor performance tracking
- Patient assignment and management

**Doctor Information:**
- Personal and professional details
- Specialization and qualifications
- Department affiliation
- Availability schedule
- Patient consultation history
### 6. Departments Module (`/modules/departments`)

**Purpose:** Manages hospital departments and organizational structure

**Key Features:**
- Department creation and management
- Service categorization
- Department-specific reporting
- Resource allocation tracking
- Staff assignment to departments

### 7. Medical Records Module (`/modules/medical-records`)

**Purpose:** Manages patient medical history, diagnoses, and treatment records

**Key Features:**
- Comprehensive medical history tracking
- Diagnosis and treatment recording
- Prescription management
- Medical report generation
- Patient health summary

**Record Types:**
- Consultation notes
- Diagnostic results
- Treatment plans
- Prescription records
- Follow-up instructions

### 8. Notifications Module (`/modules/notifications`)
**Purpose:** Handles system notifications, alerts, and communication
**Key Features:**
- Real-time notification delivery
- Multi-channel notification support
- Notification history and management
- User preference settings
- System alert management

**Notification Types:**
- Appointment reminders
- Queue status updates
- System alerts
- Medical record updates
- Administrative notifications

### 9. Reports Module (`/modules/reports`)

**Purpose:** Generates comprehensive reports and analytics for different user roles

**Key Features:**
- Dashboard summaries for all roles
- Appointment volume reports
- Patient visit statistics
- Doctor performance analytics
- Queue analytics and wait time reports
- Revenue reporting (placeholder for billing integration)

**Report Types:**
- **Admin Reports:** System-wide statistics, user management, department performance
- **Doctor Reports:** Personal performance, patient statistics, appointment trends
- **Staff Reports:** Operational metrics, queue analytics, department efficiency
- **Patient Reports:** Personal medical history, appointment history

### 10. Admin Module (`/modules/admin`)

**Purpose:** Provides administrative functions and system management

**Key Features:**
- User approval and rejection workflow
- System settings management
- User role and permission management
- Audit log tracking
- System maintenance operations

**Admin Functions:**
- Approve/reject doctor and staff registrations
- Manage user roles and permissions
- System configuration management
- Generate system-wide reports
- Monitor system performance
