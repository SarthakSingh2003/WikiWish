# Development Guide

This document provides information for developers who want to contribute to WikiWish.

## Project Structure

```
wikiwish/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Route pages
│   │   ├── types/         # TypeScript types
│   │   ├── styles/        # Global styles
│   │   └── App.tsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # Node.js backend
│   ├── src/
│   │   ├── lib/           # Wikimedia API client
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── API.md
│   └── WIKIMEDIA_INTEGRATION.md
│
├── .env.example           # Environment template
└── README.md              # Project README
```

## Development Setup

### Prerequisites

- Node.js 18+ or later
- npm or yarn
- Git

### Quick Start

1. Clone and setup:
```bash
git clone https://github.com/wikiwish/wikiwish.git
cd wikiwish

# Create env files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

3. Run both servers:
```bash
# Terminal 1: Backend
npm run dev --prefix backend

# Terminal 2: Frontend
npm run dev --prefix frontend
```

### OAuth Configuration (for full testing)

To test the full OAuth flow, you need OAuth credentials:

1. Go to https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose
2. Propose a consumer with:
   - Callback URL: `http://localhost:8080/api/auth/callback`
   - Description: "WikiWish development test"
3. Copy the consumer key and secret to `backend/.env`

### Testing Wikimedia API

Test the Community Wishlist API:
```bash
curl "https://meta.wikimedia.org/w/api.php?action=query&list=communityrequests-wishes&format=json&crwlimit=5"
```

Test parsing a wish page:
```bash
curl "https://meta.wikimedia.org/w/api.php?action=parse&page=Community_Wishlist/W930&prop=text&format=json"
```

## Code Style

### Frontend

- TypeScript with strict mode
- Functional components
- Custom hooks for data fetching
- Tailwind CSS for styling
- React Router for routing
- TanStack Query for server state

### Backend

- TypeScript with strict mode
- Express.js for HTTP server
- ES modules imports
- Proper error handling
- Input validation

### ESLint/Prettier

Run linting:
```bash
npm run lint --prefix frontend
npm run lint --prefix backend
```

## Testing

### Frontend Tests

```bash
cd frontend
npm run test
```

### Backend Tests

```bash
cd backend
npm run test
```

Note: Tests use mocked Wikimedia API responses for determinism.

## Building

### Development Build

```bash
npm run build --prefix frontend
npm run build --prefix backend
```

### Production Build

```bash
NODE_ENV=production npm run build --prefix frontend
NODE_ENV=production npm run build --prefix backend
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## API Reference

See [API.md](docs/API.md) for API endpoint documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

Please follow the existing code style and add appropriate tests.

## License

MIT License - see LICENSE file for details.

## Support

- GitHub Issues: https://github.com/wikiwish/wikiwish/issues
- Wikimedia Cloud Services: https://wikitech.wikimedia.org/wiki/Portal:Toolforge
- Chat: #wikimedia-cloud on IRC or Telegram