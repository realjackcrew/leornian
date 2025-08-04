"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/api';
const TOKEN = process.env.WHOOP_JWT_TOKEN;
if (!TOKEN) {
    console.error('Please set WHOOP_JWT_TOKEN in your environment.');
    process.exit(1);
}
function getDateString(date) {
    return date.toISOString().split('T')[0];
}
async function main() {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    const startStr = getDateString(start);
    const endStr = getDateString(today);
    const url = `${API_BASE_URL}/api/whoop/raw?start=${startStr}&end=${endStr}`;
    console.log('Fetching:', url);
    const res = await (0, node_fetch_1.default)(url, {
        headers: {
            'Authorization': `Bearer ${TOKEN}`
        },
    });
    if (!res.ok) {
        console.error('Failed to fetch:', res.status, await res.text());
        process.exit(1);
    }
    const data = await res.json();
    const outputFile = process.argv[2];
    if (outputFile) {
        const outPath = path_1.default.resolve(process.cwd(), outputFile);
        fs_1.default.writeFileSync(outPath, JSON.stringify(data, null, 2));
        console.log('Saved to', outPath);
    }
    else {
        console.log(JSON.stringify(data, null, 2));
    }
}
main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
