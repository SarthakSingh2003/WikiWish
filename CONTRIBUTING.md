# Contributing to WikiWish

Thank you for your interest in contributing to WikiWish! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be considerate, collaborative, and professional in all interactions.

## How to Contribute

### Reporting Issues

Use the [GitHub Issues](https://github.com/wikiwish/wikiwish/issues) page to report bugs or request features. When reporting issues, please include:

- A clear description of the issue
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots or logs if helpful
- Your environment (OS, browser, Node.js version)

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests and linting
5. Submit a pull request

Please ensure your PR includes:
- Clear description of changes
- Relevant tests
- Updated documentation if needed

## Development Setup

```bash
git clone https://github.com/wikiwish/wikiwish.git
cd wikiwish

# Create environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Edit backend/.env with your OAuth credentials

# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# Run development servers
npm run dev --prefix backend  # http://localhost:8080
npm run dev --prefix frontend  # http://localhost:3000
```

## Code Style

### Frontend

- Use TypeScript for all new code
- Functional components with hooks
- Tailwind CSS for styling
- React Router for routing
- TanStack Query for server state

### Backend

- Use TypeScript for all new code
- Express.js for HTTP handling
- Proper error handling
- Input validation

### Git Commits

Write meaningful commit messages:
- Use present tense ("Add feature" not "Added feature")
- Reference issues in commit messages
- Keep commits focused and atomic

## Testing

```bash
# Frontend tests
cd frontend && npm run test

# Build checks
npm run build --prefix frontend
npm run build --prefix backend
```

## Project Structure

```
wikiwish/
├── frontend/
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Route pages
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Global styles
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── lib/           # Wikimedia API client
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Server entry point
│   └── package.json
│
├── docs/                  # Documentation
└── package.json
```

## Questions?

Ask on GitHub Issues or contact the maintainers.

## License

By contributing, you agree your contributions will be licensed under the MIT License.