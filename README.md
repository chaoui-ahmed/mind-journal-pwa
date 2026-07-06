# 📓 Mind Journal (Mood Tracker)

[![Live Demo](https://img.shields.io/badge/Live_Demo-▶-green?style=for-the-badge)](https://remix-of-mood-journal.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-blue.svg?style=flat-square&logo=react&logoColor=white)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=flat-square&logo=typescript&logoColor=white)]()
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E.svg?style=flat-square&logo=supabase&logoColor=white)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white)]()

Mind Journal is a highly interactive, feature-rich journaling and mood tracking progressive web application (PWA). It provides a secure, private canvas for users to document their mental wellness, log emotions, and analyze long-term sentiment trends through data-driven charts.

---

## ⚡ Features

- **Mood Logging & Journaling**: Create, edit, and delete detailed daily journal entries paired with physical mood levels.
- **Sentiment & Mood Trends**: Interactive charts showing emotional fluctuation over time to discover mental wellness patterns.
- **Media Gallery**: Embed and preview photos directly attached to your journal logs, securely hosted on Supabase Storage.
- **Dynamic Theming**: Advanced visual configurations including custom wallpapers, dynamic animations (shooting stars, birthday events), and responsive dark/light modes.
- **Secure Supabase Backend**: Integrated user logins, real-time database syncing, and secure session management.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite, TypeScript, React Router DOM)
- **Data & APIs**: TanStack React Query, Lucide Icons, Recharts (for trend plotting)
- **UI & Transitions**: Shadcn UI, Radix UI primitives, Framer Motion
- **Backend**: Supabase (PostgreSQL Database, Auth, Storage)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js 18+ and `npm` installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/chaoui-ahmed/remix-of-mood-journal.git
   cd remix-of-mood-journal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development mode**:
   ```bash
   npm run dev
   ```

---

## ✍️ Author
- **Ahmed Chaoui** — Engineering Student at Eurecom
