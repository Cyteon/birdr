<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { Send } from "lucide-svelte";
    import { browser } from "$app/environment";
    import { getCookie } from "typescript-cookie";
    import { onMount } from "svelte";
    import { state as state } from "$lib/state.svelte";
    import { createTimeString, parsePost } from "$lib/utils";

    let postContent = "";

    let phone = false;

    if (browser) {
        window.addEventListener("resize", () => {
            phone = window.innerWidth < 768;
        });

        phone = window.innerWidth < 768;
    }

    let posts = [];

    onMount(async () => {
        const res = await fetch("/api/v1/posts", {
            headers: {
                "Content-Type": "application/json",
            },
        });

        posts = await res.json();
    });

    async function post() {
        const res = await fetch("/api/v1/posts", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
            body: JSON.stringify({ content: postContent }),
        });

        if (res.ok) {
            let post = await res.json();

            post.authorId = state.user;

            posts.unshift(post);
            postContent = "";
        }
    }
</script>

<div class="flex min-h-screen w-full">
    <SideBar />
    <div
        class={`my-5 pb-3 border border-ctp-surface0 rounded-md ${phone ? "w-full mx-2" : "w-3/5 mx-auto"}`}
    >
        {#if state.user}
            <div class="pb-2 px-3 mb-2 mt-1 border-b-4 border-b-ctp-surface0">
                <h1 class="text-xl font-bold mb-2">New Post</h1>
                <textarea
                    class={`
                    w-full p-2 border border-ctp-surface0 bg-ctp-mantle rounded-md
                    focus:outline-none focus:border-ctp-surface2 transition-color duration-500
                    ${postContent.length > 0 ? "h-32" : "h-11"}
                `}
                    placeholder="What's on your mind today?"
                    bind:value={postContent}
                ></textarea>
                <div class="flex w-full justify-end">
                    <button
                        class={`px-5 flex transition-colors duration-300 ${
                            postContent.length === 0
                                ? "bg-ctp-surface1 text-ctp-subtext1"
                                : ""
                        }`}
                        disabled={postContent.length === 0}
                        onclick={post}
                    >
                        <Send size={24} class="my-auto" />
                        <span class="ml-2 text-lg mb-0.5">Post</span>
                    </button>
                </div>
            </div>
        {/if}

        {#each posts as post}
            <div class="py-3 px-3 border-b border-b-ctp-surface0 flex">
                <img
                    src={post.authorId.avatarUrl}
                    alt={post.authorId.username}
                    class="w-14 h-14 rounded-full"
                />
                <div class="ml-2 w-full">
                    <p class="flex">
                        <a
                            class="text-2xl font-bold leading-none"
                            href={`/@${post.authorId.username}`}
                        >
                            {post.authorId.displayName}
                        </a>
                        <span
                            class="text-ctp-subtext0 ml-1 mt-[5px] leading-none my-auto"
                        >
                            @{post.authorId.username}
                        </span>
                        <span class="ml-auto text-ctp-subtext1"
                            >{createTimeString(post.postedAt)}</span
                        >
                    </p>
                    <p class="text-lg prose">{@html parsePost(post.content)}</p>
                </div>
            </div>
        {/each}
    </div>
</div>
