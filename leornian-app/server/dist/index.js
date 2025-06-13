"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const log_1 = __importDefault(require("./routes/log"));
dotenv_1.default.config();
const app = (0, express_1.default)();
//previous cors was just app.use(cors({ origin: 'http://localhost:5173' }));
// Configure CORS based on environment
const allowedOrigins = [
    'http://localhost:5173', // Local development
    process.env.CLIENT_URL, // Production client URL
].filter(Boolean); // Remove any undefined values
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use('/api', auth_1.default); //double check original /auth and /logs
app.use('/api', log_1.default);
const PORT = process.env.PORT || 4000;
app.get('/', (_req, res) => {
    res.send('Leornian API is running.');
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});
