📘 Notes Taking App  https://notestaking-app-satyam21.vercel.app/
A modern Notes Taking App built with React + Vite, Supabase Authentication, and Google OAuth.
This app allows users to sign up/sign in using Email OTP or Google login, manage sessions, and securely access a dashboard.

Features

****Authentication****

>>Email OTP login (no password required)

>>Google OAuth login

****User Session Management****

>>Auto redirect based on login status

>>Session watcher (AuthWatcher) to handle sign-in/out

*****Notes Dashboard****

>>Personalized dashboard after login

>>Access restricted only to authenticated users

****JWT Token Auth****

>>Every logged-in user automatically receives a JWT token from Supabase (default behavior).

>>This JWT token is used to authorize API calls and database operations like deleting notes.

****Logout & Session Expiry Handling****

>>Automatic redirect to login when session expires

>>Clean session handling

>>Smooth UI with modern components


****Tech Stack****

React + Vite
 – Frontend

Supabase
 – Authentication, Database & JWT

React Router
 – Routing

TailwindCSS
 – Styling

Lucide Icons
 – Icons (eye/eye-off etc.)

 **file Structure**
 src/
 ├── components/
 │    ├── AuthWatcher.tsx   # Handles session & redirect logic
 │    └── AuthForm.tsx      # OTP + Google login form
 ├── lib/
 │    └── supabaseClient.ts # Supabase client instance
 ├── pages/
 │    ├── Login.tsx         # Login page (/)
 │    ├── Signup.tsx        # Signup page (/signup)
 │    └── Dashboard.tsx     # Protected dashboard (/dashboard)
 └── main.tsx               # Router + App entry
 └── App.tsx                


****Environment Variables****

Create a .env file in root:

VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

##**Supabase Setup**##

>>Go to Supabase Dashboard

>>Create a new project → copy API URL and Anon Key (Project Settings → API).

>>Enable Email OTP Auth (Authentication → Providers → Email).

>>Enable Google Auth (Authentication → Providers → Google).

>>Add Redirect URLs:

>>Local: http://localhost:5173/

>>Production: https://Notetaking-app-satyam21.vercel.app/

>>Paste the keys in .env

####**This project uses two main tables in Supabase:**####
##**Postgre SQL Querry for users table and notes table:**##

create table users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  dob date,
  created_at timestamp with time zone default now()
);

create table notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

▶️ Run Locally
# install dependencies
npm install

# run dev server
npm run dev

App will start on http://localhost:5173


# **Deployment**
Vercel
Push your repo to GitHub.
Import into Vercel
Add .env variables in Vercel Project Settings → Environment Variables.
Deploy 

# ****How Auth Flow Works****

User visits / → can login using OTP or Google.

AuthWatcher.tsx listens to auth state changes:

If session == null → stay on / or /signup.

If logged in → redirect to /dashboard.

Logout clears session → user auto-redirected back to /.


# **JWT Token in Supabase**

Supabase issues a JWT token automatically whenever a user logs in.

This token is stored securely and is sent with every request made via the Supabase client.

Using Row Level Security (RLS) in Supabase, only the owner of a note (matched via user_id inside JWT claims) can view, or delete their own notes.

This ensures multi-user security without extra backend code.


# ****Common Issues & Fixes****

Supabase env missing in production
→ Make sure .env variables are also set in Vercel Project Settings.

Redirect goes to wrong domain (local vs production)
→ Update allowed redirect URLs in Supabase → Authentication → Redirect URLs.

Session expired but not logged out
→ AuthWatcher handles this by auto redirecting back to /

With this setup, every operation (like deleting notes) is secured by Supabase JWT tokens + Row Level Security.



