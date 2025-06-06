<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { createTimeString, parsePost } from "$lib/utils";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import MessageOptionsDropdown from "$lib/components/MessageOptionsDropdown.svelte";
    import Badges from "$lib/components/Badges.svelte";
    import { state as _state } from "$lib/state.svelte";
    import { Send, ThumbsDown, ThumbsUp } from "lucide-svelte";
    import { getCookie } from "typescript-cookie";

    let { data } = $props();

    let notFound = $state(false);
    let phone = $state(false);

    let post = $state(null);

    let commentContent = $state("");
    let commentingError = $state("");


    onMount(async () => {
        const res = await fetch(`/api/v1/posts/${data.slug}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            post = await res.json();
            console.log(post);
        } else {
            notFound = true;
        }
    });

    if (browser) {
        window.addEventListener("resize", () => {
            phone = window.innerWidth < 768;
        });

        phone = window.innerWidth < 768;
    }

    async function comment() {
        commentingError = "";

        const res = await fetch(`/api/v1/posts/${data.slug}/comments`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
            body: JSON.stringify({ content: commentContent }),
        });

        if (res.ok) {
            commentContent = "";

            window.location.reload();
        } else {
            commentingError = "An error occurred while commenting";
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
            post.hasLiked = !post.hasLiked;
            post.likeCount += post.hasLiked ? 1 : -1;

            post.dislikeCount -= post.hasDisliked ? 1 : 0;
            post.hasDisliked = false;
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
            post.hasDisliked = !post.hasDisliked;
            post.dislikeCount += post.hasDisliked ? 1 : -1;

            post.likeCount -= post.hasLiked ? 1 : 0;
            post.hasLiked = false;
        }
    }
</script>

<div class="flex min-h-screen w-full">
    <SideBar />
    <div class="w-full flex">
        {#if notFound}
            <div class="m-auto">
                <h1 class="text-3xl font-bold text-ctp-red">Post not found</h1>
            </div>
        {:else if post}
            <div
                class={`m-3 border border-ctp-surface0 rounded-md ${phone ? "w-full mx-1" : "w-3/5 mx-auto"}`}
            >
                <div class="px-3 py-4 border-b border-b-ctp-surface0 flex">
                    <div>
                        <img
                            src={post.authorId.avatarUrl}
                            alt={post.authorId.username}
                            class="w-14 h-14 rounded-full object-cover"
                        />
                    </div>
                    <div class="ml-2 w-full">
                        <div class="flex w-full">
                            <a class="text-2xl font-bold leading-none" href={`/@${post.authorId.username}`}>
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
                        </div>
                        <p class="text-lg prose break-words">
                            {@html parsePost(post, false)}
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
                        </div>
                    </div>
                </div>

                <div class="px-3 py-3 border-b border-b-ctp-surface0">
                    {#if _state.user}
                        <div>
                            <textarea
                                class={`
                                w-full p-2 border border-ctp-surface0 bg-ctp-mantle rounded-md
                                focus:outline-none focus:border-ctp-surface2 transition-color duration-500
                                ${commentContent.length > 0 ? "h-32" : "h-11"}
                            `}
                                placeholder="Write a comment..."
                                maxlength="1000"
                                bind:value={commentContent}
                            ></textarea>
                            <p class="mb-2 text-ctp-red text-right">
                                {commentingError}
                            </p>
                            <div class="flex w-full justify-end">
                                <button
                                    class={`unique p-2 rounded-md text-ctp-crust flex transition-colors duration-300 ${
                                        commentContent.length === 0
                                            ? "bg-ctp-surface1 text-ctp-subtext1"
                                            : "bg-ctp-blue"
                                    }`}
                                    disabled={commentContent.length === 0}
                                    onclick={comment}
                                >
                                    <Send size={24} class="my-auto" />
                                    <span class="ml-2 text-lg mb-0.5">Comment</span>
                                </button>
                            </div>
                        </div>
                    {:else}
                        <div>
                            <h1 class="text-2xl mb-1"><a href="/auth/login" class="text-ctp-blue">Login</a> to comment</h1>
                        </div>
                    {/if}
                </div>

                {#each post.comments as comment}
                    <div class="px-3 py-4 border-b border-b-ctp-surface0 flex">
                        <div>
                            <img
                                src={comment.authorId.avatarUrl}
                                alt={comment.authorId.username}
                                class="w-14 h-14 rounded-full object-cover"
                            />
                        </div>
                        <div class="ml-2 w-full">
                            <div class="flex w-full">
                                <a class="text-2xl font-bold leading-none" href={`/@${comment.authorId.username}`}>
                                    {comment.authorId.displayName}
                                </a>
                                <Badges user={comment.authorId} small={true} />
                                <span
                                    class="text-ctp-subtext0 ml-1 mt-[5px] leading-none my-auto"
                                >
                                    @{comment.authorId.username}
                                </span>
                                <span class="ml-auto flex">
                                    {#if !phone}
                                        <span class="text-ctp-subtext1"
                                            >{createTimeString(comment.postedAt)}</span
                                        >
                                    {/if}
                                </span>
                                <MessageOptionsDropdown
                                    post={comment}
                                    isComment={true}
                                />
                            </div>
                            <p class="text-lg prose break-words">
                                {@html parsePost(comment, false)}
                            </p>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
