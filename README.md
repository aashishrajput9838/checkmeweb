# 🥗 CheckMe — The Smart Mess Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v12-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Latest-purple?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

> **CheckMe** is a premium, full-stack mess management platform designed for modern college hostels. It replaces archaic manual logs with a sleek, automated, and democratic ecosystem for students, wardens, and mess staff.

---

## ✨ Key Features

### 👨‍🎓 Student Hub
- **Live Menu**: Real-time access to weekly mess menus with automatic meal highlight based on time.
- **Attendance History**: Track your presence across breakfast, lunch, snacks, and dinner.
- **Democratic Voting**: Participate in monthly surveys and Sunday special polls to shape your mess experience.
- **Warden Notices**: Get instant updates via a dedicated, stylized broadcast board.

### 👮 Warden Control Panel
- **Attendance Marker**: Efficiently mark and manage daily attendance for the entire hostel.
- **Global Broadcasts**: Post important announcements that reflect instantly on every student dashboard.
- **Food Quality Analytics**: Visualize student feedback through dynamic charts to monitor mess performance.

### 🍱 Mess Administration
- **Inventory Management**: Real-time tracking of essential supplies (Rice, Chicken, Milk, etc.).
- **Menu Management**: Upload weekly menus via PDF or Excel; our AI-driven parsing handles the rest.
- **Daily Overrides**: Quickly update the menu for emergency changes or special occasions.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a sleek, premium dark-theme UI.
- **Database & Auth**: [Google Firebase](https://firebase.google.com/) (Firestore, Auth, Storage).
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for butter-smooth transitions.
- **Data Processing**: [XLSX](https://github.com/SheetJS/sheetjs) for professional report generation and menu parsing.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- A Firebase project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aashishrajput9838/checkmeweb.git
   cd checkme
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root and add your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   ...
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Deploy Security Rules:**
   Copy the contents of `firestore.rules` and `storage.rules` to your Firebase Console.

---

## 👨‍💻 Architect & Founder

**Aashish Rajput**
*UI Obsessed | Logic Driven | Clean Code Enthusiast*

- 🌐 [Portfolio](https://aspirinexar.vercel.app/)
- 🔗 [LinkedIn](https://linkedin.com/in/aashishrajput9838)
- 🐙 [GitHub](https://github.com/aashishrajput9838)

*"I write clean code like poetry, with purpose and precision. CheckMe was born from the need to solve real-world campus problems with elegant engineering."*

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://aspirinexar.vercel.app/">Aashish Rajput</a>
</p>
