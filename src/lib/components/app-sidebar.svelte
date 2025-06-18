<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import NavProjects from './nav-projects.svelte';
	import NavUser from './nav-user.svelte';
	import * as Avatar from './ui/avatar/index.ts';
	import LifeBuoyIcon from '@lucide/svelte/icons/life-buoy';
	import SendIcon from '@lucide/svelte/icons/send';
	import FrameIcon from '@lucide/svelte/icons/frame';

	interface User {
		name: string;
		email: string;
		avatar: string;
	}

	interface NavItem {
		title: string;
		url: string;
		icon: any;
	}

	interface Project {
		name: string;
		url: string;
		icon: any;
	}

	interface Props extends ComponentProps<typeof Sidebar.Root> {
		user?: User;
		navSecondary?: NavItem[];
		projects?: Project[];
		appName?: string;
		appSubtitle?: string;
		ref?: HTMLElement | null;
	}

	let {
		ref = $bindable(null),
		user = {
			name: 'shadcn',
			email: 'm@example.com',
			avatar: '/images/Reonify.jpeg'
		},
		navSecondary = [
			{
				title: 'Support',
				url: '#',
				icon: LifeBuoyIcon
			},
			{
				title: 'Feedback',
				url: '#',
				icon: SendIcon
			}
		],
		projects = [
			{
				name: 'Attendances',
				url: '/attendance',
				icon: FrameIcon
			}
		],
		appName = 'Reonify',
		appSubtitle = 'MMI',
		...restProps
	}: Props = $props();
</script>

<Sidebar.Root class="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/dashboard" {...props}>
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<Avatar.Root class="size-8 rounded-lg">
									<Avatar.Image src={user.avatar} alt={user.name} />
									<Avatar.Fallback class="rounded-lg">RN</Avatar.Fallback>
								</Avatar.Root>
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-medium">{appName}</span>
								<span class="truncate text-xs">{appSubtitle}</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavProjects {projects} />
		<!-- <NavSecondary items={navSecondary} class="mt-auto" /> -->
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
</Sidebar.Root>
