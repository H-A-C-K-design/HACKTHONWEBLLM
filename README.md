# HEXONA-LLM — Sanjivani University LLM Hackathon Web Platform

> **Build. Prompt. Dominate.**  
> A futuristic, game-inspired web platform and participant command center engineered for **HEXONA-LLM**, hosted at **Sanjivani University**.

---

## 🚀 Overview

HEXONA-LLM is a premier Generative AI and Large Language Model hackathon platform featuring:
- **Cinematic Landing Page:** Lenis smooth scrolling, GSAP ScrollTrigger animations, custom hexagon game-scene canvas, interactive countdown, real-time stats ticker, track themes, and prize podium.
- **Firebase Authentication:** Email/Password registration with Zod validation, Google One-Tap Sign-In, password reset flows, and auto-provisioned user documents.
- **Squad Formation Portal:** Create teams with auto-generated unique 6-character access codes, join via code verification, live roster updates via RTDB listeners, role-based leader permissions (disband, remove members), and capacity limits.
- **Real-Time Announcements:** Push broadcasts instantly to all connected users, priority badges (Normal, Important, Urgent), pinned notifications, and automatic unread counters.
- **Round Deliverable Submissions:** Multi-stage hackathon submissions (.ppt, .pptx, .pdf decks up to 20MB or public drive links, GitHub repos, demo videos) with deadline enforcement, live timers, and judge grading feedback.
- **Mentorship & Help Sessions:** Live calendar sync with downloadable `.ics` calendar events, technical ticketing queue, and real-time mentor reply threads.
- **Comprehensive Admin Control Center:** Direct management of squads, announcements, round timelines, project scoring/shortlisting, help requests, and CSV exports.

---

## 🛠 Tech Stack

- **Framework:** React 19 + Vite 8
- **Styling:** Vanilla CSS design tokens (`tokens.css`, `globals.css`, `Dashboard.css`, `Auth.css`, `Home.css`) with sleek grey + gold + white cyber aesthetics
- **Routing:** React Router v7 with route code-splitting (`React.lazy` + `Suspense`)
- **Animations:** Framer Motion (page transitions, layoutId pills, micro-interactions) + GSAP & Lenis smooth scrolling
- **Backgrounds:** Custom Canvas Neural Particle Mesh + Synthwave Grid + Falling Data Streaks
- **Backend & Database:** Firebase Auth + Firebase Realtime Database (RTDB) + Firebase Storage
- **Forms & Validation:** `react-hook-form` + `zod`
- **Toasts:** `react-hot-toast` with gold glow styling

---

## ⚙️ Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Populate your Firebase project configuration credentials in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

> **Note:** The app includes safe fallback initializers so UI prototyping and navigation remain functional even before inserting live keys.

---

## 🔐 Granting Admin Access

To assign administrative privileges to an account:
1. Register or sign in via Google through `/register` or `/login`.
2. Open your [Firebase Console](https://console.firebase.google.com/) -> **Realtime Database**.
3. Navigate to `users/{user_uid}`.
4. Set the `role` property to `"admin"`:
   ```json
   {
     "role": "admin"
   }
   ```
5. Refresh the dashboard; the **ADMIN CONTROL** suite will immediately unlock in the sidebar.

---

## 📦 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

3. Run code linting:
   ```bash
   npm run lint
   ```

4. Build production bundle:
   ```bash
   npm run build
   ```

---

## 🛡 Security Rules Deployment

Deploy the provided Realtime Database and Storage security rules directly using the Firebase CLI:
```bash
firebase deploy --only database,storage
```
- `database.rules.json`: Enforces read/write permissions, prevents race conditions, and validates squad capacity limits.
- `storage.rules`: Restricts deck uploads to authenticated team members (max 20MB, PPT/PDF formats).

---

## 🏛 Hosted By

**Sanjivani University**  
Department of Computer Engineering & AI Student Council  
Kopargaon, Maharashtra, India  
*Building the future of Autonomous Intelligence.*
