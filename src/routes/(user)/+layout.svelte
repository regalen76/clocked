<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import SiteHeader from '$lib/components/site-header.svelte';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import ReonifyImage from '$lib/images/Reonify.jpeg';
	import type { LayoutData } from './$types.js';

	let { data, children }: { data: LayoutData; children: any } = $props();

	const { user } = data;
</script>

<div class="[--header-height:calc(--spacing(14))]">
	<Sidebar.Provider class="flex flex-col">
		<SiteHeader />
		<div class="flex flex-1">
			{#if user}
				<AppSidebar
					user={{
						name: user!.name,
						email: user!.email,
						avatar: ReonifyImage
					}}
				/>
			{/if}
			<Sidebar.Inset>
				{@render children()}
			</Sidebar.Inset>
		</div>
	</Sidebar.Provider>
</div>
