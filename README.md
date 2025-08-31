:

🚀 Chyrp Lite Revamp – Next.js + Firebase

Re-engineering the legacy Chyrp Lite PHP blogging platform into a modern, serverless, and scalable app powered by Next.js and Firebase.

✨ Features

🔑 Authentication – Firebase Auth (Email/Password + Social Logins planned)

📝 Rich Content Types (Text, Photo, Quote, Link, Video, Audio, Multi-file Uploader)

🎨 Themes – Switchable, component-based theming

👥 User Roles & Permissions (Visitor, User, Editor, Admin)

💬 Interactive Features – Comments, Likes, Tags, Categories

📈 SEO & Performance – SSR/SSG, Incremental Static Regeneration, Firebase CDN

🔌 Modular System – Enable/disable extensions like Infinite Scroll, Lightbox, Read More, Syntax Highlighting, etc.

🔒 Spam Prevention – Modern CAPTCHA integration (replacing old MAPTCHA)

🛠️ Tech Stack

Frontend: Next.js
 (React + SSR + SSG)

Backend: Firebase
 (Firestore, Auth, Storage, Functions, Hosting)

Styling: TailwindCSS + Component-based themes

Editor: Markdown / Rich Text (TipTap planned)

Deployment: Firebase Hosting

📂 Content Types ("Feathers")

Text → Blog posts / Articles

Photo → Image with captions

Quote → Highlight quotations

Link → Share external links

Video → Upload/Embed videos

Audio → Upload/Embed audio

Uploader → Multiple files in a gallery

📦 Extensions (Modules)

⚡ Cacher → ISR + CDN caching

🏷️ Tags & Categories → Organize posts

💬 Comments → Firestore-based, with moderation

❤️ Likes → Per post

📊 Post Views → Analytics counter

📚 Read More → Excerpts for long posts

💡 Lightbox → Modern image viewer

🗺️ Sitemap → Auto-generated for SEO

🧮 MathJax → Render LaTeX equations

🎨 Syntax Highlighting → Code block styling

🚀 Getting Started
1. Clone the repo
git clone https://github.com/VTG56/student-registration-app-67741.git
cd student-registration-app-67741

2. Install dependencies
npm install

3. Run locally
npm run dev


App will be available at http://localhost:3000

🌩️ Firebase Setup

Create a Firebase project

Enable Authentication, Firestore, Storage, Hosting

Add your Firebase config inside .env.local

NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxx


Deploy with:

firebase deploy

👥 User Roles

Visitor → View, like, comment

User → Basic registered privileges

Editor → Create & manage own posts

Admin → Full site control

📖 Documentation

Full PRD available in docs/PRD.md

🏆 Hackathon Purpose

This project is built for Clone Fest – Codex Frieza, with the goal of modernizing a classic blogging engine while showing off Next.js + Firebase scalability.
