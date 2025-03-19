import { z } from 'zod';

// Schema untuk Label
const labelSchema = z.object({
	id: z.string().optional(),
	value: z.string(),
	label: z.string()
});

// Schema untuk Task (untuk response atau penggunaan umum)
export const taskSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	status: z.enum(['Backlog', 'Pending', 'Todo', 'In Progress', 'Completed', 'Canceled', 'Overdue']),
	label: z.union([
		labelSchema,           // Label sebagai objek
		z.string(),            // Label sebagai string
		z.null()               // Label bisa null
	]).optional(),             // Menjadikan label opsional
	priority: z.enum(['Low', 'Medium', 'High']),
	deadline: z.string().nullable().or(z.date().nullable()), // Sesuaikan dengan Prisma
	createdAt: z.string().or(z.date()),
	projectId: z.string(),
	createdById: z.string(),
	url: z.union([
		z.object({
		  url: z.string(),
		  alias: z.string().nullable()
		}),
		z.string().transform((str) => {
			try {
				return JSON.parse(str);
			} catch {
				return { url: str, alias: null };
			}
		})
	]).nullable().optional()
});

// Schema untuk membuat Task baru (tanpa 'id', 'createdAt', dan 'createdById')
export const taskCreateSchema = z.object({
	title: z.string(),
	description: z.string().nullable(),
	status: z.enum(['Backlog', 'Pending', 'Todo', 'In Progress', 'Completed', 'Canceled', 'Overdue']),
	label: z.union([
		labelSchema,           // Label sebagai objek
		z.string(),            // Label sebagai string
		z.null()               // Label bisa null
	]).optional(),             // Menjadikan label opsional
	priority: z.enum(['Low', 'Medium', 'High']),
	deadline: z.string().nullable().or(z.date().nullable()), // Sesuaikan dengan Prisma
	projectId: z.string(),
	url: z.union([
		z.object({
		  url: z.string(),
		  alias: z.string().nullable()
		}),
		z.string().transform((str) => {
			try {
				return JSON.parse(str);
			} catch {
				return { url: str, alias: null };
			}
		})
	]).nullable().optional()
});

export type Task = z.infer<typeof taskSchema>;
export type Label = z.infer<typeof labelSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;