# 🏢 PrimeLiving - Apartment Management System

A comprehensive apartment management system built with React, TypeScript, and modern web technologies. PrimeLiving provides a complete solution for property managers, apartment managers, and tenants to manage rental properties efficiently.

## 🌟 Features

### 🏠 **Multi-Role Dashboard System**
- **Property Manager Dashboard**: Complete property oversight and management
- **Apartment Manager Dashboard**: Day-to-day operations and tenant management  
- **Tenant Dashboard**: Self-service portal for tenants

### 👥 **User Management**
- **Authentication**: Secure login with Supabase Auth
- **Role-based Access**: Different dashboards for different user types
- **User Profiles**: Comprehensive user information management

### 🏘️ **Property Management**
- **Multi-location Support**: Manage multiple apartment buildings
- **Unit Management**: Track unit status, occupancy, and details
- **Location Cards**: Visual property selection and information

### 👨‍👩‍👧‍👦 **Tenant Management**
- **Tenant Profiles**: Complete tenant information and contact details
- **Contract Management**: Track lease agreements and terms
- **Payment Tracking**: Monitor rent payments and balances
- **Document Management**: Generate and manage rental documents

### 💳 **Payment System**
- **Payment History**: Complete transaction records
- **QR Code Payments**: Generate QR codes for GCash/PayMaya payments
- **Payment Methods**: Support for multiple payment options
- **Receipt Generation**: Automated receipt creation and download

### 🔧 **Maintenance Management**
- **Request Tracking**: Submit and track maintenance requests
- **Priority System**: High, medium, low priority classification
- **Status Updates**: Real-time status tracking
- **Photo Upload**: Attach photos to maintenance requests
- **Emergency Contacts**: Quick access to maintenance contacts

### 🔔 **Notification System**
- **Multi-channel Notifications**: SMS and Email support
- **Notification Templates**: Pre-built message templates
- **Scheduling**: Schedule notifications for later delivery
- **Settings Management**: Customizable notification preferences

### 📊 **Analytics & Reporting**
- **Dashboard Metrics**: Key performance indicators
- **Payment Analytics**: Revenue tracking and trends
- **Occupancy Reports**: Unit utilization statistics
- **Maintenance Reports**: Service request analytics

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing

### **UI/UX**
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible component library
- **Lucide React** - Beautiful, customizable icons
- **Responsive Design** - Mobile-first approach

### **Backend & Authentication**
- **Supabase** - Backend-as-a-Service
- **Supabase Auth** - Authentication and user management
- **PostgreSQL** - Database (via Supabase)

### **Development Tools**
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **TypeScript** - Static type checking

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn package manager
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/lrreverence/PrimeLiving.git
   cd PrimeLiving
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### **Build for Production**
```bash
npm run build
```

## 📱 **User Roles & Features**

### **Property Manager**
- Overview of all properties and metrics
- Tenant management across all locations
- Payment tracking and financial reports
- Document generation and management
- Notification system administration
- Maintenance request oversight

### **Apartment Manager**
- Property-specific tenant management
- Payment recording and confirmation
- Maintenance request handling
- Document generation for tenants
- Notification management
- Daily operations dashboard

### **Tenant**
- Personal profile management
- Payment history and QR code payments
- Maintenance request submission
- Document access and downloads
- Notification preferences
- Contract information

## 🏗️ **Project Structure**

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   ├── Header.tsx     # Navigation header
│   ├── HeroSection.tsx # Landing page hero
│   └── LocationCard.tsx # Property cards
├── pages/             # Main application pages
│   ├── Index.tsx     # Landing page
│   ├── Locations.tsx # Property selection
│   ├── ManagerDashboard.tsx # Manager interface
│   ├── ApartmentManagerDashboard.tsx # Apartment Manager interface
│   └── TenantDashboard.tsx # Tenant interface
├── contexts/          # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── assets/           # Static assets
```

## 🔧 **Configuration**

### **Supabase Setup**
1. Create a new Supabase project
2. Set up authentication providers
3. Configure database tables for users, properties, tenants, payments
4. Add environment variables to `.env.local`

### **Database Schema**
- Users table with role-based access
- Properties table for building information
- Tenants table for tenant records
- Payments table for transaction history
- Maintenance requests table
- Notifications table

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Netlify**
1. Connect repository to Netlify
2. Configure build settings
3. Add environment variables
4. Deploy

### **Manual Deployment**
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 **Support**

For support, email support@primeliving.com or create an issue in this repository.

## 🎯 **Roadmap**

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Automated rent collection
- [ ] Integration with property management software
- [ ] Multi-language support
- [ ] Advanced reporting features

---

**Built with ❤️ for modern apartment management**
