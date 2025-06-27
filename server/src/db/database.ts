// src/db.ts
import { PrismaClient } from '@prisma/client';

// This prevents multiple instances in development with hot reloads
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;