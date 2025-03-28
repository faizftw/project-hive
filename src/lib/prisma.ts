// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Deklarasi tipe untuk global
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export { prisma };
