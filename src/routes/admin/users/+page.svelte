<script lang="ts">
    import Sidebar from "$lib/components/SideBar.svelte";
    import { onMount } from "svelte";
    import { getCookie } from "typescript-cookie";
    import { browser } from "$app/environment";
    import { Ban, X, Trash } from "lucide-svelte";

    let users = $state([]);
    let phone = false;
    let sortBy: | "alphabetical" | "followers" | "following" | "posts" = "alphabetical";

    if (browser) {
        window.addEventListener("resize", () => {
            phone = window.innerWidth < 768;
        });

        phone = window.innerWidth < 768;
    }

    async function sortUsers(type) {
        if (type === "alphabetical") {
            users.sort((a, b) => a.displayName.localeCompare(b.displayName));
        } else if (type === "followers") {
            users.sort((a, b) => b.followerCount - a.followerCount);
        } else if (type === "following") {
            users.sort((a, b) => b.followingCount - a.followingCount);
        } else if (type === "posts") {
            users.sort((a, b) => b.postCount - a.postCount);
        }

        sortBy = type;
    }

    onMount(async () => {
        const token = getCookie("token");

        if (!token) {
            window.location.href = "/auth/login";
        }

        const res = await fetch("/api/v1/users", {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            users = await res.json();

            sortUsers("alphabetical");
        } else if (res.status === 401) {
            window.location.href = "/auth/login";
        }
    });

    async function ban(user) {
        const res = await fetch(`/api/v1/users/${user.username}/ban`, {
            method: user.banned ? "DELETE" : "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            user.banned = !user.banned;
        }
    }

    async function purge(user) {
        await fetch(`/api/v1/users/${user.username}/purge`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });
    }
</script>

<div class="flex min-h-screen w-full">
    <Sidebar />
    <div
        class={`my-5 pb-3 border border-ctp-surface0 rounded-md ${phone ? "w-full mx-2" : "w-3/5 mx-auto"}`}
    >
        <div class="py-3 px-3 border-b border-b-ctp-surface0 flex">
            <h1 class="mr-auto font-bold text-xl">Users</h1>
        </div>

        <select
            class="p-2 m-3 rounded-lg bg-ctp-crust outline-none text-lg mr-auto"
            on:change={(e) => sortUsers(e.target.value)}
        >
            <option value="alphabetical">Alphabetical</option>
            <option value="followers">Followers</option>
            <option value="following">Following</option>
            <option value="posts">Posts</option>
        </select>

        {#each users as user}
            <div class="py-3 px-3 border-b border-b-ctp-surface0 flex flex-col">
                <div class="flex w-full">
                    <img
                        src={user.avatarUrl}
                        alt="avatar"
                        class="w-16 h-16 rounded-full"
                    />

                    <div class="ml-2 my-auto">
                        <h1 class="text-2xl font-bold">
                            {user.displayName}
                        </h1>
                        <p class="text-ctp-subtext1 text-lg">
                            @{user.username}
                        </p>
                    </div>
                </div>

                <div class="w-full mt-3">
                    <p class="text-lg">{user.bio}</p>
                </div>

                <p class="mt-2 text-lg">
                    <span class="font-bold">{user.postCount}</span> posts,
                    <span class="font-bold">{user.commentCount}</span> comments,
                    <span class="font-bold">{user.followerCount}</span> followers,
                    <span class="font-bold">{user.followingCount}</span> following
                </p>

                <div class="flex flex-wrap mt-2 space-x-2">
                    <button
                        class={`unique ${user.banned ? "bg-ctp-green" : "bg-ctp-red"}`}
                        on:click={() => ban(user)}
                    >
                        <Ban class="my-auto" />
                        <span class="ml-1 text-lg">{user.banned ? "Unban" : "Ban"}</span>
                    </button>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    button {
        @apply py-1 px-2 text-ctp-crust rounded-md flex;
    }
</style>
