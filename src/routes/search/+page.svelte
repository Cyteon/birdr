<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { createTimeString, parsePost } from "$lib/utils";
    import MessageOptionsDropdown from "$lib/components/MessageOptionsDropdown.svelte";
    import Badges from "$lib/components/Badges.svelte";
    import { MessageSquare, ThumbsDown, ThumbsUp } from "lucide-svelte";
    import { getCookie } from "typescript-cookie";

    let phone = false;

    let search = "";

    let posts = [];

    if (browser) {
        window.addEventListener("resize", () => {
            phone = window.innerWidth < 768;
        });

        phone = window.innerWidth < 768;

        let urlParams = new URLSearchParams(window.location.search);
        search = urlParams.get("q") || "";
    }

    onMount(async () => {
        const res = await fetch(`/api/v1/posts/search?q=${search}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        posts = await res.json();
    });

    async function like(post) {
        const res = await fetch(`/api/v1/posts/${post._id}/like`, {
            method: post.hasLiked ? "DELETE" : "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            posts = posts.map((p) => {
                if (p._id === post._id) {
                    p.hasLiked = !p.hasLiked;
                    p.likeCount += p.hasLiked ? 1 : -1;

                    p.dislikeCount -= p.hasDisliked ? 1 : 0;
                    p.hasDisliked = false;
                }

                return p;
            });
        }
    }

    async function dislike(post) {
        const res = await fetch(`/api/v1/posts/${post._id}/dislike`, {
            method: post.hasDisliked ? "DELETE" : "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            posts = posts.map((p) => {
                if (p._id === post._id) {
                    p.hasDisliked = !p.hasDisliked;
                    p.dislikeCount += p.hasDisliked ? 1 : -1;

                    p.likeCount -= p.hasLiked ? 1 : 0;
                    p.hasLiked = false;
                }

                return p;
            });
        }
    }
</script>

<div class="flex min-h-screen w-full">
    <SideBar />

    <div class={`my-5 ${phone ? "w-full mx-1" : "w-3/5 mx-auto"}`}>
        <div class="flex">
            <input 
                type="text"
                placeholder="Search" 
                class="w-full p-2 border border-ctp-surface0 bg-ctp-mantle rounded-md outline-none focus:border-ctp-surface2 focus:outline-none transition-color duration-500" 
                bind:value={search}
            />
            <button class="my-auto h-10 ml-1" onclick={() => window.location.href = `/search?q=${search}`}>
                Search
            </button>   
        </div>

        <div
            class="my-5 pb-3 border border-ctp-surface0 rounded-md"
        >
            {#if posts.length === 0}
                <h1 class="text-ctp-subtext1 text-xl text-center mt-3">No posts found</h1>
            {:else}
                {#each posts as post}
                    <div class="py-3 px-3 border-b border-b-ctp-surface0 flex" id={post._id}>
                        <img
                            src={post.authorId.avatarUrl}
                            alt={post.authorId.username}
                            class="w-14 h-14 rounded-full object-cover"
                        />
                        <div class="ml-2 w-full">
                            <p class="flex">
                                <a
                                    class="text-2xl font-bold leading-none"
                                    href={`/@${post.authorId.username}`}
                                >
                                    {post.authorId.displayName}
                                </a>
                                <Badges user={post.authorId} small={true} />
                                <span
                                    class="text-ctp-subtext0 ml-1 mt-[5px] leading-none my-auto"
                                >
                                    @{post.authorId.username}
                                </span>

                                <span class="ml-auto flex">
                                    {#if !phone}
                                        <span class="text-ctp-subtext1"
                                            >{createTimeString(post.postedAt)}</span
                                        >
                                    {/if}

                                    <MessageOptionsDropdown
                                        post={post}
                                    />
                                </span>
                            </p>
                            <p class="text-lg prose">
                                {@html parsePost(
                                    post,
                                    true,
                                    `/@${post.authorId.username}/${post._id}`,
                                )}
                            </p>
                            <div class="flex mt-3">
                                <button class={`flex unique ${post.hasLiked ? "text-ctp-blue" : ""}`} onclick={() => like(post)}>
                                    <ThumbsUp size={24} />
                                    <span class="ml-1 mb-1">{post.likeCount}</span>
                                </button>
                                <button class={`flex unique ml-2 ${post.hasDisliked ? "text-ctp-blue" : ""}`} onclick={() => dislike(post)}>
                                    <ThumbsDown size={24} />
                                    <span class="ml-1 mb-1">{post.dislikeCount}</span>
                                </button>
                                <a href={`/@${post.authorId.username}/${post._id}`} class="flex ml-2">
                                    <MessageSquare size={24} />
                                    <span class="ml-1 mb-1">{post.commentCount}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
</div>