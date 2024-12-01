<script lang="ts">
    import { Ellipsis, Trash, Ban, ShieldCheck, BadgeCheck, BadgeX } from "lucide-svelte";
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

    async function ban(username: string) {
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

    async function unban(username: string) {
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

    async function purge(username: string) {
        const res = await fetch(`/api/v1/users/${username}/purge`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            window.location.reload();
        }
    }

    async function verify(username: string) {
        const res = await fetch(`/api/v1/users/${username}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            user.verified = true;
        }
    }

    async function unverify(username: string) {
        const res = await fetch(`/api/v1/users/${username}/verify`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            user.verified = false;
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
                    {#if user.verified}
                        <button
                            class="unique"
                            on:click={() => unverify(user.username)}
                        >
                            <BadgeX size={24} class="my-auto" />
                            <span class="ml-1 text-lg">Unverify</span>
                        </button>
                    {:else}
                        <button
                            class="unique"
                            on:click={() => verify(user.username)}
                        >
                            <BadgeCheck size={24} class="my-auto" />
                            <span class="ml-1 text-lg">Verify</span>
                        </button>
                    {/if}

                    <hr class="my-1 border-ctp-surface1" />

                    <button
                        class="unique text-ctp-red"
                        on:click={() => purge(user.username)}
                    >
                        <Trash size={24} class="my-auto" />
                        <span class="ml-1 text-lg">Purge</span>
                    </button>

                    <hr class="my-1 border-ctp-surface1" />



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
