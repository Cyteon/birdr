<script lang="ts">
    import { onMount } from "svelte";
    import SideBar from "$lib/components/SideBar.svelte";
    import { browser } from "$app/environment";

    let { data } = $props();

    let notFound = false;
    let user = $state(null);
    let phone = false;

    if (browser) {
        window.addEventListener("resize", () => {
            phone = window.innerWidth < 768;
        });

        phone = window.innerWidth < 768;
    }

    onMount(async () => {
        const res = await fetch(`/api/v1/users/${data.tag}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            user = await res.json();
        } else {
            notFound = true;
        }
    });
</script>

{#if user}
    <div class="flex h-screen w-full">
        <SideBar />
        <div
            class={`my-5 p-5 border border-ctp-surface0 rounded-md ${phone ? "w-full mx-2" : "w-2/5 mx-auto"}`}
        >
            <div class="flex border-b-4 border-b-ctp-surface0 pb-4">
                <img
                    src={user.avatarUrl}
                    alt={user.username}
                    class="w-16 h-16 rounded-full"
                />
                <div class="ml-2">
                    <h1 class="text-3xl font-bold leading-none">
                        {user.displayName}
                    </h1>
                    <p class="text-xl text-ctp-subtext0">@{user.username}</p>
                </div>
            </div>

            {#each user.posts as post}
                <div class="py-4 border-b border-b-ctp-surface0 flex">
                    <img
                        src={user.avatarUrl}
                        alt={user.username}
                        class="w-10 h-10 rounded-full"
                    />
                    <div class="ml-2">
                        <div class="flex">
                            <h1 class="text-xl font-bold leading-none">
                                {user.displayName}
                            </h1>
                            <span
                                class="text-ctp-subtext0 ml-1 leading-none my-auto"
                            >
                                @{user.username}
                            </span>
                        </div>
                        <p>{post.content}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>
{/if}

{#if notFound}
    <div class="flex h-screen w-full">
        <SideBar />

        <h1 class="font-bold text-4xl text-ctp-red m-auto">User not found</h1>
    </div>
{/if}
