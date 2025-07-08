"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/db.ts
const client_1 = require("@prisma/client");
const prisma = global.prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});
if (process.env.NODE_ENV !== 'production')
    global.prisma = prisma;
exports.default = prisma;
