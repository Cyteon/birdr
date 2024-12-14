<script lang="ts">
	import '../app.css';
	import { state } from '$lib/state.svelte';
	import { onMount } from 'svelte';
	import { getCookie, removeCookie } from 'typescript-cookie';
	import { browser } from '$app/environment';
	import cache from '$lib/cache';

	let { children } = $props();

	if (browser) {
   	    let theme = localStorage.getItem('theme') || 'macchiato';

       	onMount(() => {
            document.documentElement.className = `ctp-${theme}`;
        });
	}

	onMount(async () => {
		let cached = await cache.me.get(1);
		
		if (cached) {
			console.log("Loading user from cache");
			state.user = cached;
		}

	    let token = getCookie('token');

		if (token) {
          const res = await fetch('/api/v1/users/@me', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

			if (res.ok) {
				const data = await res.json();
				state.user = data;

				if (cached) {
					cache.me.update(1, data);
				} else {
					cache.me.put(data);
				}
			} else {
				cache.me.delete(1);
				removeCookie('token');
			}
		} else {
			cache.me.delete(1);
		}
	});
</script>

{@render children()}
