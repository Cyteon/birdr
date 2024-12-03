<script lang="ts">
    import { Ellipsis, Trash, Ban, ShieldCheck, BadgeCheck, BadgeX, Badge } from "lucide-svelte";
    import { state } from "$lib/state.svelte";
    import { getCookie } from "typescript-cookie";
    import { browser } from "$app/environment";

    export let user;

    let banned = false;
    let blockClicked = false;
    let open = false;
    let showAddBadge = false;
    let badge = "";
    let unqiueId = `dropdown-${Math.random().toString(36).substring(7)}`;

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

    async function addBadge(username: string) {
        const res = await fetch(`/api/v1/users/${username}/badges`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
            body: JSON.stringify({ badge }),
        });

        if (res.ok) {
            user.otherBadges?.push(badge);
            showAddBadge = false;
        }
    }

    async function block(username: string) {
        const res = await fetch(`/api/v1/users/${username}/block`, {
            method: user.isBlocked ? "DELETE" : "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            blockClicked = true;
            user.isBlocked = !user.isBlocked;
        }
    }
</script>

{#if state.user}
    <div class="ml-2 my-auto text-ctp-subtext1" id={unqiueId}>
        <button
            class="open unique transition-all duration-300 hover:bg-ctp-crust/60 px-1 rounded-full"
            on:click={() => (open = !open)}
        >
            <Ellipsis size={24} />
        </button>

        {#if open}
            <div class="absolute mt-1 bg-ctp-mantle rounded-md p-2">
                <button 
                    class={`unique ${blockClicked ? "text-ctp-green" : ""}`}
                    on:click={() => (block(user.username))}
                >
                    <Ban size={24} class="my-auto" />
                    <span class="ml-1 text-lg">{user.isBlocked ? "Unblock" : "Block"}</span>
                </button>

                {#if state.user.staff}
                    <button
                        class="unique"
                        on:click={() => showAddBadge = true}
                    >
                        <Badge size={24} class="my-auto" />
                        <span class="ml-1 text-lg">Add Badge</span>
                    </button>

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

{#if showAddBadge}
<div class="absolute flex h-screen w-full bg-ctp-crust/40 top-0 left-0">
    <div class="m-auto p-5 bg-ctp-mantle border border-ctp-surface0 rounded-md">
        <h1 class="font-bold text-2xl">Add Badge</h1>
        <input type="text" class="text-lg w-full p-2 mt-2 border border-ctp-surface0 bg-ctp-crust rounded-md" placeholder="Image URL" bind:value={badge} />
        <button class="unique2 text-xl p-2 flex justify-center mt-2 rounded-md w-full" on:click={() => addBadge(user.username)}>
            <Badge size={24} class="my-auto" />
            <span class="ml-1">Add Badge</span>
        </button>  
    </div>
</div>
{/if}

<style>
    button:not(.open, .unique2) {
        @apply transition-all duration-300 flex p-2 w-full text-left hover:bg-ctp-crust/60 rounded-md;
    }
</style>
