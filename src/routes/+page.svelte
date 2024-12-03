<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { Send, MessageSquare, Pin, ThumbsUp, ThumbsDown } from "lucide-svelte";
    import { browser } from "$app/environment";
    import { getCookie } from "typescript-cookie";
    import { onMount } from "svelte";
    import { state as state } from "$lib/state.svelte";
    import { createTimeString, parsePost } from "$lib/utils";
    import MessageOptionsDropdown from "$lib/components/MessageOptionsDropdown.svelte";
    import Badges from "$lib/components/Badges.svelte";

    let postContent = "";
    let postingError = "";

    let search = "";

    let tab = "explore";
    let sorting = "desc";
    let phone = false;
    let noMorePosts = false;
    let screenW = 1280;

    if (browser) {
        window.addEventListener("resize", () => {
            phone = window.innerWidth < 768;
            screenW = window.innerWidth;
        });

        phone = window.innerWidth < 768;
        screenW = window.innerWidth;
    }

    let posts = [];

    onMount(async () => {
        const res = await fetch("/api/v1/posts", {
            headers: {
                "Content-Type": "application/json",
            },
        });

        posts = await res.json();

        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting) {
                    let params = `?sort=${sorting}&offset=${posts.length}`;

                    if (tab === "following") {
                        params += "&following=true";
                    }

                    const res = await fetch(
                        `/api/v1/posts${params}`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                        },
                    );

                    let newPosts = await res.json();

                    if (newPosts.length === 0) {
                        noMorePosts = true;
                    }

                    posts = [...posts, ...newPosts];
                }
            },
            {
                threshold: 0.5,
            },
        );

        observer.observe(document.getElementById("bottom")!);
    });

    async function newSort(sort) {
        sorting = sort;

        let params = `?sort=${sorting}`;

        if (tab === "following") {
            params += "&following=true";
        }

        const res = await fetch(`/api/v1/posts${params}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        posts = await res.json();
    }

    async function post() {
        postingError = "";

        const res = await fetch("/api/v1/posts", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
            body: JSON.stringify({ content: postContent }),
        });

        if (res.ok) {
            window.location.reload();
        } else {
            let data = await res.json();

            postingError = data.message;
        }
    }

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

<div class={`flex min-h-screen w-full`}>
    <SideBar />

    <div class={`my-5 ${phone ? "w-full px-1" : "w-3/5 mx-auto"}`}>
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
            class={`my-5 pb-3 border border-ctp-surface0 rounded-md `}
        >

            {#if state.user}
                <div class="pb-2 px-3 mt-2 border-b-2 border-b-ctp-surface0">
                    <h1 class="text-2xl font-bold mb-2">New Post</h1>
                    <textarea
                        class={`
                        w-full p-2 border border-ctp-surface0 bg-ctp-mantle rounded-md
                        focus:outline-none focus:border-ctp-surface2 transition-color duration-500
                        ${postContent.length > 0 ? "h-32" : "h-11"}
                    `}
                        placeholder={`What's on your mind today @${state.user.username}?`}
                        maxlength="4000"
                        bind:value={postContent}
                    ></textarea>
                    <p class="mb-2 text-ctp-red text-right">
                        {postingError}
                    </p>
                    <div class="flex w-full justify-end">
                        <select
                            class="p-2 rounded-lg bg-ctp-crust outline-none text-lg mr-auto"
                            onchange={(event) => newSort(event.target.value)}
                        >
                            <option value="desc">Newest</option>
                            <option value="top">Top</option>
                            <option value="asc">Oldest</option>
                        </select>

                        <button
                            class={`unique p-2 rounded-md text-ctp-crust flex transition-colors duration-300 ${
                                postContent.length === 0
                                    ? "bg-ctp-surface1 text-ctp-subtext1"
                                    : "bg-ctp-blue"
                            }`}
                            disabled={postContent.length === 0}
                            onclick={post}
                        >
                            <Send size={24} class="my-auto" />
                            <span class="ml-2 text-lg mt-0.5">Post</span>
                        </button>
                    </div>

                    <div class="px- pt-1 flex w-full"></div>
                </div>
            {/if}

            {#if state.user}
                <div class="border-b-2 border-b-ctp-surface0 py-2 px-2 w-full flex">
                    <button 
                        class={`unique tabButton ${tab === "explore" ? "bg-ctp-crust/50" : ""}`}
                        onclick={() => {
                            tab = "explore";
                            newSort(sorting);
                        }}
                    >
                        Explore
                    </button>

                    <button 
                        class={`unique tabButton ${tab === "following" ? "bg-ctp-crust/50" : ""}`}
                        onclick={() => {
                            tab = "following";
                            newSort(sorting);
                        }}
                    >
                        Following
                    </button>
                </div>
            {/if}

            {#each posts as post}
                <div class="p-3 border-b border-b-ctp-surface0" id={post._id}>
                    {#if post.pinned}
                        <p class="text-lg flex mb-3 text-ctp-subtext1">
                            <Pin size={24} class="my-auto" />
                            <span class="ml-1">Pinned by staff</span>
                        </p>
                    {/if}
                    <div class="flex">
                        <div>
                            <img
                                src={post.authorId.avatarUrl}
                                alt={post.authorId.username}
                                class="w-14 h-14 rounded-full object-cover"
                            />
                        </div>
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
                                        authorId={post.authorId._id}
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
                </div>
            {/each}

            {#if noMorePosts}
                <div class="pb-2 pt-4 flex">
                    <p class="text-ctp-subtext1 mx-auto text-2xl">
                        {#if tab == "following" && posts.length == 0}
                            No posts from anyone you are following, try following more people
                        {:else}
                            No more posts to show
                        {/if}
                    </p>
                </div>
            {/if}

            <div id="bottom"></div>
        </div>
    </div>
</div>

<style>
    .tabButton {
        width: 100%;

        @apply mx-1 transition-colors duration-500 p-2 rounded-md text-lg;
    }

    .tabButton:hover {
        @apply bg-ctp-crust/50;
    }
</style>