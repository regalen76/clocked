import { fail, redirect, type ServerLoadEvent } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { ID, Query } from 'node-appwrite';
import { createSessionClient } from '$lib/server/appwrite.js';
import { attendanceSchema } from '$lib/schemas/attendance.js';
import type { Actions, PageServerLoad } from './$types.js';

const DATABASE_ID = '68416859000b301b6a0f'; // Replace with your database ID
const COLLECTION_ID = '684168c60032a57c3f50'; // Replace with your collection ID

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	event.request;
	// Logged out users can't access this page
	if (!event.locals.user) redirect(302, '/login');

	// Get user ID from locals
	const userId = event.locals.user.$id;

	// Check if user has already clocked in today
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	let todayAttendance = null;

	try {
		// Create the Appwrite client
		const { databases } = createSessionClient(event);

		const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
			Query.equal('userId', userId),
			Query.greaterThanEqual('clockIn', today.toISOString()),
			Query.lessThan('clockIn', tomorrow.toISOString())
		]);

		if (response.documents.length > 0) {
			todayAttendance = response.documents[0];
		}
	} catch (error) {
		console.error('Error fetching attendance:', error);
	}

	return {
		form: await superValidate(zod(attendanceSchema)),
		todayAttendance,
		user: event.locals.user
	};
};

export const actions: Actions = {
	clockIn: async (event) => {
		// Logged out users can't access this action
		if (!event.locals.user) redirect(302, '/login');

		const form = await superValidate(event.request, zod(attendanceSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const userId = event.locals.user.$id;
		const clockInTime = new Date();

		try {
			// Create the Appwrite client
			const { databases } = createSessionClient(event);

			await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
				userId: userId,
				clockIn: clockInTime.toISOString(),
				clockOut: null,
				description: null,
				date: clockInTime.toISOString().split('T')[0] // Store date for easier querying
			});

			return { form };
		} catch (error) {
			console.error('Error clocking in:', error);
			return fail(500, {
				form,
				error: 'Failed to clock in. Please try again.'
			});
		}
	},

	clockOut: async (event) => {
		// Logged out users can't access this action
		if (!event.locals.user) redirect(302, '/login');

		const form = await superValidate(event.request, zod(attendanceSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!form.data.workDescription) {
			return fail(400, {
				form,
				error: 'Work description is required when clocking out.'
			});
		}

		const userId = event.locals.user.$id;
		const clockOutTime = new Date();

		// Find today's attendance record
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		try {
			// Create the Appwrite client
			const { databases } = createSessionClient(event);

			const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
				Query.equal('userId', userId),
				Query.greaterThanEqual('clockIn', today.toISOString()),
				Query.lessThan('clockIn', tomorrow.toISOString()),
				Query.isNull('clockOut')
			]);

			if (response.documents.length === 0) {
				return fail(400, {
					form,
					error: 'No active clock-in found for today.'
				});
			}

			const attendanceRecord = response.documents[0];

			await databases.updateDocument(DATABASE_ID, COLLECTION_ID, attendanceRecord.$id, {
				clockOut: clockOutTime.toISOString(),
				description: form.data.workDescription
			});

			return { form };
		} catch (error) {
			console.error('Error clocking out:', error);
			return fail(500, {
				form,
				error: 'Failed to clock out. Please try again.'
			});
		}
	}
};
