# 🚀 𝐂𝐡𝐲𝐫𝐩 𝐋𝐢𝐭𝐞 𝐑𝐞𝐯𝐚𝐦𝐩 – Next.js + Firebase
Modernizing the legacy Chyrp Lite PHP blogging platform into a scalable, serverless, and performant app powered by Next.js and Firebase.

✨ 𝐅𝐞𝐚𝐭𝐮𝐫𝐞𝐬

→🔑 Authentication – Firebase Auth (Email/Password, Social logins planned)

→📝 Rich Content Types – Text, Photo, Quote, Link, Video, Audio, Multi-file uploader

→🎨 Themes – Switchable, component-driven theming system

→👥 User Roles & Permissions – Visitor, User, Editor, Admin

→💬 Interactive Features – Comments, Likes, Tags, Categories

→📈 SEO & Performance – SSR/SSG, ISR, Firebase CDN

→🔌 Modular Extensions – Toggle features like Infinite Scroll, Lightbox, Read More, Syntax Highlighting

→🔒 Spam Prevention – CAPTCHA (replacing legacy MAPTCHA)

🛠️ 𝐓𝐞𝐜𝐡 𝐒𝐭𝐚𝐜𝐤

→ F͟r͟o͟n͟t͟e͟n͟d͟: Next.js
 (React + SSR + SSG)<br>
→ ͟Ba͟c͟k͟e͟n͟d͟: Firebase
 (Firestore, Auth, Storage, Functions, Hosting)<br>
→ S͟t͟y͟l͟i͟n͟g͟: TailwindCSS + Component-based themes<br>
→ E͟d͟i͟t͟o͟r͟: Markdown / Rich Text (TipTap planned)<br>
→ D͟e͟p͟l͟o͟y͟m͟e͟n͟t͟: Firebase Hosting<br>

📂𝐂𝐨𝐧𝐭𝐞𝐧𝐭 𝐓𝐲𝐩𝐞𝐬 ("𝐅𝐞𝐚𝐭𝐡𝐞𝐫𝐬")

● Text → Blog posts / Articles<br>
● Photo → Image with captions<br>
● Quote → Highlight quotations<br>
● Link → Share external links<br>
● Video → Upload/Embed videos<br>
● Audio → Upload/Embed audio<br>
● Uploader → Multiple files in a gallery<br>

📦 𝐄𝐱𝐭𝐞𝐧𝐬𝐢𝐨𝐧𝐬 (𝐌𝐨𝐝𝐮𝐥𝐞𝐬)

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

🚀 𝐆𝐞𝐭𝐭𝐢𝐧𝐠 𝐒𝐭𝐚𝐫𝐭𝐞𝐝
1. Clone the repo
git clone https://github.com/VTG56/student-registration-app-67741.git
cd student-registration-app-67741

2. Install dependencies
npm install

3. Run locally
npm run dev


App will be available at http://localhost:3000

🌩️𝐅𝐢𝐫𝐞𝐛𝐚𝐬𝐞 𝐒𝐞𝐭𝐮𝐩

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

👥 𝐔𝐬𝐞𝐫 𝐑𝐨𝐥𝐞𝐬

Visitor → View, like, comment<br>

User → Basic registered privileges<br>

Editor → Create & manage own posts<br>

Admin → Full site control<br>

📖 𝐃𝐨𝐜𝐮𝐦𝐞𝐧𝐭𝐚𝐭𝐢𝐨𝐧

Full PRD available in [PRD Documentation](docs/PRD.md)

🏆 𝐇𝐚𝐜𝐤𝐚𝐭𝐡𝐨𝐧 𝐏𝐮𝐫𝐩𝐨𝐬𝐞

This project is built for Clone Fest – Codex Frieza, with the goal of modernizing a classic blogging engine while showing off Next.js + Firebase scalability.
