# Software Requirements Specification (SRS) for Project "Gradient"

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to specify the software requirements for "Gradient," a platform designed to streamline team management, verify professional deliverables (Proof of Work), and build credible professional portfolios.

### 1.2 Scope
Gradient is a web-based application that facilitates the entire lifecycle of professional tasks—from assignment and collaboration to review and verification. It serves as a bridge between internal project management and external professional credibility by maintaining a "Verified Proof of Work" system and company-signed experience records.

---

## 2. Overall Description

### 2.1 Product Perspective
Gradient is a standalone professional management system that integrates authentication (via Supabase) and a relational database to maintain a secure record of work. It is designed with a premium, minimal UI to appeal to modern professionals and enterprises.

### 2.2 Product Functions
- **Role-based Dashboards**: Custom interfaces for Employees, Managers, and Admins.
- **Team Formation**: Dynamic team creation and member management.
- **Task Lifecycle Management**: Assignment of tasks to teams, tracking status, and submitting deliverables.
- **Verification Engine**: A systematic review process where managers verify deliverables, creating an immutable proof of work.
- **Experience Layer**: Generation of company-signed experience records based on performance metrics.
- **Talent Discovery**: An admin-level interface to search and recruit verified talent.
- **Real-time Collaboration**: Task-specific messaging and file sharing.

### 2.3 User Classes and Characteristics
- **Employee (User)**: Focuses on task execution, deliverable submission, and building their verified portfolio.
- **Manager**: Focuses on team leadership, task assignment, and quality control through the review/verification process.
- **Admin**: Oversees the entire organization, manages high-level settings, and uses the platform for talent acquisition/discovery.

---

## 3. External Interface Requirements

### 3.1 User Interfaces
- **Responsive Web Interface**: Optimized for desktop (primary) and mobile (secondary).
- **Design Aesthetic**: Premium, minimal, "liquid-glass" aesthetic with consistent spacing and typography (Instrument Serif).
- **Component System**: Modular UI including headers, sidebars, modals for submissions, and interactive dashboards.

### 3.2 Software Interfaces
- **Database**: PostgreSQL (via Supabase) for structured data storage.
- **Authentication**: Supabase Auth for secure login and session management.
- **Storage**: Supabase Storage for task references and submitted deliverables.

---

## 4. System Features

### 4.1 User Authentication & Profiles
- **FR1**: Users shall be able to register and login using email/password or Google Auth.
- **FR2**: Users shall have a profile containing a bio, skills, and a unique username for public portfolio access.
- **FR3**: The system shall support role assignment (Employee, Manager, Admin) upon registration or via admin update.

### 4.2 Team Formation & Management
- **FR4**: Managers/Admins shall be able to create teams and add members to them.
- **FR5**: Users shall be able to view their team membership and teammates.

### 4.3 Task Management
- **FR6**: Managers shall be able to create tasks, set deadlines, and attach reference materials.
- **FR7**: Tasks shall be assignable to specific teams or individual members.
- **FR8**: Tasks shall support status updates (Pending, In Progress, Submitted, Approved, Rejected).

### 4.4 Deliverables & Verification System
- **FR9**: Employees shall be able to submit deliverables (links or files) for assigned tasks.
- **FR10**: Managers shall be able to review submissions, provide feedback, and "Verify" the work.
- **FR11**: Once verified, a deliverable shall be marked as "Verified Proof of Work" and locked from further edits.

### 4.5 Professional Portfolio & Experience Records
- **FR12**: The system shall generate a public-facing portfolio page for users displaying their "Verified Proof of Work."
- **FR13**: Managers shall be able to generate "Experience Records" for employees, including performance scores and skill summaries.
- **FR14**: Users shall be able to export or share their verified performance records.

### 4.6 Messaging & Notifications
- **FR15**: The system shall provide a real-time chat interface for each task to facilitate collaboration.
- **FR16**: Users shall receive notifications for new tasks, feedback, or verification status changes.

### 4.7 Admin Controls & Talent Discovery
- **FR17**: Admins shall have a "Discovery" dashboard to view all users and their verified achievements.
- **FR18**: Admins shall be able to send "Offers" or recruitment messages directly to users based on their portfolio.

---

## 5. Other Non-functional Requirements

### 5.1 Performance
- Dashboards should load within 2 seconds.
- Real-time messaging should have a latency of less than 200ms.

### 5.2 Security
- Row Level Security (RLS) must be enabled in the database to ensure users only access data they are authorized to see.
- All file uploads must be scanned for security and restricted by file type.

### 5.3 Usability
- The interface must follow a consistent design language to minimize the learning curve.
- Critical actions (like verification or deletion) should require confirmation.
