"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Automatically load .env if present
try {
    const envCandidates = [
        path_1.default.resolve(process.cwd(), '.env'),
        path_1.default.resolve(process.cwd(), 'backend/.env'),
        path_1.default.resolve(__dirname, '../.env'),
        path_1.default.resolve(__dirname, '../../.env'),
    ];
    for (const envFile of envCandidates) {
        if (fs_1.default.existsSync(envFile)) {
            const content = fs_1.default.readFileSync(envFile, 'utf-8');
            for (const line of content.split('\n')) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#'))
                    continue;
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx !== -1) {
                    const k = trimmed.slice(0, eqIdx).trim();
                    const v = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
                    if (!process.env[k]) {
                        process.env[k] = v;
                    }
                }
            }
            break;
        }
    }
}
catch (e) { }
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
// Trust reverse proxy (essential on Toolforge / Kubernetes HTTPS ingress)
app.set('trust proxy', 1);
const origins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://localhost:8080',
];
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow same-origin / server-to-server or listed origins
        if (!origin || origins.includes(origin) || process.env.NODE_ENV === 'production') {
            return callback(null, true);
        }
        callback(new Error('CORS not allowed'));
    },
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
}));
app.use('/api', routes_1.default);
// Health check endpoint (required by Toolforge Kubernetes)
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Serve frontend static files in production
const frontendDist = path_1.default.resolve(__dirname, '../../frontend/dist');
if (fs_1.default.existsSync(frontendDist)) {
    app.use(express_1.default.static(frontendDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path === '/health') {
            return next();
        }
        res.sendFile(path_1.default.join(frontendDist, 'index.html'));
    });
}
else {
    // Fallback root redirect if frontend isn't built
    app.get('/', (_req, res) => {
        res.redirect('/dashboard');
    });
}
app.listen(PORT, () => {
    console.log(`WikiWish backend running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map