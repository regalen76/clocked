import { createSessionClient, SESSION_COOKIE } from '$lib/server/appwrite.ts';
import { isRedirect, redirect } from '@sveltejs/kit';
import { Query } from 'node-appwrite';

export interface Holiday {
	summary: string;
}

export interface HolidaysData {
	[key: string]: Holiday | { author: string; link: string; updated: string };
}

export interface HolidayInfo {
	date: number;
	summary: string;
	dateStr: string;
}

const DATABASE_ID = '68416859000b301b6a0f'; // Replace with your database ID
const COLLECTION_ID = '684168c60032a57c3f50'; // Replace with your collection ID

export async function load(event) {
	try {
		// Logged out users can't access this page.
		if (!event.locals.user) redirect(302, '/login');

		// Fetch holidays
		const response = await fetch(
			'https://raw.githubusercontent.com/guangrei/APIHariLibur_V2/main/holidays.json'
		);
		if (!response.ok) {
			throw new Error(`Failed to fetch holidays: ${response.status} ${response.statusText}`);
		}
		const holidays: HolidaysData = await response.json();

		// Fetch attendance data for current month
		let attendances: any[] = [];
		try {
			const { databases } = createSessionClient(event);
			const userId = event.locals.user.$id;

			// Get current month range
			const now = new Date();
			const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
			const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

			const attendanceResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
				Query.equal('userId', userId),
				Query.greaterThanEqual('clockIn', startOfMonth.toISOString()),
				Query.lessThanEqual('clockIn', endOfMonth.toISOString()),
				Query.orderDesc('clockIn'),
				Query.limit(100) // Limit to avoid large payloads
			]);

			attendances = attendanceResponse.documents;
		} catch (error) {
			console.error('Error fetching attendance:', error);
			// Don't fail the entire page if attendance fetch fails
		}

		// Pass the stored user local to the page.
		return {
			holidays,
			attendances,
			success: true,
			user: event.locals.user
		};
	} catch (error) {
		if (isRedirect(error)) throw error;

		console.error('Error fetching holidays:', error);
		return {
			holidays: {},
			attendances: [],
			success: false,
			user: event.locals.user,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}
