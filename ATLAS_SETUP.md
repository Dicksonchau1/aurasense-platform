# ATLAS Flight Stack - Setup & Deployment Guide

## Overview

ATLAS is a comprehensive neuromorphic drone inspection platform built with Next.js, Supabase, and NextAuth. It provides real-time telemetry, sensor calibration, flight mode management, and mission planning for ArduPilot-based drones.

## Prerequisites

- Node.js 18+ and pnpm
- Supabase account (https://supabase.com)
- GitHub account for version control
- ArduPilot compatible drone

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Dicksonchau1/aurasense-platform.git
cd aurasense-platform
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to https://supabase.com and create a new project
2. Note your project URL and anon key
3. In the SQL Editor, run the migration script:
   - Copy contents of `supabase/migrations/001_init_atlas.sql`
   - Paste into SQL Editor and execute

#### Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXTAUTH_SECRET=generate-with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

### 4. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in `.env.local`

### 5. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

### 6. Login with Demo Credentials

- **Email**: demo@atlas.local
- **Password**: demo123

## Features

### 🚁 Drone Management

- **Registry**: View all drones with real-time status
- **Specifications**: ArduPilot sensor details and capabilities
- **Telemetry**: Live flight data (position, attitude, velocity, battery)
- **Health Monitoring**: Battery, GPS, altitude tracking

### 📡 Sensor Calibration

- **Accelerometer**: Self-leveling calibration
- **Gyroscope**: Automatic startup calibration
- **Compass**: Figure-8 pattern calibration
- **Barometer**: Altitude reference calibration
- **Progress Tracking**: Step-by-step calibration workflow

### 🎮 Flight Mode Control

- **Manual Modes**: STABILIZE, ACRO, DRIFT, SPORT
- **Assisted Modes**: ALT_HOLD, LOITER, POSHOLD
- **Autonomous Modes**: AUTO, GUIDED, RTH, LAND
- **Special Modes**: AUTOTUNE, THROW, CIRCLE
- **Arm/Disarm**: Safe drone arming with mode selection

### 📊 Telemetry Viewer

- **Position & Attitude**: GPS, altitude, heading, roll/pitch/yaw
- **Velocity**: 3-axis velocity vectors
- **Battery**: Voltage, current, percentage
- **GPS/GNSS**: Satellite count, HDOP accuracy
- **IMU Sensors**: Accelerometer and gyroscope data
- **System Status**: CPU load, system time

### 🗺️ Mission Planning

- Waypoint-based mission creation
- Real-time mission execution tracking
- Mission history and analytics

### 📋 Registry System

- Device discovery and registration
- Service endpoint management
- Connection status monitoring
- Metadata storage

## API Endpoints

### Drones

```
GET  /api/drones?organization_id=<id>              # List drones
POST /api/drones                                     # Create drone
```

### Sensors

```
GET  /api/drones/<droneId>/sensors                 # List sensors
POST /api/drones/<droneId>/sensors                 # Add sensor
POST /api/drones/<droneId>/sensors/<sensorId>/calibrate  # Calibrate sensor
```

### Telemetry

```
GET  /api/drones/<droneId>/telemetry?limit=100    # Get telemetry data
POST /api/drones/<droneId>/telemetry               # Record telemetry
```

### Flight Modes

```
GET  /api/drones/<droneId>/flight-modes           # List modes
POST /api/drones/<droneId>/flight-modes           # Set mode
```

### Registry

```
GET  /api/registry?organization_id=<id>           # List registry entries
POST /api/registry                                  # Register device
PATCH /api/registry/<registryId>                   # Update entry
DELETE /api/registry/<registryId>                  # Remove entry
```

## Database Schema

### Core Tables

- **organizations**: Multi-tenant organization management
- **users**: User accounts and roles
- **drones**: Drone registry and status
- **sensors**: ArduPilot sensor configuration
- **calibration_states**: Sensor calibration progress
- **telemetry**: Real-time flight data
- **flight_modes**: Drone flight mode configuration
- **missions**: Mission planning and execution
- **registry**: Device and service registry
- **audit_log**: Compliance and audit trail

## Authentication

ATLAS uses NextAuth with Supabase for authentication:

- **Provider**: Credentials (email/password)
- **Session**: JWT-based (30 days)
- **Database**: Supabase Auth + custom users table
- **Roles**: admin, operator, viewer

### User Roles

| Role | Permissions |
|------|------------|
| admin | Full access, user management, organization settings |
| operator | Drone control, mission planning, telemetry viewing |
| viewer | Read-only access to telemetry and status |

## Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "ATLAS Flight Stack - Full implementation"
git push origin main

# Deploy via Vercel Dashboard
# 1. Connect your GitHub repo
# 2. Set environment variables
# 3. Deploy
```

### Environment Variables for Production

```
NEXT_PUBLIC_SUPABASE_URL=<production-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-key>
NEXTAUTH_SECRET=<secure-random-key>
NEXTAUTH_URL=https://your-domain.com
```

### Custom Domain

1. In Vercel Dashboard: Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Development

### Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── login/          # Authentication
│   │   └── layout.tsx      # Root layout
│   ├── components/
│   │   ├── dashboard/      # Dashboard components
│   │   └── ui/             # UI components
│   ├── lib/
│   │   ├── supabase-client.ts  # Supabase client
│   │   └── utils.ts        # Utilities
│   └── styles/             # Global styles
├── supabase/
│   └── migrations/         # Database migrations
├── .env.example            # Environment template
└── package.json            # Dependencies
```

### Adding New Features

1. **Database Changes**: Create migration in `supabase/migrations/`
2. **API Routes**: Add to `src/app/api/`
3. **Components**: Add to `src/components/dashboard/`
4. **Pages**: Add to `src/app/`

### Testing

```bash
# Run type checking
pnpm check

# Format code
pnpm format

# Build for production
pnpm build
```

## Troubleshooting

### "Cannot find module" errors

Ensure all environment variables are set in `.env.local`

### Database connection issues

1. Check Supabase project is running
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and key are correct
3. Check RLS policies are enabled

### Authentication not working

1. Verify `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your domain
3. Ensure Supabase auth is configured

### Telemetry not updating

1. Check drone is sending data to API
2. Verify API routes are accessible
3. Check database permissions/RLS policies

## Support & Documentation

- **ArduPilot Docs**: https://ardupilot.org/
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **NextAuth Docs**: https://next-auth.js.org/

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contact

For questions or support, please open an issue on GitHub.
