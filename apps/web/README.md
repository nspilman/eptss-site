# Everyone Plays the Same Song 🎶

Welcome to the **Everyone Plays the Same Song** project! This is a community-driven web application where musicians of all levels come together to cover the same song. Explore, create, and grow your musical journey with us!

## Features

- **Signup & Participation**: Join the community, suggest songs, and vote on the next track to cover.
- **Song Voting System**: A streamlined voting process helps the community decide the song for each round.
- **Cover Submission**: Submit your unique take on the winning song.
- **Listening Parties**: Celebrate creativity with compiled playlists shared at virtual listening parties.
- **Admin Dashboard**: Manage rounds, view submissions, and track progress.
- **Blog & Resources**: Access articles and resources to enhance your musical craft.

## Tech Stack

- **Frontend**: Next.js, React
- **Styling**: Tailwind CSS
- **State Management**: Context API
- **Authentication**: Supabase
- **Database**: Supabase Postgres
- **Charting**: Chart.js
- **Deployment**: Netlify

## Project Structure

```plaintext
.
├── app/                     # Application pages and components
│   ├── api/                 # API routes
│   ├── auth/                # Authentication flows
│   ├── blog/                # Blog functionality
│   ├── index/               # Homepage content
│   ├── sign-up/             # Signup forms and related pages
│   ├── submit/              # Submission forms
│   ├── voting/              # Voting pages
│   └── admin/               # Admin dashboard
├── components/              # Reusable UI components
├── types/                   # TypeScript types and enums
├── utils/                   # Utility functions and helpers
├── styles/                  # Global and component-specific styles
├── middleware.ts            # Middleware for session updates
├── tailwind.config.js       # Tailwind CSS configuration
└── bun.lockb                # Bun dependency lock file
```
Installation and Setup
Prerequisites
Node.js >= 16
Yarn or Bun
Supabase account
Steps
Clone the repository:

```bash
git clone https://github.com/your-username/everyone-plays-the-same-song.git
cd everyone-plays-the-same-song
```
Install dependencies:

```bash
bun install
```

Create a .env file in the root directory and configure the required environment variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Other keys as needed.
Run the development server:

```bash
bun dev
```
Open the application in your browser:
http://localhost:3000

For deployment, push the repository to a connected Netlify site, ensuring the required environment variables are configured in Netlify's settings.

How It Works
Sign Up: Register to participate in the current or next round.
Suggest & Vote: Submit song ideas and vote on community suggestions.
Create: Record your cover of the selected song and submit your masterpiece.
Celebrate: Share and listen to covers at the community's listening party.
Contribution
We welcome contributions! Please follow these steps to get started:

Fork the repository.
Create a feature branch.
Make your changes and test thoroughly.
Submit a pull request.
License
This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgements
Community members for their creativity and participation.
Open-source libraries and tools.
Start your musical journey today with Everyone Plays the Same Song!

