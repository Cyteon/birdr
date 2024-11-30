<script lang="ts">
    import { Ellipsis, Flag, Copy, Ban, ShieldCheck } from "lucide-svelte";
    import { state } from "$lib/state.svelte";
    import { getCookie } from "typescript-cookie";
    import { browser } from "$app/environment";

    export let user;

    let banned = false;
    let open = false;
    let unqiueId = Math.random().toString(36).substring(7);

    if (browser) {
        document.addEventListener("click", (e) => {
            if (!e.target.closest(`#${unqiueId}`)) {
                open = false;
            }
        });
    }

    async function ban(username) {
        const res = await fetch(`/api/v1/users/${username}/ban`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            banned = true;
            user.banned = true;
        }
    }

    async function unban(username) {
        const res = await fetch(`/api/v1/users/${username}/ban`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            banned = false;
            user.banned = false;
        }
    }
</script>

{#if state.user?.staff}
    <div class="ml-2 my-auto text-ctp-subtext1" id={unqiueId}>
        <button
            class="open unique transition-all duration-300 hover:bg-ctp-crust/60 px-1 rounded-full"
            on:click={() => (open = !open)}
        >
            <Ellipsis size={24} />
        </button>

        {#if open}
            <div class="absolute mt-1 bg-ctp-mantle rounded-md p-2">
                {#if state.user && state.user.staff}
                    {#if user.banned}
                        <button
                            class="unique text-ctp-green"
                            on:click={() => unban(user.username)}
                        >
                            <ShieldCheck size={24} class="my-auto" />
                            <span class="ml-1 text-lg">Unban</span>
                        </button>
                    {:else}
                        <button
                            class="unique text-ctp-red"
                            on:click={() => ban(user.username)}
                        >
                            <Ban size={24} class="my-auto" />
                            <span class="ml-1 text-lg">Ban</span>
                        </button>
                    {/if}
                {/if}
            </div>
        {/if}
    </div>
{/if}

<style>
    button:not(.open) {
        @apply transition-all duration-300 flex p-2 w-full text-left hover:bg-ctp-crust/60 rounded-md;
    }
</style>
