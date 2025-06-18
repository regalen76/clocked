<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.ts';
	import { Badge } from '$lib/components/ui/badge/index.ts';
	import { Button } from '$lib/components/ui/button/index.ts';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Clock from '@lucide/svelte/icons/clock';
	import CheckCircle from '@lucide/svelte/icons/circle-check';
	import AlertCircle from '@lucide/svelte/icons/circle-alert';
	import type { PageData } from './$types.js';
	import type { HolidayInfo, Holiday, HolidaysData } from './+page.server.ts';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let currentDate = $state(new Date());
	let selectedDate = $state<Date | null>(null);

	// Reactive values for current month/year
	let currentMonth = $derived(currentDate.getMonth());
	let currentYear = $derived(currentDate.getFullYear());

	// Month names in English
	const monthNames: string[] = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	// Day names in Indonesian
	const dayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// Get calendar days for current month
	const calendarDays = $derived((): (number | null)[] => {
		const firstDay = new Date(currentYear, currentMonth, 1);
		const lastDay = new Date(currentYear, currentMonth + 1, 0);
		const firstDayOfWeek = firstDay.getDay();
		const daysInMonth = lastDay.getDate();

		const days: (number | null)[] = [];

		// Add empty cells for days before the first day of the month
		for (let i = 0; i < firstDayOfWeek; i++) {
			days.push(null);
		}

		// Add days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			days.push(day);
		}

		return days;
	});

	// Get holidays for current month
	const monthHolidays = $derived((): HolidayInfo[] => {
		if (!data.success || !data.holidays || Object.keys(data.holidays).length === 0) return [];

		const monthHolidayList: HolidayInfo[] = [];

		for (const [dateStr, holiday] of Object.entries(data.holidays)) {
			if (dateStr === 'info') continue;

			// Type guard to ensure we have a Holiday object
			if (typeof holiday === 'object' && 'summary' in holiday) {
				const date = new Date(dateStr);
				if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
					monthHolidayList.push({
						date: date.getDate(),
						summary: holiday.summary,
						dateStr
					});
				}
			}
		}

		return monthHolidayList.sort((a, b) => a.date - b.date);
	});

	// Check if a date is a holiday
	function isHoliday(day: number | null): boolean {
		if (!day || !data.success || !data.holidays) return false;
		const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
		const holiday = (data.holidays as HolidaysData)[dateStr];
		return holiday && typeof holiday === 'object' && 'summary' in holiday;
	}

	// Get holiday info for a specific day
	function getHolidayInfo(day: number): Holiday | null {
		if (!data.success || !data.holidays) return null;
		const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
		const holiday = (data.holidays as HolidaysData)[dateStr];
		return holiday && typeof holiday === 'object' && 'summary' in holiday ? holiday : null;
	}

	// Get attendance for a specific day
	function getAttendanceForDay(day: number): any | null {
		if (!day || !data.attendances) return null;
		const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
		return data.attendances.find((attendance: any) => attendance.date === dateStr) || null;
	}

	// Check if date has attendance
	function hasAttendance(day: number | null): boolean {
		if (!day) return false;
		return getAttendanceForDay(day) !== null;
	}

	// Check if attendance is completed (clocked out)
	function isAttendanceCompleted(day: number | null): boolean {
		if (!day) return false;
		const attendance = getAttendanceForDay(day);
		return attendance && attendance.clockOut !== null;
	}

	// Check if date is today
	function isToday(day: number | null): boolean {
		if (!day) return false;
		const today = new Date();
		return (
			day === today.getDate() &&
			currentMonth === today.getMonth() &&
			currentYear === today.getFullYear()
		);
	}

	// Navigate months
	function previousMonth(): void {
		currentDate = new Date(currentYear, currentMonth - 1, 1);
	}

	function nextMonth(): void {
		currentDate = new Date(currentYear, currentMonth + 1, 1);
	}

	// Go to today
	function goToToday(): void {
		currentDate = new Date();
	}

	// Select a date
	function selectDate(day: number | null): void {
		if (!day) return;
		selectedDate = new Date(currentYear, currentMonth, day);
	}

	// Format date to Indonesian locale
	function formatDateIndonesian(date: Date): string {
		return date.toLocaleDateString('id-ID', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// Format time
	function formatTime(timeString: string): string {
		return new Date(timeString).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Dashboard Calendar</h1>
			<p class="text-muted-foreground">Indonesian holidays and attendance tracker</p>
		</div>
		<Button variant="outline" onclick={goToToday}>
			<Calendar class="mr-2 h-4 w-4" />
			Today
		</Button>
	</div>

	{#if !data.success}
		<Card>
			<CardContent class="flex items-center justify-center py-8">
				<div class="text-center">
					<p class="text-destructive mb-4">Error: {data.error}</p>
					<Button onclick={() => window.location.reload()}>Reload Page</Button>
				</div>
			</CardContent>
		</Card>
	{:else}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
			<!-- Calendar -->
			<Card class="lg:col-span-3">
				<CardHeader>
					<div class="flex items-center justify-between">
						<CardTitle class="text-2xl">
							{monthNames[currentMonth]}
							{currentYear}
						</CardTitle>
						<div class="flex items-center space-x-2">
							<Button variant="outline" size="sm" onclick={previousMonth}>
								<ChevronLeft class="h-4 w-4" />
							</Button>
							<Button variant="outline" size="sm" onclick={nextMonth}>
								<ChevronRight class="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div class="mb-4 grid grid-cols-7 gap-2">
						{#each dayNames as dayName}
							<div class="text-muted-foreground p-2 text-center text-sm font-medium">
								{dayName}
							</div>
						{/each}
					</div>
					<div class="grid grid-cols-7 gap-2">
						{#each calendarDays() as day}
							<div class="aspect-square">
								{#if day}
									<button
										class="hover:bg-accent relative flex h-full w-full flex-col items-center justify-center rounded-lg border-2 p-1 transition-all
											{isToday(day) ? 'border-primary bg-primary/10' : 'border-transparent'}
											{selectedDate &&
										selectedDate.getDate() === day &&
										selectedDate.getMonth() === currentMonth &&
										selectedDate.getFullYear() === currentYear
											? 'ring-primary ring-2'
											: ''}"
										onclick={() => selectDate(day)}
										type="button"
									>
										<span class="mb-1 text-sm font-medium">{day}</span>

										<!-- Indicators container -->
										<div class="flex flex-col items-center space-y-1">
											<!-- Holiday indicator -->
											{#if isHoliday(day)}
												<div class="h-2 w-2 rounded-full bg-red-500"></div>
											{/if}

											<!-- Attendance indicator -->
											{#if hasAttendance(day)}
												{#if isAttendanceCompleted(day)}
													<CheckCircle class="h-3 w-3 text-green-500" />
												{:else}
													<AlertCircle class="h-3 w-3 text-orange-500" />
												{/if}
											{/if}
										</div>
									</button>
								{:else}
									<div class="h-full w-full"></div>
								{/if}
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>

			<!-- Holiday List -->
			<Card>
				<CardHeader>
					<CardTitle class="text-lg">This Month</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						<!-- Legend -->
						<div class="space-y-2 border-b pb-3">
							<p class="text-sm font-medium">Legend:</p>
							<div class="flex items-center space-x-2 text-xs">
								<div class="h-2 w-2 rounded-full bg-red-500"></div>
								<span class="text-muted-foreground">Holiday</span>
							</div>
							<div class="flex items-center space-x-2 text-xs">
								<CheckCircle class="h-3 w-3 text-green-500" />
								<span class="text-muted-foreground">Attended (Complete)</span>
							</div>
							<div class="flex items-center space-x-2 text-xs">
								<AlertCircle class="h-3 w-3 text-orange-500" />
								<span class="text-muted-foreground">Clocked In</span>
							</div>
						</div>

						<!-- Holidays -->
						{#if monthHolidays().length > 0}
							<div>
								<p class="mb-2 text-sm font-medium">Holidays:</p>
								{#each monthHolidays() as holiday}
									<div
										class="dark:bg-input/30 mb-2 flex items-start space-x-3 rounded-lg border p-2"
									>
										<div class="flex-shrink-0">
											<Badge variant="destructive" class="text-xs">{holiday.date}</Badge>
										</div>
										<div class="min-w-0 flex-1">
											<p class="text-xs leading-tight font-medium">
												{holiday.summary}
											</p>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-muted-foreground text-sm">No holidays this month</p>
						{/if}
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Selected Date Info -->
		{#if selectedDate}
			{@const selectedDay = selectedDate.getDate()}
			{@const selectedHoliday = getHolidayInfo(selectedDay)}
			{@const selectedAttendance = getAttendanceForDay(selectedDay)}
			<Card>
				<CardHeader>
					<CardTitle class="text-lg">
						{formatDateIndonesian(selectedDate)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<!-- Holiday Info -->
						{#if selectedHoliday}
							<div class="flex items-center space-x-2">
								<Badge variant="destructive">Holiday</Badge>
								<span class="text-sm font-medium">{selectedHoliday.summary}</span>
							</div>
						{/if}

						<!-- Attendance Info -->
						{#if selectedAttendance}
							<div class="space-y-3">
								<div class="flex items-center space-x-2">
									{#if selectedAttendance.clockOut}
										<Badge variant="default" class="bg-green-500">
											<CheckCircle class="mr-1 h-3 w-3" />
											Completed
										</Badge>
									{:else}
										<Badge variant="secondary" class="bg-orange-500 text-white">
											<Clock class="mr-1 h-3 w-3" />
											Clocked In
										</Badge>
									{/if}
								</div>

								<div class="grid grid-cols-2 gap-4 text-sm">
									<div>
										<p class="font-medium">Clock In:</p>
										<p class="text-muted-foreground">
											{formatTime(selectedAttendance.clockIn)}
										</p>
									</div>
									<div>
										<p class="font-medium">Clock Out:</p>
										<p class="text-muted-foreground">
											{selectedAttendance.clockOut
												? formatTime(selectedAttendance.clockOut)
												: '--:--'}
										</p>
									</div>
								</div>

								{#if selectedAttendance.description}
									<div>
										<p class="mb-1 text-sm font-medium">Work Description:</p>
										<p class="text-muted-foreground rounded bg-gray-50 p-3 text-sm leading-relaxed">
											{selectedAttendance.description}
										</p>
									</div>
								{/if}
							</div>
						{:else if !selectedHoliday}
							<p class="text-muted-foreground">No attendance recorded</p>
						{/if}
					</div>
				</CardContent>
			</Card>
		{/if}
	{/if}
</div>
