# Photo Sharing App

This is a full-stack photo sharing application built with React, Vite, Express, and Supabase. It allows users to sign up, sign in, and access admin privileges depending on permissions.

## Features

- User authentication (sign up, sign in, sign out)
- JWT-based authentication
- Admin dashboard for user management
- Responsive design with Tailwind CSS
- Protected routes for authenticated users
- Role-based access control for admin features

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/photo-sharing-app.git
   cd photo-sharing-app
   ```

2. **Set up environment variables:**

   Create a `.env` file in the `server` directory with the following variables:

   ```plaintext
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   ```

   Also, Create a `.env` file in the `client` directory with the following variables:

   ```plaintext
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY =your_supabase_anon_key
   ```

3. **Install dependencies:**

   Navigate to both the `client` and `server` directories and install the dependencies:

   ```bash
   npm install
   ```

## Running the Application

1. **Start the server:**

   Navigate to the `server` directory and run:

   ```bash
   npm run dev
   ```

   This will start the server on `http://localhost:3000`.

2. **Start the client:**

   Navigate to the `client` directory and run:

   ```bash
   npm run dev
   ```

   This will start the client on `http://localhost:5173`.

## Usage

- **Sign Up:** Create a new account by providing an email and password.
- **Sign In:** Access your account using your email and password.
- **Dashboard:** View your dashboard with personalized content.
- **Admin Dashboard:** If you have admin privileges, access the admin dashboard to manage users.
