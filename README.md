:

🚀 Chyrp Lite Revamp – Next.js + Firebase
Modernizing the legacy Chyrp Lite PHP blogging platform into a scalable, serverless, and performant app powered by Next.js and Firebase.

✨ Features

→🔑 Authentication – Firebase Auth (Email/Password, Social logins planned)

→📝 Rich Content Types – Text, Photo, Quote, Link, Video, Audio, Multi-file uploader

→🎨 Themes – Switchable, component-driven theming system

→👥 User Roles & Permissions – Visitor, User, Editor, Admin

→💬 Interactive Features – Comments, Likes, Tags, Categories

→📈 SEO & Performance – SSR/SSG, ISR, Firebase CDN

→🔌 Modular Extensions – Toggle features like Infinite Scroll, Lightbox, Read More, Syntax Highlighting

→🔒 Spam Prevention – CAPTCHA (replacing legacy MAPTCHA)

🛠️ Tech Stack

→ F͟r͟o͟n͟t͟e͟n͟d͟: Next.js
 (React + SSR + SSG)<br>
→ ͟Ba͟c͟k͟e͟n͟d͟: Firebase
 (Firestore, Auth, Storage, Functions, Hosting)<br>
→ S͟t͟y͟l͟i͟n͟g͟: TailwindCSS + Component-based themes<br>
→ E͟d͟i͟t͟o͟r͟: Markdown / Rich Text (TipTap planned)<br>
→ D͟e͟p͟l͟o͟y͟m͟e͟n͟t͟: Firebase Hosting<br>

📂 Content Types ("Feathers")

● Text → Blog posts / Articles<br>
● Photo → Image with captions<br>
● Quote → Highlight quotations<br>
● Link → Share external links<br>
● Video → Upload/Embed videos<br>
● Audio → Upload/Embed audio<br>
● Uploader → Multiple files in a gallery<br>

📦 Extensions (Modules)

→ ⚡ Cacher → ISR + CDN caching

→ 🏷️ Tags & Categories → Organize posts

→ 💬 Comments → Firestore-based, with moderation

→ ❤️ Likes → Per post

→ 📊 Post Views → Analytics counter

→ 📚 Read More → Excerpts for long posts

→ 💡 Lightbox → Modern image viewer

→ 🗺️ Sitemap → Auto-generated for SEO

→ 🧮 MathJax → Render LaTeX equations

→ 🎨 Syntax Highlighting → Code block styling

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

Full PRD available in [PRD Documentation](docs/PRD.md)

🏆 Hackathon Purpose

This project is built for Clone Fest – Codex Frieza, with the goal of modernizing a classic blogging engine while showing off Next.js + Firebase scalability.
