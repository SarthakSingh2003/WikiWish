"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const wishes_1 = __importDefault(require("./wishes"));
const users_1 = __importDefault(require("./users"));
const router = (0, express_1.Router)();
// API routes
router.use('/auth', auth_1.default);
router.use('/wishes', wishes_1.default);
router.use('/users', users_1.default);
// API health check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'wikiwish-api' });
});
exports.default = router;
//# sourceMappingURL=index.js.map