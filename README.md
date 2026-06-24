# 🚀 DevEvent — Developer Event Management Platform

**Live Demo:**
[DevEvent Live Application](https://dev-event-next-js-six.vercel.app/)

**GitHub Repository:**
[DevEvent Source Code](https://github.com/LakshyaSaxena49/DevEvent-Next.js)

---

## 📌 Overview

DevEvent is a full-stack event management platform built with **Next.js 16**, **MongoDB Atlas**, **Cloudinary**, and **TypeScript**. The platform enables developers and organizers to create, discover, and register for technology events such as hackathons, meetups, workshops, conferences, and coding competitions.

The application leverages the modern App Router architecture of Next.js, dynamic routing, server components, server actions, and cloud-based media storage to deliver a fast and scalable experience. ([Next.js][1])

---

## ✨ Features

### 🎯 Event Management

* Create new events
* Upload event banners through Cloudinary
* Automatic slug generation
* Dynamic event pages
* Similar event recommendations
* Event categorization using tags
* Agenda management

### 🎟 Event Registration

* Register for events using email
* Duplicate booking prevention
* Booking persistence in MongoDB
* Real-time registration handling

### 📊 Analytics

* PostHog event tracking
* User interaction monitoring
* Booking analytics

### ⚡ Performance

* Next.js App Router
* Server Components
* Dynamic Routes
* Optimized Image Loading
* Cloudinary CDN Delivery

### 🗄 Database

* MongoDB Atlas
* Mongoose ODM
* Data Validation
* Schema Indexing
* Relationship Mapping

---

## 🛠 Tech Stack

| Category        | Technologies                     |
| --------------- | -------------------------------- |
| Frontend        | Next.js 16, React 19, TypeScript |
| Styling         | Tailwind CSS                     |
| Backend         | Next.js Route Handlers           |
| Database        | MongoDB Atlas, Mongoose          |
| Image Storage   | Cloudinary                       |
| Analytics       | PostHog                          |
| Deployment      | Vercel                           |
| Version Control | Git & GitHub                     |

---

## 📂 Project Structure

```bash
app/
│
├── api/
│   ├── events/
│   └── bookings/
│
├── events/
│   └── [slug]/
│
components/
│
database/
│   ├── event.model.ts
│   ├── booking.model.ts
│
lib/
│   ├── mongodb.ts
│   ├── events.ts
│   ├── actions/
│
public/
│
└── globals.css
```

---

## 📸 Core Pages

### Home Page

* Featured events listing
* Event discovery
* Dynamic event cards

### Event Details Page

* Complete event information
* Event overview
* Agenda section
* Event organizer details
* Registration form
* Similar events section

### Create Event Page

* Event creation form
* Cloudinary image upload
* Validation handling

---

## 🗃 Database Models

### Event Model

```typescript
{
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}
```

### Booking Model

```typescript
{
  eventId: ObjectId;
  email: string;
}
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/LakshyaSaxena49/DevEvent-Next.js.git
```

```bash
cd DevEvent-Next.js
```

### Install Dependencies

```bash
npm install
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

NEXT_PUBLIC_BASE_URL=http://localhost:3000

NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## 🚀 Run Locally

```bash
npm run dev
```

Visit:

```bash
http://localhost:3000
```

---

## 📋 Event Creation Workflow

1. User opens Create Event page.
2. Event information is entered.
3. Banner image is uploaded to Cloudinary.
4. Event data is validated.
5. Event is stored in MongoDB.
6. Unique slug is generated automatically.
7. Event appears on the homepage.

---

## 🎟 Registration Workflow

1. User visits an event page.
2. Email is submitted through booking form.
3. Booking is validated.
4. Duplicate registrations are prevented.
5. Booking record is stored in MongoDB.
6. Event registration is tracked through PostHog.

---

## 📈 Learning Outcomes

This project demonstrates practical experience with:

* Next.js App Router
* Server Components
* Server Actions
* Dynamic Routing
* MongoDB Atlas
* Mongoose ODM
* Cloudinary Integration
* API Route Handlers
* TypeScript
* Analytics Integration
* Full-Stack Application Architecture

---

## 🔮 Future Enhancements

* User Authentication
* Admin Dashboard
* Event Editing
* Event Deletion
* Search & Filtering
* Email Notifications
* Ticket Generation
* Google Calendar Integration
* User Profiles
* Role-Based Access Control

---

## 👨‍💻 Author

### Lakshya Saxena

**B.Tech Computer Science & Engineering (2022–2026)**
Raj Kumar Goel Institute of Technology

GitHub:
[LakshyaSaxena49 GitHub Profile](https://github.com/LakshyaSaxena49)

---

## ⭐ Support

If you found this project helpful:

```bash
⭐ Star the repository
🍴 Fork the repository
📢 Share the project
```

Contributions, suggestions, and feedback are always welcome.

---

### Built with Next.js, MongoDB, Cloudinary, and TypeScript. 🚀 ([JS Mastery Pro][2])

[1]: https://nextjs.org/ "Next.js by Vercel - The React Framework"
[2]: https://jsmastery.com/video-kit/93f20ce7-ace5-4a74-997d-3f8262f3e0a3 "Build & Deploy a Dev Event Platform with Next.js 16"
