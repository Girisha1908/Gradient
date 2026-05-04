# Gradient — Premium Productivity Suite

Gradient is a high-end, editorial-inspired project management and productivity platform designed for seamless collaboration between managers and employees. Built with **React**, **Vite**, and **Supabase**, it features a sophisticated "liquid-glass" design system and real-time synchronization.

## ✨ Core Features

### 🏢 Multi-Role Ecosystem
- **Superadmin Dashboard**: System-level monitoring, user management, and manager-intern relationship mapping.
- **Manager Console**: Task creation with multi-assign capabilities, team formation, and real-time activity tracking.
- **Employee Dashboard**: Streamlined task submissions (links & files), personal productivity insights, and experience record tracking.

### 💬 Real-Time Collaboration
- **Task-Level Chat**: Dedicated discussion channels for every assignment.
- **Live Notifications**: Real-time badges on both chat symbols and notification bells that update instantly via Supabase Postgres changes.
- **File Attachments**: Support for uploading and sharing reference materials and deliverables.

### 👁️ Secure Preview Mode
- **In-App Previewer**: Internal viewer for Images and PDFs to prevent unwanted downloads.
- **Smart Detection**: Graceful fallbacks for non-previewable file types.

### 🛡️ Robust Infrastructure
- **Tab-Isolated Auth**: Independent session management per browser tab using `sessionStorage`.
- **Role-Based Guarding**: Centralized routing protection to ensure users only access their designated dashboards.
- **Cascading Deletions**: Clean database management when tasks are removed.

## 🚀 Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Vanilla CSS with a focus on Glassmorphism and Editorial Typography (Geist Sans)
- **Backend**: Supabase (Authentication, PostgreSQL Database, Storage)
- **Icons**: Google Material Symbols

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔑 Default Accounts (Dev Mode)
| Role | Email | Use Case |
|---|---|---|
| **Superadmin** | `anamalageetika@gmail.com` | System Admin Access |
| **Manager** | `anamalagirisha@gmail.com` | Lead Manager Features |
| **Employee** | `tanmayee_chanda@srmap.edu.in` | Task Submission & Chat |

---

*Designed with ❤️ by the Gradient Team*
