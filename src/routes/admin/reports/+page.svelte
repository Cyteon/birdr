<script lang="ts">
    import Sidebar from "$lib/components/SideBar.svelte";
    import { state } from "$lib/state.svelte";
    import { onMount } from "svelte";
    import { getCookie } from "typescript-cookie";
    import { browser } from "$app/environment";
    import { Ban, X, Trash } from "lucide-svelte";

    let reports = [];
    let phone = false;

    if (browser) {
        window.addEventListener("resize", () => {
            phone = window.innerWidth < 768;
        });

        phone = window.innerWidth < 768;
    }

    onMount(async () => {
        const token = getCookie("token");

        if (!token) {
            window.location.href = "/auth/login";
        }

        const res = await fetch("/api/v1/reports", {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            reports = await res.json();
        } else if (res.status === 401) {
            window.location.href = "/auth/login";
        } else {
            window.location.href = "/";
        }
    });

    async function ignore(id) {
        const res = await fetch(`/api/v1/reports`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
            body: JSON.stringify({ id }),
        });

        if (res.ok) {
            reports = reports.filter((report) => report._id !== id);
        }
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
            const userIndex = reports.findIndex(
                (report) => report.postAuthorId.username === username,
            );
            if (userIndex !== -1) {
                reports[userIndex].postAuthorId.banned = true;
            }
        }
    }

    async function _delete(postId, reportId) {
        let res = await fetch(`/api/v1/posts/${postId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            res = await fetch(`/api/v1/reports`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getCookie("token")}`,
                },
                body: JSON.stringify({ id: reportId }),
            });

            if (res.ok) {
                reports = reports.filter((report) => report._id !== reportId);
            }
        }
    }
</script>

<div class="flex min-h-screen w-full">
    <Sidebar />
    <div
        class={`my-5 pb-3 border border-ctp-surface0 rounded-md ${phone ? "w-full mx-2" : "w-3/5 mx-auto"}`}
    >
        <div class="py-3 px-3 border-b border-b-ctp-surface0 flex">
            <h1 class="mr-auto font-bold text-xl">Reported</h1>

            <h1 class="ml-auto font-bold text-xl">Reporter</h1>
        </div>

        {#each reports as report}
            <div class="py-3 px-3 border-b border-b-ctp-surface0 flex flex-col">
                <div class="flex w-full">
                    <div class="mr-auto flex">
                        <img
                            src={report.postAuthorId.avatarUrl}
                            alt="avatar"
                            class="w-16 h-16 rounded-full"
                        />

                        <div class="ml-2 my-auto">
                            <h1 class="text-2xl font-bold">
                                {report.postAuthorId.displayName}
                            </h1>
                            <p class="text-ctp-subtext1 text-lg">
                                @{report.postAuthorId.username}
                            </p>
                        </div>
                    </div>

                    <div class="ml-auto flex">
                        <div class="my-auto">
                            <h1 class="text-2xl font-bold">
                                {report.reporterId.displayName}
                            </h1>
                            <p class="text-ctp-subtext1 text-lg">
                                @{report.reporterId.username}
                            </p>
                        </div>

                        <img
                            src={report.reporterId.avatarUrl}
                            alt="avatar"
                            class="ml-2 w-16 h-16 rounded-full"
                        />
                    </div>
                </div>

                <div class="w-full mt-3">
                    <h1 class="text-2xl font-bold">Content:</h1>
                    <p class="text-lg">{report.content}</p>
                </div>

                <div class="flex flex-wrap mt-2 space-x-2">
                    <button
                        class="unique bg-ctp-red"
                        on:click={() => _delete(report.postId, report._id)}
                    >
                        <Trash class="my-auto" />
                        <span class="ml-1 text-lg">Delete</span>
                    </button>

                    <button
                        class={`unique ${report.postAuthorId.banned ? "bg-ctp-surface1" : "bg-ctp-red"}`}
                        disabled={report.postAuthorId.banned}
                        on:click={() => ban(report.postAuthorId.username)}
                    >
                        <Ban class="my-auto" />
                        <span class="ml-1 text-lg">Ban</span>
                    </button>

                    <button on:click={() => ignore(report._id)}>
                        <X class="my-auto" />
                        <span class="ml-1 text-lg">Ignore</span>
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
