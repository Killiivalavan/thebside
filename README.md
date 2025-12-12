# The B-side 🎵

**Where Hot Takes are the Hottest Tracks**

A modern music review and social platform for discovering, rating, and discussing music with friends. Built with React, TypeScript, and Supabase.

🌐 **Live Site**: [thebside.club](https://thebside.club)

---

## ✨ Features

### 🎧 Music Discovery
- **Search & Explore**: Search for albums, tracks, artists, and playlists powered by Spotify
- **Personalized Recommendations**: Get tailored music suggestions based on your listening habits
- **Spotify Integration**: Seamlessly connect your Spotify account to sync your library

### ⭐ Rate & Review
- **Star Ratings**: Rate albums and tracks on a 5-star scale
- **Written Reviews**: Share your thoughts and hot takes on music
- **Review Threading**: Reply to reviews and engage in discussions
- **Private Reviews**: Keep reviews private or share them with the community

### 📝 Curate Lists
- **Custom Lists**: Create ranked lists of your favorite albums and tracks
- **Export to Spotify**: Convert your lists into Spotify playlists instantly
- **Share & Discover**: Browse lists created by other music lovers

### 👥 Social Features
- **Follow Friends**: Keep track of what your friends are listening to
- **Activity Feed**: See recent reviews, lists, and ratings from people you follow
- **User Profiles**: Showcase your music taste and listening history
- **Community Insights**: Discover trending albums and popular reviews

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **TailwindCSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching and caching
- **React Router** for navigation

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** for data storage
- **Row Level Security (RLS)** for data protection
- **Supabase Edge Functions** (Deno) for serverless API

### External APIs
- **Spotify Web API** for music data and integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Spotify Developer account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/thebside.git
   cd thebside
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   ```

4. **Set up Supabase**
   
   Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```
   
   Link to your Supabase project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   
   Run migrations:
   ```bash
   supabase db push
   ```
   
   Deploy Edge Functions:
   ```bash
   supabase functions deploy
   ```

5. **Configure Spotify Developer App**
   
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add redirect URIs:
     - `http://localhost:5173/discover` (for local development)
     - `https://yourdomain.com/discover` (for production)
   - Copy your Client ID to the `.env` file

6. **Start the development server**
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```
thebside/
├── public/              # Static assets
│   └── albums/         # Album cover images
├── src/
│   ├── components/     # React components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   ├── pages/          # Page components
│   └── types/          # TypeScript type definitions
├── supabase/
│   ├── functions/      # Edge Functions (Deno)
│   └── migrations/     # Database migrations
└── ...
```

---

## 🗄️ Database Schema

### Core Tables
- `users` - User profiles and authentication
- `reviews` - Album/track reviews with ratings
- `review_likes` - Like system for reviews
- `lists` - User-created music lists
- `list_items` - Items within lists
- `follows` - User follow relationships
- `spotify_tokens` - Spotify OAuth tokens

### Key Features
- **Row Level Security (RLS)** on all tables
- **Recursive CTEs** for review threading
- **Database functions** for complex queries
- **Triggers** for automatic timestamps

---

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `supabase functions deploy` - Deploy Edge Functions
- `supabase db push` - Apply database migrations

---

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Supabase)
1. Database migrations are applied via Supabase CLI
2. Edge Functions are deployed via `supabase functions deploy`
3. Environment variables are set in Supabase dashboard

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 📧 Contact

For bug reports or feature requests, please contact:
- Email: dev.killie@gmail.com
- Website: [thebside.club](https://thebside.club)

---

**Built with ❤️ by music lover, for music lovers**
