# Leornian - AI-Powered Health Analytics Platform

*Leornian* (Old English): to read, study, or learn.

[Visit!](https://leo.jackcrew.net)

## Features

### Core Functionality
- **Health Data Tracking**: Customize and log daily health/wellness metrics
- **WHOOP Integration**: Seamless connection with WHOOP wearable devices
- **Interactive Chat**: AI assistant for health queries and recommendations

### Tech Stack

#### Frontend
- React
- Vite
- Tailwind CSS

#### Backend
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT
- OpenAI
- WHOOP API

## Local Deployment

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Docker (optional, for database)

### 1. Clone & Install

```bash
git clone https://github.com/realjackcrew/leornian.git
cd leornian
chmod +x install.sh
./install.sh
```

### 2. Database Setup

**Option A: Docker (Recommended)**
```bash
cd server
docker-compose up -d
```

**Option B: Local PostgreSQL**
- Install PostgreSQL locally
- Create a database named `leornian_db`

### 3. Environment Configuration

Copy the example environment files and add your API keys:

```bash
cd server
cp .env.example .env
cd ../client
cp .env.example .env
```

**Required API Key Links:**
- [OpenAI](https://platform.openai.com/)
- [Whoop](https://developer.whoop.com/) *(requires active membership)*
- [Google OAuth](https://console.cloud.google.com/)
- [Resend](https://resend.com/)

### 4. Initialize Database

```bash
cd server
npx prisma generate
npx prisma migrate deploy
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 6. Access Your App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000

## How to Use

1. **Sign Up** - Create your account on the homepage
2. **Set Up Profile** - Configure your health tracking preferences
3. **Connect Devices** - Link your WHOOP device (optional)
4. **Start Logging** - Begin tracking your daily health metrics
5. **Get Insights** - Chat with the AI assistant about your health data

### Useful Commands

#### Development
```bash
# Client
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview build

# Server
npm run dev        # Start dev server
npm run build      # Build TypeScript
npm run start      # Production server
```

#### Database Management
```bash
npx prisma generate      # Generate client
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open database GUI
npx prisma migrate reset # Reset database
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Query to JSON object conversion (prevents SQL injection)

## License

MIT