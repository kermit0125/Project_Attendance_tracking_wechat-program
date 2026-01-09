# Enterprise Attendance Management System

A comprehensive enterprise attendance management system with clock-in/out, leave requests, business trips, overtime applications, approval workflows, and statistical reporting capabilities.

> **📝 Authorization Notice**: This project is published with the explicit authorization and approval of **Shanghai Runlan Filtration Equipment Co., Ltd.** (上海润岚过滤设备有限公司). All code and documentation are shared for educational and portfolio purposes.

> **🌐 Language**: [English](README.md) | [中文](README.zh.md)

## 📋 Project Overview

This system adopts a modern frontend-backend separation architecture, providing a complete attendance management solution for enterprises:

- **Frontend**: Vue 3 + TypeScript + Element Plus - Modern, responsive user interface
- **Backend**: Node.js + Fastify + Prisma + MySQL - High-performance RESTful API

## ✨ Core Features

### Employee Features
- ✅ **Clock-in/out Management**: Check-in/check-out with GPS location verification
- 📝 **Request Management**: Leave, business trip, punch correction, and overtime applications
- 📊 **Statistics & Reports**: Personal attendance history, monthly statistics, work hours summary
- 👤 **Profile Center**: View personal information and department details

### Admin Features
- ✅ **Approval Management**: Review and approve employee requests with duration modification
- 👥 **User Management**: Create, edit, delete user accounts, assign roles and departments
- 📈 **Team Statistics**: View team attendance data and anomalies
- ⚙️ **System Configuration**: Work schedule management, geofencing, holiday configuration
- 📋 **Audit Logs**: View system operation records

## 🛠 Technology Stack

### Frontend Technologies
- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Element Plus
- **Routing**: Vue Router
- **State Management**: Pinia
- **HTTP Client**: Axios

### Backend Technologies
- **Runtime**: Node.js ≥ 20
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: MySQL 8.x
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT
- **Password Encryption**: bcrypt

## 📁 Project Structure

```
.
├── frontend/              # Frontend project
│   ├── src/
│   │   ├── views/        # Page components
│   │   ├── components/   # Shared components
│   │   ├── router/       # Route configuration
│   │   ├── stores/       # State management
│   │   ├── utils/        # Utility functions
│   │   └── config/       # Configuration files
│   ├── package.json
│   └── README.md         # Frontend documentation
│
├── backend/              # Backend project
│   ├── src/
│   │   ├── routes/       # Route layer
│   │   ├── controllers/  # Controllers
│   │   ├── services/     # Business logic
│   │   ├── repositories/ # Data access layer
│   │   ├── middlewares/  # Middlewares
│   │   ├── validators/   # Parameter validation
│   │   └── utils/        # Utility functions
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.ts       # Seed data
│   ├── package.json
│   └── README.md         # Backend documentation
│
└── README.md             # Project overview (this file)
```

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 20
- MySQL ≥ 8.0
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Project_Attendance_tracking_wechat-program
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and modify the configuration
cp .env.example .env

# Initialize database
npm run prisma:generate
npm run prisma:push  # Development: sync schema directly
npm run prisma:seed

# Start backend server
npm run dev
```

The backend server will start at `http://localhost:3000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

The frontend application will start at `http://localhost:5173`

### 4. Access the System

Open your browser and navigate to `http://localhost:5173`. Use the following test accounts to log in:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | `admin@test.com` | `123456` | All permissions |
| Manager | `manager@test.com` | `123456` | Approval permissions |
| Employee | `employee@test.com` | `123456` | Basic permissions |

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md) - Frontend architecture, components, development guide
- [Backend Documentation](./backend/README.md) - API endpoints, database design, deployment guide

## 🔐 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **EMPLOYEE** | Clock-in/out, create requests, view personal statistics |
| **MANAGER** | Approve subordinate requests, view team statistics |
| **HR** | View company-wide statistics, configure rules |
| **ADMIN** | Full system access and all permissions |

## 📊 Key Features

### 1. Clock-in/out Module
- Check-in/check-out functionality
- GPS location verification
- Attendance history query
- Anomaly detection and alerts

### 2. Request Module
- **Leave Requests**: Multiple leave types with duration tracking
- **Business Trip Requests**: Track trip duration and location, counted as work hours
- **Punch Correction Requests**: Correct missing punch records, counted as work hours
- **Overtime Requests**: Track overtime hours, counted as work hours

### 3. Approval Module
- Pending approval list
- Request detail view
- Approve/reject functionality
- Duration modification
- Approval comments

### 4. Statistics Module
- Monthly attendance statistics
- Work hours summary (base hours + overtime + corrections + business trips)
- Leave days statistics
- Anomaly records query

### 5. User Management Module (Admin/HR)
- User list with keyword search
- Create user accounts
- Edit user information (name, email, employee ID, department, role, status)
- Delete users (soft delete)
- Department management
- Role assignment

## 🔧 Development Guide

### Backend Development

```bash
cd backend

# Development mode (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database visualization
npm run prisma:studio

# Generate Prisma Client
npm run prisma:generate
```

### Frontend Development

```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## 🧪 Testing

### Using Postman to Test API

The project includes complete Postman configuration files:

1. Import `backend/postman_collection.json`
2. Import `backend/postman_environment.json`
3. Select the environment and start testing

For detailed instructions, refer to [Backend Documentation](./backend/README.md)

## 📝 Environment Variables

### Backend Environment Variables (.env)

```env
# Database configuration
DATABASE_URL="mysql://root:password@localhost:3306/attendance_app"

# JWT secret (change in production)
JWT_SECRET=your-super-secret-jwt-key

# Server configuration
PORT=3000
NODE_ENV=development

# Log level
LOG_LEVEL=info
```

### Frontend Environment Variables (.env.development)

```env
# API base URL
VITE_API_BASE_URL=http://localhost:3000
```

## 🚢 Deployment

### Recommended Deployment Stack

- **Frontend**: Vercel (Free tier, automatic HTTPS, global CDN)
- **Backend**: Render Free Web Service (Free tier, automatic HTTPS)
- **Database**: Aiven Free MySQL (Free MySQL database)

### Deployment Steps

1. **Deploy MySQL Database (Aiven)**
   - Create an Aiven account at https://aiven.io/
   - Create a MySQL service (Hobbyist plan)
   - Create database `attendance_app`
   - Get connection string with SSL: `mysql://user:pass@host:port/attendance_app?sslmode=REQUIRED`

2. **Deploy Backend (Render)**
   - Connect GitHub repository
   - Set Root Directory: `backend`
   - Build Command: `npm install && npm run prisma:generate && npm run build`
   - Start Command: `npm run start:migrate`
   - Configure environment variables (DATABASE_URL, JWT_SECRET, etc.)

3. **Deploy Frontend (Vercel)**
   - Connect GitHub repository
   - Set Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Configure environment variable: `VITE_API_BASE_URL`

4. **Configure CORS**
   - Add frontend URL to backend CORS configuration

For detailed deployment instructions, refer to the deployment section in [Backend Documentation](./backend/README.md).

## ⚠️ Important Notes

1. **Production Environment**: Always change `JWT_SECRET` and database passwords
2. **Database**: Ensure MySQL 8.x is installed and running
3. **Organization Isolation**: All business data is isolated by `org_id`
4. **Authentication**: All endpoints require JWT authentication (except login)
5. **Token Security**: Never hardcode tokens in code or documentation

## 🐛 Common Issues

### Backend Startup Failure

1. Check if MySQL service is running
2. Verify `.env` file configuration
3. Ensure database exists: `CREATE DATABASE attendance_app;`
4. Run database migration: `npm run prisma:generate`

### Frontend Cannot Connect to Backend

1. Check if backend service is running
2. Verify API address in `.env.development`
3. Check browser console for network requests

### Login Failure

1. Ensure seed data is run: `npm run prisma:seed`
2. Check if user data exists in database
3. View backend logs for error details

## 📄 License

MIT License

## 👥 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 🙏 Acknowledgments

This project was developed for **Shanghai Runlan Filtration Equipment Co., Ltd.** (上海润岚过滤设备有限公司) and is published with their authorization for educational and portfolio purposes.

---

**Last Updated**: 2025-01-07  
**Version**: 1.0.0
