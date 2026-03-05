# Changelog

All notable changes to GymSaaS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.0] - 2026-02-19

### Added

#### Documentation
- **Initial Setup Guide** 🚀
  - Comprehensive 7-step configuration guide in user manual
  - Step-by-step instructions with dependencies explained
  - Order: Salas → Personal → Planes → Turnos → Socios → Suscripciones → Rutinas
  - Checkpoints and verification for each step
  - Common errors and solutions table
  - Tips for successful configuration
  - Configuration checklist

- **Documentation Reorganization** 📚
  - All .md files moved to `context/` folder
  - `CLAUDE.md` → `context/DOCUMENTACION_TECNICA.md`
  - Created `context/INDEX.md` as main documentation hub
  - Updated `README.md` with clear documentation sections
  - Cross-references between technical and user documentation

- **White-Label Branding Documentation** 🎨
  - Complete technical documentation for white-label system
  - Clarification: Responsive web (NOT native mobile app)
  - Plan availability (Premium/Enterprise only)
  - Implementation examples and API endpoints
  - Customization options and roadmap

#### System Validations
- **SaaS Limits Enforcement** 💳
  - Personal creation now validates plan limits
  - Salas creation validates plan limits
  - Turnos creation validates daily limits per plan
  - Clear error messages when limits are reached
  - Tenant isolation working correctly

### Changed

#### Documentation
- **Manual de Usuario** enhancements:
  - Added "⚠️ First time?" alert in introduction
  - Table of contents updated with setup guide indicator ⭐
  - Better organization for non-technical users
  - Updated to version 2.3

- **Context folder structure**:
  - Added INDEX.md for navigation
  - All technical docs now in context/
  - Clear separation: technical vs user documentation

### Fixed

#### Documentation
- Fixed broken references after file reorganization
- Updated all internal links between markdown files
- Consistent formatting across all documentation files

---

## [2.2.0] - 2026-02-07

### Added

#### Dashboards por Rol
- **Dashboard Administrador**
  - Vista general con métricas completas
  - Acceso a todos los módulos del sistema

- **Dashboard Recepcionista**
  - Estadísticas de socios con suscripción vigente
  - Acceso rápido a check-in QR
  - Vista de socios y suscripciones
  - Gestión de pagos

- **Dashboard Profesor**
  - Vista de turnos asignados
  - Acceso a gestión de rutinas
  - Control de asistencia de sus clases

#### Sistema RBAC Completo
- Matriz de permisos detallada por rol
- Restricciones por defecto en UI
- Authorización en backend y frontend
- Documentación completa de permisos

#### Check-in System
- Validación de suscripción vigente
- Control de cupo por sala
- Estadísticas de asistencia
- Vista de clases del día

---

## [2.1.0] - 2026-02-06

### Added

#### Sistema de Renovación de Suscripciones
- **Renovación Mensual Automática**
  - Procesamiento automático de renovaciones
  - Integración con Mercado Pago
  - Webhook para confirmación de pagos
  - Notificaciones por email

- **Gestión de Renovaciones**
  - Historial completo de renovaciones
  - Cambio de plan permitido
  - Configuración de renovación automática
  - Botón de renovación (7 días antes del vencimiento)

#### Mercado Pago Integration
- Pagos online con tarjeta
- Checkout seguro integrado
- Activación instantánea de suscripciones
- Tokenización de tarjetas

---

## [2.0.0] - 2026-01-30

### Added

#### Sistema Multi-Tenant SaaS
- 4 planes de suscripción (Basic, Standard, Premium, Enterprise)
- Límites por plan (socios, personal, salas, turnos)
- Características por plan (rutinas, evolución física, reportes)
- Validación de límites en tiempo real
- Dashboard de uso del tenant

#### Roles y Permisos
- Sistema completo de RBAC
- 4 roles: Administrador, Recepcionista, Profesor, Socio
- Autorización por endpoints
- Autorización en componentes React

#### Reportes Financieros
- Gráfico de ingresos vs egresos
- Distribución por medio de pago
- Reporte de egresos por categoría
- Filtros por fecha

---

## [Unreleased]

### Security

- **XSS Protection**
  - Added DOMPurify library to sanitize all HTML content in SweetAlert2 modals
  - Fixed XSS vulnerabilities in ClasesDelDia.tsx, CheckinQR.tsx, and AgendaCalendar.tsx
  - All user-generated content is now sanitized before rendering
  - Removed unsafe HTML injection patterns throughout the application

- **Error Boundaries**
  - Implemented global ErrorBoundary component to catch and handle runtime errors
  - Prevents silent failures and provides user-friendly error messages
  - Automatic page reload on critical errors to maintain application stability

### Code Quality

- **TypeScript Improvements**
  - Removed @ts-nocheck from 13 files and fixed all type errors
  - Replaced `any` types with proper interfaces and type definitions
  - Added proper type annotations for all useState hooks
  - Fixed DOM element type casting (HTMLInputElement, HTMLSelectElement, etc.)
  - Improved async function return types and error handling

- **Memory Leak Fixes**
  - Fixed QR scanner cleanup to prevent memory leaks
  - Improved useEffect cleanup logic in CheckinQR.tsx
  - Removed console.error calls that could expose sensitive information

- **Bundle Optimization**
  - Removed Tailwind CSS dependencies (Bootstrap is primary framework)
  - Reduced bundle size by ~500KB by eliminating redundant CSS framework
  - Updated index.css to remove Tailwind directives

- **Code Cleanup**
  - Removed all console.log statements from production code
  - Eliminated unnecessary code comments
  - Cleaned up unused imports across all components
  - Improved code consistency and maintainability

### Added

#### Check-in System
- **QR Code Scanner** (`/checkins/qr`)
  - Real-time QR code scanning using device camera (html5-qrcode library)
  - Automatic member lookup by scanned code
  - Validates active subscription and reserved shifts
  - Visual feedback for successful/failed scans
  - Manual fallback for members without QR codes

- **Manual Check-in Interface**
  - Search members by DNI, ID, or email
  - View all scheduled shifts for the day
  - One-click check-in registration
  - Display shift details (time, room, professor)
  - Prevent duplicate check-ins

- **Daily Classes View** (`/checkins/clases-dia`)
  - View all classes scheduled for a specific date
  - Real-time attendance counts
  - Capacity status indicators (color-coded)
  - Filter by date, room, and professor

- **Check-in Statistics** (`/checkins/estadisticas`)
  - Daily, weekly, and monthly attendance trends
  - Most popular classes and time slots
  - Attendance patterns and analytics
  - Export functionality

#### Role-Based Improvements

- **Profesor Dashboard**
  - Dedicated dashboard at `/dashboard/profesor`
  - Quick access to classes and member check-ins
  - Attendance tracking for assigned classes

- **Profesor Calendar View**
  - Filtered to show only their assigned classes
  - Cannot create or edit shift templates (view-only)
  - Clear visual distinction from admin view

- **Recepcion Role Enhancements**
  - Dedicated dashboard at `/dashboard/recepcion`
  - Quick access buttons to check-in features
  - Real-time member count with active subscriptions
  - Cannot access workout routines section

#### UI/UX Improvements

- **Mobile Responsive Design**
  - Filter controls now stacked above action buttons on mobile
  - Improved touch targets for mobile devices
  - Responsive calendar (day view on mobile, week view on desktop)

- **Avatar System**
  - Support for both avatar objects (`{url: '...'}`) and avatar IDs
  - Graceful fallback to default image on load error
  - Automatic localStorage cleanup for invalid avatars
  - Cache-busting timestamps for updated avatars

- **Navigation**
  - Added trash icon to shift deletion button in member assignments
  - Improved role-based sidebar navigation
  - Cleaner menu organization by role

### Changed

- **Sidebar Navigation**
  - Routines section now hidden for "Recepcion" role
  - Better organization of menu sections
  - Removed unused icon imports

- **Calendar Component**
  - Professors get filtered view based on their `personalId`
  - Better mobile experience with day view
  - Improved event click handling with role-based actions

- **Code Quality**
  - Removed console.log statements from production code
  - Removed unnecessary comments
  - Cleaned up unused imports
  - Improved error handling

### Fixed

- **Avatar Display Issue**
  - Fixed avatar not showing in navbar when using `avatar.url` format
  - Added proper TypeScript typing for avatar field
  - Implemented fallback logic for different avatar formats

- **Dashboard Routing**
  - Fixed duplicate `if` statement in Dashboard.tsx
  - Proper role-based redirects now working correctly

- **Mobile Layout**
  - Fixed filter and buttons appearing side-by-side on mobile
  - Improved stacking behavior for better UX

## [1.0.0] - 2024-XX-XX

### Added

#### Initial Release

- **User Management**
  - Multi-role system (Admin, Profesor, Recepcion, Socio)
  - JWT authentication
  - User profiles with avatars

- **Member Management**
  - Complete member profiles
  - Subscription management
  - Payment order workflow

- **Shift Management**
  - Recurring shift templates
  - Room and professor assignment
  - Capacity management

- **Workout Routines**
  - Exercise library
  - Routine templates
  - Member-specific routines
  - Muscle group categorization

- **Calendar**
  - Full calendar view with FullCalendar
  - Shift visualization
  - Color-coded capacity indicators

- **Dashboard**
  - Admin analytics with charts
  - Role-specific dashboards
  - Quick access to common tasks

- **Payment System**
  - Payment order creation
  - Receipt upload
  - Admin approval workflow
  - Subscription auto-activation

---

## Version Convention

- **Major**: Breaking changes, major features
- **Minor**: New features, enhancements
- **Patch**: Bug fixes, minor improvements
