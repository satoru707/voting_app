# UniVote - University E-Voting System

A comprehensive, secure e-voting platform designed specifically for universities with cryptographic integrity verification, role-based access control, and mobile-first design.

## Features

### Security & Integrity

- **Hash-chain Verification**: Each ballot contains a SHA256 fingerprint linking to the previous ballot
- **Magic Link Authentication**: Secure passwordless login via university matric number
- **Role-based Access Control**: Students, Faculty Admins, Department Admins, and Super Admins
- **Audit Logging**: Complete trail of all critical system actions
- **Rate Limiting**: Protection against brute force and spam attacks

### Voting System

- **Multi-position Elections**: Support for multiple positions in a single election
- **Real-time Results**: Live vote counting with comprehensive analytics
- **Scope-based Elections**: University-wide, Faculty, or Department level elections
- **Year Filtering**: Restrict elections to specific academic years
- **One Vote Guarantee**: Cryptographic and database constraints prevent double voting

### User Experience

- **Mobile-first Design**: Optimized for all devices with responsive breakpoints
- **Intuitive Interface**: Clean, modern UI with smooth animations
- **Progressive Disclosure**: Complex features revealed contextually
- **Accessibility**: WCAG compliant with proper contrast ratios and keyboard navigation

## Quick Start

### Frontend Setup

```bash
npm install
npm run dev
```

### Backend Setup

```bash
npm run server:setup
cd server
cp .env.example .env
# Edit .env with your database and email configuration
npm run prisma:migrate
npm run dev
```

## Database Schema

The system uses PostgreSQL with Prisma ORM. Key entities:

- **Students**: University students with matriculation numbers
- **Elections**: Voting events with scope and timing controls
- **Ballots**: Individual votes with cryptographic fingerprints
- **Candidates**: Students running for specific positions
- **Admins**: Faculty and department level administrators
- **Integrity Chain**: Hash-linked ballots for verification

## API Endpoints

### Authentication

- `POST /api/auth/request-link` - Request magic link
- `POST /api/auth/verify` - Verify magic link token

### Elections

- `GET /api/elections` - List available elections
- `GET /api/elections/:id` - Get election details
- `POST /api/elections/:id/votes` - Cast votes
- `GET /api/elections/:id/results` - View results (closed elections)

### Admin

- `GET /api/admin/elections` - Manage elections
- `POST /api/admin/elections` - Create new election
- `POST /api/admin/elections/:id/candidates` - Add candidates
- `POST /api/admin/elections/:id/close-request` - Request election closure

### Super Admin

- `GET /api/super/admins` - List all admins
- `POST /api/super/admins` - Create new admin
- `DELETE /api/super/admins/:id` - Remove admin

## Environment Variables

Create a `.env` file in the `server` directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/univote"
JWT_SECRET="your-super-secret-jwt-key"
FRONTEND_URL="http://localhost:5173"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@univote.com"
NODE_ENV="development"
```

## Architecture

### Frontend (React + TypeScript)

- **Component Architecture**: Modular, reusable components
- **State Management**: React Context for authentication
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React for consistent iconography

### Backend (Express + Prisma)

- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT sessions with HTTP-only cookies
- **Security**: Helmet, CORS, rate limiting
- **Email**: Nodemailer for magic link delivery

### Hash-chain Integrity

Each ballot contains a fingerprint calculated as:

```
fingerprint_i = SHA256(fingerprint_{i-1} + ballot_data)
```

Starting with `fingerprint_0 = SHA256("genesis:" + election_id)`, this creates an immutable chain that can verify the complete election integrity.

## Development

### Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # UI components
│   ├── context/           # React context providers
│   ├── types/             # TypeScript interfaces
│   └── utils/             # Helper functions
├── server/                 # Backend Express application
│   ├── src/               # Server source code
│   ├── prisma/            # Database schema and migrations
│   └── package.json       # Server dependencies
└── package.json           # Frontend dependencies
```

### Testing Accounts (Development)

- **Student**: john.doe@university.edu
- **Admin**: admin@university.edu
- **Super Admin**: super@university.edu

## Security Considerations

1. **Authentication**: Magic links expire in 15 minutes and are single-use
2. **Authorization**: Strict role-based access control at all levels
3. **Data Integrity**: Hash-chain verification prevents ballot tampering
4. **Privacy**: Voter anonymity maintained while enabling verification
5. **Audit Trail**: Complete logging of administrative actions

## Deployment

The application is designed for production deployment with:

- Environment-specific configurations
- Database migrations
- Email service integration
- HTTPS enforcement in production
- Proper CORS and security headers

For production deployment, ensure all environment variables are properly configured and use a secure SMTP service for email delivery.
