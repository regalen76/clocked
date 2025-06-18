import { z } from 'zod';

export const attendanceSchema = z.object({
	clockIn: z.date().optional(),
	clockOut: z.date().optional(),
	workDescription: z.string().min(1, 'Work description is required when clocking out').optional()
});

export type AttendanceSchema = typeof attendanceSchema;
