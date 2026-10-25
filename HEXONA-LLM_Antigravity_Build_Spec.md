<USER_REQUEST>
# HEXONA-LLM — Website Build Specification (for Antigravity)

> **Mission:** Build a premium, animated, scroll-driven website and participant dashboard for **HEXONA-LLM**, an LLM Hackathon hosted at **Sanjivani University**. The site must feel professional, game-like and futuristic, using a **grey + gold + white** theme. All data must be **real, live data from Firebase**. **No mock, dummy or hard-coded data anywhere.**

---

## 0. Instructions to the Agent (read first)

1. Follow this document top to bottom. Build in the phases listed in **Section 17**.
2. Never insert fake teams, fake announcements or placeholder users. Empty states must show a designed "nothing here yet" UI.
3. Use **Firebase Authentication** and **Firebase Realtime Database** (RTDB). Use `onValue` listeners so the UI updates live without refresh.
4. Every screen must be responsive (mobile 360px → desktop 1920px).
5. Respect `prefers-reduced-motion`: disable heavy animation when set.
6. Ask the user only for the Firebase config values; read them from `.env`.
7. Use the provided robot image at `public/assets/ai-robot.png` (mascot **AI-9**).

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Language | JavaScript (or TypeScript if preferred) |
| Styling | Tailwind CSS + CSS variables for tokens |
| Routing | React Router v6 |
| Animation (UI) | Framer Motion |
| Animation (scroll) | GSAP + ScrollTrigger |
| Smooth scroll | Lenis |
| Animated background | `@tsparticles/react` + custom canvas "game-scene" layer (see §6) |
| 3D tilt / parallax | `react-parallax-tilt` |
| Icons | `lucide-react` |
| Backend | Firebase Auth + Realtime Database (+ Firebase Storage for PPT files) |
| Toasts | `react-hot-toast` |
| Forms | `react-hook-form` + `zod` |

---

## 2. Design System

### 2.1 Color Tokens
```css
:root {
  --bg-0: #0B0B0D;        /* near-black base */
  --bg-1: #121214;        /* deep charcoal */
  --bg-2: #1A1A1D;        /* panel grey */
  --bg-3: #242428;        /* raised grey */
  --grey-500: #6B6B73;
  --grey-300: #A8A8B0;

  --gold-300: #F3DFA2;
  --gold-400: #E6C766;
  --gold-500: #D4AF37;    /* primary gold */
  --gold-600: #B8942A;
  --gold-gradient: linear-gradient(135deg, #F3DFA2 0%, #D4AF37 45%, #8A6D1D 100%);

  --text-primary: #FFFFFF;
  --text-secondary: #D9D9DE;
  --text-muted: #9A9AA3;

  --glass: rgba(255,255,255,0.04);
  --glass-border: rgba(212,175,55,0.25);
  --glow-gold: 0 0 24px rgba(212,175,55,0.35);
}
```
- Page background: dark grey gradient (`--bg-0` → `--bg-2`) with subtle noise texture.
- All body text **white / light grey**. Headings use **gold gradient text** (`background-clip: text`).

### 2.2 Typography (Google Fonts)
| Use | Font |
|---|---|
| Hero title / logo wordmark | **Cinzel** (700/900) — regal, golden feel |
| Section headings | **Playfair Display** (600/700) |
| Futuristic accents / labels / stats | **Orbitron** or **Rajdhani** |
| Body / UI | **Inter** (400/500/600) |
| Code / terminal bits | **JetBrains Mono** |

### 2.3 Textures & Surfaces
- **Brushed-metal grey** texture on large panels (CSS gradient + SVG noise overlay at 4–6% opacity).
- **Gold foil** border: 1px gradient border using `border-image` or mask trick, plus soft inner glow.
- **Glassmorphism cards:** `backdrop-filter: blur(14px)`, `--glass` fill, `--glass-border` stroke.
- **Grid overlay:** faint hex/grid pattern (1.5% opacity) across hero and dashboard backgrounds to echo the "HEXONA" hexagon identity.
- Corner "HUD brackets" on cards (small gold L-shaped corners) for a game-UI feel.

### 2.4 Components
- Primary button: gold gradient fill, dark text, shimmer sweep on hover, subtle lift.
- Secondary button: transparent with gold border, fill on hover.
- Inputs: dark glass, gold focus ring with glow, floating labels.
- Cards: glass + HUD corners + hover tilt.
- Loading: gold hexagon spinner (custom SVG), skeleton shimmer for lists.

---

## 3. Brand & Logo

**Event name (page title, always uppercase):** `HEXONA-LLM`
**Document title:** `HEXONA-LLM | Sanjivani University LLM Hackathon`
**Tagline:** *"Build. Prompt. Dominate."*

### Logo concept (create as an inline SVG component `Logo.jsx`)
- A **hexagon** with a gold gradient outline (HEXONA = hex).
- Inside the hexagon: a stylised **neural-node "H"** formed by two vertical lines joined by a crossbar with glowing nodes (circles) at the endpoints.
- Wordmark beside it: **HEX**ONA in white, **-LLM** in gold gradient, in Cinzel.
- Variants: full (icon + wordmark), icon-only (for collapsed sidebar and favicon).
- Subtle animation: hexagon outline draws itself on load (stroke-dashoffset), nodes pulse.
- Export favicon (`favicon.svg`) from the icon-only variant.

---

## 4. Project Structure

```
hexona-llm/
├─ public/
│  └─ assets/
│     └─ ai-robot.png            # uploaded mascot AI-9
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx
│  ├─ firebase/
│  │  ├─ config.js               # initializeApp, getAuth, getDatabase, getStorage
│  │  ├─ auth.js                 # register, login, logout, google sign-in, reset
│  │  └─ db.js                   # all RTDB helper functions
│  ├─ context/
│  │  └─ AuthContext.jsx         # user + profile + team listener
│  ├─ hooks/
│  │  ├─ useRealtime.js          # generic onValue hook
│  │  ├─ useTeam.js
│  │  └─ useCountdown.js
│  ├─ components/
│  │  ├─ Logo.jsx
│  │  ├─ AnimatedBackground.jsx  # game-scene background
│  │  ├─ GlassCard.jsx
│  │  ├─ GoldButton.jsx
│  │  ├─ Loader.jsx
│  │  ├─ EmptyState.jsx
│  │  └─ ProtectedRoute.jsx
│  ├─ pages/
│  │  ├─ Home/ (Hero, About, Tracks, Timeline, Prizes, Rules, FAQ, Footer…)
│  │  ├─ Auth/ (Login.jsx, Register.jsx, ForgotPassword.jsx)
│  │  └─ Dashboard/
│  │     ├─ DashboardLayout.jsx  # sidebar + topbar + outlet
│  │     ├─ Sidebar.jsx
│  │     ├─ Overview.jsx
│  │     ├─ EventRegistration.jsx
│  │     ├─ Announcements.jsx
│  │     ├─ Submissions.jsx
│  │     ├─ About.jsx
│  │     ├─ HelpSession.jsx
│  │     └─ admin/ (AdminAnnouncements, AdminRounds, AdminTeams, AdminSubmissions, AdminHelp)
│  ├─ styles/
│  │  ├─ tokens.css
│  │  └─ globals.css
│  └─ utils/ (generateTeamCode.js, formatDate.js, validators.js)
├─ database.rules.json
├─ storage.rules
├─ .env.example
└─ README.md
```

**.env.example**
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 5. Routes

| Path | Page | Access |
|---|---|---|
| `/` | Home (landing, scroll experience) | Public |
| `/login` | Login | Public (redirect to dashboard if logged in) |
| `/register` | Register | Public |
| `/forgot-password` | Reset password | Public |
| `/dashboard` | Overview | Auth required |
| `/dashboard/registration` | Event Registration | Auth required |
| `/dashboard/announcements` | Announcements | Auth required |
| `/dashboard/submissions` | Round / PPT Submission | Auth required |
| `/dashboard/about` | About | Auth required |
| `/dashboard/help` | Help Session | Auth required |
| `/dashboard/admin/*` | Admin tools | Auth + `role === "admin"` |

After successful login/register → redirect to `/dashboard`.

---

## 6. Animated "Game-Scene" Background

Reusable `<AnimatedBackground variant="home | auth | dashboard" />`, fixed behind content (`z-index: -1`), pointer-events none.

Layers (back to front):
1. **Base gradient** dark grey with slow-shifting radial golden glows (CSS keyframes, 20s loop).
2. **Perspective grid floor** (synthwave/game-level style): a gold-tinted grid receding to the horizon, scrolling toward the viewer (CSS 3D transform + animated `background-position`).
3. **Floating hexagons** of various sizes drifting upward with slow rotation, some outlined gold, some filled glass.
4. **Particle field** (tsparticles): tiny gold/white dots, links between nearby particles (neural-network look), mouse-reactive repulse.
5. **Light streaks / data rain:** thin vertical gold lines falling at random intervals (subtle).
6. **Vignette** + noise overlay for depth.

Variants:
- `home`: full intensity, parallax tied to scroll (layers move at different speeds via GSAP).
- `auth`: medium intensity, hexagons + particles only.
- `dashboard`: low intensity (so content stays readable), slow particles + faint grid.

Performance: cap particles (≈60 desktop / 25 mobile), pause animation when tab hidden, use `will-change: transform`.

---

## 7. Landing Page (Home) — Scroll Experience

Use **Lenis** smooth scroll with **GSAP ScrollTrigger**. Each section animates in as the user scrolls (fade-up, stagger, parallax, scale). Add a thin **gold scroll-progress bar** at the top and a floating "back to top" hex button.

### 7.1 Navbar (sticky, glass)
- Left: `<Logo />`.
- Center links (smooth scroll): Home, About, Tracks, Timeline, Prizes, FAQ, Contact.
- Right: **Login** (secondary) and **Register** (primary gold).
- Becomes more opaque on scroll; mobile → animated hamburger drawer.

### 7.2 Hero Section (full viewport)
- Animated background (`home`).
- **Left:** small label "SANJIVANI UNIVERSITY PRESENTS", giant title **HEXONA-LLM** (Cinzel, gold gradient, letter-by-letter reveal + light sweep), tagline typed with typewriter effect, short description (2 lines), CTA buttons: **Register Now** (→ `/register`) and **Learn More** (scroll).
- **Countdown timer** (days / hours / minutes / seconds) in glass tiles with flip animation. Event start date comes from `settings/event/startDate` in RTDB (admin-editable). If not set, show "Dates announced soon".
- **Right:** the **AI-9 robot** image floating (infinite up-down float, subtle rotation), soft gold glow behind it, mouse-parallax tilt. Floating glass "AI" chips orbiting the robot.
- Scroll indicator (animated mouse/chevron).

### 7.3 Live Stats Strip
Animated count-up numbers **from real data**: Registered Participants (`count of users`), Teams Formed (`count of teams`), Submissions (`count of submissions`). Use RTDB listeners. Show `0` honestly if empty.

### 7.4 About the Hackathon
Two-column: text on left (what is HEXONA-LLM, why LLMs, who can join), animated feature cards on right (Build with LLMs, Mentorship, Prizes, Networking). Cards tilt on hover.

### 7.5 Tracks / Themes
Horizontal pinned scroll (GSAP pin) with cards: e.g., *LLM-powered Education*, *Healthcare AI*, *Agents & Automation*, *Open Innovation*. Content is editable via `settings/tracks` in RTDB; if empty render an empty-state card (no fake tracks).

### 7.6 Timeline / Rounds
Vertical glowing timeline that **draws itself** as you scroll. Nodes = rounds from `rounds` in RTDB (name, date, description). Active round highlighted.

### 7.7 Prizes
Podium-style layout (1st center raised, 2nd, 3rd) with gold/silver/bronze foil cards, shimmer animation. Values read from `settings/prizes`.

### 7.8 Rules & Eligibility
Accordion with smooth height animation.

### 7.9 FAQ
Accordion, gold plus/minus icons.

### 7.10 Footer
Logo, quick links, contact (Sanjivani University), social icons, "© HEXONA-LLM". Gold divider with animated shimmer.

---

## 8. Authentication Pages (Firebase Auth)

Shared layout: split screen — left shows animated background + AI-9 robot + tagline; right shows glass form card. Mobile: form only with background.

### 8.1 Register
Fields: **Full Name, Email, Phone, College/Institute, Year of Study, Password, Confirm Password**. Validate with zod. Optional **Sign up with Google**.
On submit:
1. `createUserWithEmailAndPassword`.
2. `updateProfile({ displayName })`.
3. Write `users/{uid}` in RTDB (see §10) with `role: "participant"`, `teamId: null`.
4. Toast success → redirect `/dashboard`.

### 8.2 Login
Email + password, "Remember me", Google sign-in, link to Forgot Password. Friendly error mapping (wrong password, user not found, too many requests).

### 8.3 Forgot Password
`sendPasswordResetEmail`.

### 8.4 Behaviors
- `AuthContext` subscribes to `onAuthStateChanged`, then attaches an RTDB listener to `users/{uid}` to expose `profile`.
- `ProtectedRoute` shows the gold hex loader while auth state resolves.
- Logout button in dashboard top bar.

---

## 9. Dashboard

### 9.1 Layout
- **Animated background** (`dashboard` variant).
- **Sidebar (left, glass, styled & animated):**
  - Top: `<Logo />` (full when expanded, icon-only when collapsed).
  - Collapse/expand toggle (smooth width animation 280px ↔ 84px).
  - Menu items with icon + label; **active item** has a gold left bar, glow, and a sliding highlight pill (Framer Motion `layoutId`). Hover: icon nudge + gold underline sweep.
  - Items (exactly these five):
    1. **Event Registration** — icon `Users`
    2. **Announcements** — icon `Megaphone` (with live **unread badge** pulse)
    3. **Round / PPT Submission** — icon `Presentation` / `UploadCloud`
    4. **About** — icon `Info`
    5. **Help Session** — icon `LifeBuoy`
  - Admin-only group (visible only if `role === "admin"`): Admin Panel.
  - Bottom: user avatar (initials in gold hex), name, team name, **Logout**.
  - Mobile: sidebar becomes slide-in drawer with overlay.
- **Top bar:** page title, search (optional), notification bell (announcement count), profile dropdown.
- **Content area:** page transitions with Framer Motion (`AnimatePresence`, fade + slide 12px).

### 9.2 Overview (`/dashboard`)
Welcome card ("Welcome, {name}") with AI-9 robot mini-illustration, live countdown to next deadline, team status card, latest 3 announcements (live), submission status for each open round. All real data.

---

### 9.3 Section 1 — Event Registration (Create Team or Join Team)

State handled by `profile.teamId`.

**If user has no team** → show two big animated cards (flip/hover glow):
1. **Create a Team**
   - Fields: Team Name (unique), Track/Theme (select from `settings/tracks`), Problem Idea (optional short text).
   - On submit (single atomic multi-path `update()`):
     - Generate unique **6-character Team Code** (A–Z, 2–9, no ambiguous chars). Verify uniqueness against `teamCodes`.
     - Create `teams/{teamId}`, `teams/{teamId}/members/{uid}`, `teamCodes/{code} = teamId`, set `users/{uid}/teamId`.
     - User becomes `leaderUid`.
   - Show success modal with the code + **Copy code** button + share link.
2. **Join a Team**
   - Input: Team Code. Validate → look up `teamCodes/{code}`.
   - Show a preview card (team name, leader, current members n/4) before confirming.
   - Block if team is full (max members = `settings/event/maxTeamSize`, default 4), if user already has a team, or if registration closed.
   - On confirm: atomic update adding member, incrementing `memberCount`, setting `users/{uid}/teamId`.

**If user has a team** → show **Team Dashboard card**:
- Team name, track, code (copy button), created date, leader badge (gold crown).
- Live member list (avatar, name, college, joined date). Real-time updates when someone joins.
- Leader actions: remove member, rename team, **disband team** (only if no submissions), regenerate code.
- Member action: **Leave team** (with confirm modal; leader must transfer leadership or disband first).
- Progress indicator: "Team size 3 / 4".
- Registration status chip: *Complete* when `memberCount >= minTeamSize`.

---

### 9.4 Section 2 — Announcements
- Live list from `announcements` ordered by `createdAt` desc (`onValue` + `query(orderByChild('createdAt'))`).
- Card: title, body (supports line breaks and links), **priority tag** (Normal / Important / Urgent with gold/amber/red-gold accents), timestamp ("2 hours ago"), author.
- Pinned announcements on top.
- **Unread tracking:** store `users/{uid}/lastReadAnnouncements = timestamp`; badge in sidebar shows count of newer items; clears on opening page.
- Filter chips: All / Important / Urgent.
- **Admin side** (`/dashboard/admin/announcements`): create / edit / delete / pin announcements via form. New announcements appear instantly for everyone (real-time). Optionally trigger a toast for logged-in users when a new one arrives.

---

### 9.5 Section 3 — Round / PPT Submission
- Rounds listed from `rounds` (admin-managed): name, description, start, deadline, `open` flag, accepted file types.
- Each round card shows status: *Upcoming / Open / Closed / Submitted* and a **live deadline countdown**.
- Only the **team leader** (or any member if `settings/event/anyMemberCanSubmit`) can submit; others see read-only status.
- **Submission form:** Project Title, Short Description, **PPT upload** (`.ppt/.pptx/.pdf`, max 20 MB) with drag-and-drop + progress bar → Firebase Storage `submissions/{teamId}/{roundId}/{filename}`; save the download URL in RTDB. Optional fields: GitHub link, demo video link.
- Allow **re-submission/replace** until the deadline; keep `updatedAt` and version history count.
- Block submission after deadline or when round is closed (enforced in rules too).
- Show submitted file name, time, status (*Submitted / Under Review / Shortlisted / Not Shortlisted*) and admin feedback/score if provided.
- **Admin side:** view all submissions per round, download links, set status, add feedback/score.

> If Firebase Storage is unavailable on the user's plan, fall back to a **link submission** field (Google Drive/OneDrive public link) saved in RTDB. Implement the upload path first, with the fallback toggled by `settings/event/useLinkSubmission`.

---

### 9.6 Section 4 — About
Static-feeling but data-driven page: about HEXONA-LLM, Sanjivani University, organizers, rules summary, contact info, venue, and a small gallery. Text and organizer list are stored under `settings/about` so admins can edit without redeploying. Include an animated card with the AI-9 mascot.

---

### 9.7 Section 5 — Help Session
- **Upcoming sessions** (live from `helpSessions`): title, mentor, date/time, mode (Online/Offline), meeting link or room, topic tags, "Add to calendar" (.ics).
- **Ask for Help** form: Subject, Category (Technical / LLM-API / Idea / Other), Message → saved to `helpRequests/{id}` with `uid`, `teamId`, `status: "open"`.
- **My requests** list with live status (*Open / In Progress / Resolved*) and admin/mentor reply thread.
- Admin side: manage sessions and respond to requests.

---

## 10. Realtime Database Schema (no mock data)

```json
{
  "users": {
    "$uid": {
      "name": "string",
      "email": "string",
      "phone": "string",
      "college": "string",
      "year": "string",
      "role": "participant | admin",
      "teamId": "string | null",
      "lastReadAnnouncements": 0,
      "createdAt": 0
    }
  },
  "teams": {
    "$teamId": {
      "name": "string",
      "code": "string",
      "track": "string",
      "idea": "string",
      "leaderUid": "string",
      "memberCount": 1,
      "createdAt": 0,
      "members": {
        "$uid": { "name": "string", "college": "string", "joinedAt": 0 }
      }
    }
  },
  "teamCodes": { "$code": "$teamId" },
  "announcements": {
    "$id": {
      "title": "string",
      "body": "string",
      "priority": "normal | important | urgent",
      "pinned": false,
      "createdAt": 0,
      "createdBy": "uid",
      "authorName": "string"
    }
  },
  "rounds": {
    "$roundId": {
      "name": "string",
      "description": "string",
      "startDate": 0,
      "deadline": 0,
      "open": true,
      "order": 1
    }
  },
  "submissions": {
    "$roundId": {
      "$teamId": {
        "title": "string",
        "description": "string",
        "fileUrl": "string",
        "fileName": "string",
        "githubUrl": "string",
        "demoUrl": "string",
        "submittedBy": "uid",
        "submittedAt": 0,
        "updatedAt": 0,
        "status": "submitted | under_review | shortlisted | rejected",
        "score": null,
        "feedback": ""
      }
    }
  },
  "helpSessions": {
    "$id": {
      "title": "string", "mentor": "string", "startTime": 0,
      "mode": "online | offline", "link": "string", "room": "string", "tags": []
    }
  },
  "helpRequests": {
    "$id": {
      "uid": "string", "teamId": "string", "subject": "string",
      "category": "string", "message": "string",
      "status": "open | in_progress | resolved",
      "createdAt": 0,
      "replies": { "$rid": { "by": "uid", "text": "string", "at": 0 } }
    }
  },
  "settings": {
    "event": {
      "startDate": 0, "endDate": 0, "minTeamSize": 2, "maxTeamSize": 4,
      "registrationOpen": true, "anyMemberCanSubmit": false, "useLinkSubmission": false
    },
    "tracks": { "$id": { "title": "string", "description": "string" } },
    "prizes": { "first": "string", "second": "string", "third": "string" },
    "about": { "text": "string", "contact": "string", "venue": "string" }
  }
}
```

Stats on the landing page must be computed from live `users`, `teams`, `submissions` counts. If rules block public reads of those nodes, maintain a public `stats` node updated by an admin-only Cloud Function or a small `stats/{participants|teams|submissions}` counter updated transactionally on create.

---

## 11. Firebase Security Rules (`database.rules.json`) — starter

> Admin = `root.child('users').child(auth.uid).child('role').val() === 'admin'`. Set the first admin manually in the Firebase console.

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('users/'+auth.uid+'/role').val() === 'admin')",
        ".write": "auth != null && (auth.uid === $uid || root.child('users/'+auth.uid+'/role').val() === 'admin')",
        "role": {
          ".write": "root.child('users/'+auth.uid+'/role').val() === 'admin'"
        }
      }
    },
    "teams": {
      ".read": "auth != null",
      "$teamId": {
        ".write": "auth != null && (!data.exists() || data.child('leaderUid').val() === auth.uid || root.child('users/'+auth.uid+'/role').val() === 'admin')",
        "members": {
          "$uid": {
            ".write": "auth != null && ($uid === auth.uid || root.child('teams/'+$teamId+'/leaderUid').val() === auth.uid)"
          }
        },
        "memberCount": {
          ".write": "auth != null"
        }
      }
    },
    "teamCodes": {
      ".read": "auth != null",
      "$code": {
        ".write": "auth != null && (!data.exists() || root.child('users/'+auth.uid+'/role').val() === 'admin')"
      }
    },
    "announcements": {
      ".read": "auth != null",
      ".indexOn": ["createdAt"],
      "$id": { ".write": "root.child('users/'+auth.uid+'/role').val() === 'admin'" }
    },
    "rounds": {
      ".read": true,
      "$id": { ".write": "root.child('users/'+auth.uid+'/role').val() === 'admin'" }
    },
    "submissions": {
      "$roundId": {
        ".read": "root.child('users/'+auth.uid+'/role').val() === 'admin'",
        "$teamId": {
          ".read": "auth != null && root.child('teams/'+$teamId+'/members/'+auth.uid).exists()",
          ".write": "auth != null && root.child('teams/'+$teamId+'/members/'+auth.uid).exists() && root.child('rounds/'+$roundId+'/open').val() === true && root.child('rounds/'+$roundId+'/deadline').val() > now"
        }
      }
    },
    "helpSessions": {
      ".read": "auth != null",
      "$id": { ".write": "root.child('users/'+auth.uid+'/role').val() === 'admin'" }
    },
    "helpRequests": {
      ".indexOn": ["uid"],
      "$id": {
        ".read": "auth != null && (data.child('uid').val() === auth.uid || root.child('users/'+auth.uid+'/role').val() === 'admin')",
        ".write": "auth != null && (!data.exists() || data.child('uid').val() === auth.uid || root.child('users/'+auth.uid+'/role').val() === 'admin')"
      }
    },
    "settings": {
      ".read": true,
      ".write": "root.child('users/'+auth.uid+'/role').val() === 'admin'"
    },
    "stats": { ".read": true, ".write": "auth != null" }
  }
}
```
The agent should **tighten these** (team-size enforcement, validate fields with `.validate`) and note any limits in the README. Storage rules: allow write to `submissions/{teamId}/**` only for authenticated team members, max 20 MB, content types ppt/pptx/pdf; read for team members and admins.

---

## 12. Animation Spec (summary)

| Where | Effect |
|---|---|
| Page load | Hex loader → logo draws → content fades in |
| Hero title | Letter-by-letter reveal + gold light sweep |
| Robot | Infinite float (±14px, 6s), glow pulse, mouse-parallax |
| Sections | `ScrollTrigger` fade-up + stagger (0.12s) |
| Tracks | Pinned horizontal scroll |
| Timeline | SVG line draws on scroll |
| Stats | Count-up when in view |
| Cards | 3D tilt on hover, gold border shimmer |
| Buttons | Shimmer sweep, magnetic hover |
| Sidebar | Width spring, `layoutId` active pill, icon nudge |
| Route change | `AnimatePresence` slide/fade |
| Background | Grid scroll, drifting hexagons, particle links, data rain |

Keep 60fps: animate only `transform` and `opacity`; lazy-load heavy libs; code-split dashboard routes.

---

## 13. UX Details & Edge Cases

- **Empty states:** designed illustration + helpful CTA (e.g., "No announcements yet — check back soon").
- **Loading:** skeleton shimmer, never blank screens.
- **Errors:** toast + inline messages; handle offline (RTDB `.info/connected` indicator in top bar).
- **Validation:** unique team name check, trimmed inputs, phone format, email format.
- **Race conditions:** use RTDB `transaction()` on `memberCount` and `teamCodes` to avoid over-filling teams or duplicate codes.
- **Accessibility:** WCAG AA contrast (white on dark grey), focus rings, ARIA labels, keyboard-navigable sidebar.
- **SEO/meta:** title, description, Open Graph image (use robot render), theme-color `#0B0B0D`.

---

## 14. Admin Panel (`role === "admin"`)

Tabs: **Overview** (live counts), **Teams** (list, search, view members, remove), **Announcements** (CRUD + pin), **Rounds** (CRUD, open/close), **Submissions** (review, status, score, feedback, bulk download links), **Help** (sessions + requests), **Settings** (event dates, team size, tracks, prizes, about). Export teams/participants to **CSV**.

---

## 15. Deployment

- Firebase Hosting: `firebase init hosting` (SPA rewrite to `/index.html`), `npm run build`, `firebase deploy`.
- Deploy `database.rules.json` and `storage.rules` with `firebase deploy --only database,storage`.
- Enable Authentication providers: **Email/Password** and **Google**.
- README must include setup steps, how to make the first admin, and env variables.

---

## 16. Acceptance Checklist

- [ ] Title/branding reads **HEXONA-LLM** everywhere; custom logo + favicon present.
- [ ] Grey / gold / white theme with fonts (Cinzel, Playfair, Orbitron, Inter) applied.
- [ ] Animated game-scene background on Home, Auth and Dashboard.
- [ ] Smooth scroll landing page with all sections animated.
- [ ] Register / Login / Forgot password working with Firebase Auth.
- [ ] After login → dashboard with animated, styled sidebar with exactly the 5 sections.
- [ ] Create Team generates unique code; Join Team via code works; live member updates.
- [ ] Announcements update in real time, with unread badge and admin CRUD.
- [ ] PPT upload per round with deadline enforcement and live status.
- [ ] About and Help Session (sessions + help requests) functional.
- [ ] **Zero mock data**; all content comes from RTDB / Auth.
- [ ] Responsive on mobile, tablet, desktop.
- [ ] Security rules deployed and tested.

---

## 17. Build Order for the Agent

1. **Scaffold:** Vite + React + Tailwind, install deps, tokens, fonts, folder structure.
2. **Firebase:** config, auth helpers, RTDB helpers, `AuthContext`, rules files.
3. **Core components:** Logo, AnimatedBackground, GlassCard, GoldButton, Loader, EmptyState.
4. **Landing page** sections with Lenis + GSAP.
5. **Auth pages** (Login, Register, Forgot).
6. **Dashboard shell:** sidebar, top bar, route transitions.
7. **Event Registration** (create/join/team view).
8. **Announcements** (+ admin CRUD).
9. **Submissions** (rounds, upload, admin review).
10. **About** and **Help Session**.
11. **Admin panel** and settings.
12. **Polish:** responsive pass, reduced-motion, performance, a11y, SEO.
13. **Docs & deploy:** README, deploy to Firebase Hosting.

---

### Master Prompt (paste into Antigravity along with this file)

> Read `HEXONA-LLM_Antigravity_Build_Spec.md` fully and build the complete project it describes. Use the uploaded robot image `public/assets/ai-robot.png` as the AI-9 mascot in the hero and auth pages. Follow the build order in Section 17, use Firebase Auth + Realtime Database with real data only (no mock data), and make the design a polished grey/gold/white premium experience with scroll-driven animations and an animated game-style background. After each phase, run the app and fix errors before continuing.


</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-24T20:07:04+05:30.
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Claude Opus 4.6 (Thinking). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>