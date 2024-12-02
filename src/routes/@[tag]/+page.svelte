<script lang="ts">
    import { onMount } from "svelte";
    import SideBar from "$lib/components/SideBar.svelte";
    import { browser } from "$app/environment";
    import { state as _state } from "$lib/state.svelte";
    import { Send, MessageSquare } from "lucide-svelte";
    import { getCookie } from "typescript-cookie";
    import { createTimeString, parsePost } from "$lib/utils";
    import MessageOptionsDropdown from "$lib/components/MessageOptionsDropdown.svelte";
    import UserOptionsDropdown from "$lib/components/UserOptionsDropdown.svelte";
    import Badges from "$lib/components/Badges.svelte";

    let { data } = $props();

    let notFound = $state(false);
    let user = $state(null);
    let phone = $state(false);
    let postContent = $state("");
    let postingError = $state("");

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

            console.log(user);
        } else if (res.status == 307) {
            let json = await res.json();

            window.location.href = json.location;
        } else {
            notFound = true;
        }
    });

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
            let post = await res.json();

            user.posts.unshift(post);
            postContent = "";
        } else {
            let data = await res.json();

            postingError = data.message;
        }
    }
</script>

{#if user}
    <div class="flex min-h-screen w-full">
        <SideBar />
        <div
            class={`my-5 py-3 border border-ctp-surface0 rounded-md ${phone ? "w-full mx-2" : "w-3/5 mx-auto"}`}
        >
            <div class="border-b-4 border-b-ctp-surface0 pb-3 px-3">
                <div class="flex w-full">
                    <div>
                        <img
                            src={user.avatarUrl}
                            alt={user.username}
                            class="w-16 h-16 rounded-full object-cover"
                        />
                    </div> 
                    <div class="ml-2">
                        <h1 class="text-3xl font-bold leading-none flex">
                            {user.displayName}
                            <Badges {user} />
                        </h1>
                        <p class="text-xl text-ctp-subtext0">
                            @{user.username}
                        </p>
                    </div>

                    <div class="ml-auto">
                        <UserOptionsDropdown {user} />
                    </div>
                </div>

                {#if user.banned}
                    <div class="bg-ctp-mantle p-3 mt-4 rounded-md">
                        <h1 class="text-ctp-red font-bold text-xl">
                            This user has been banned
                        </h1>
                    </div>
                {/if}

                {#if _state.user && _state.user._id == user._id}
                    <textarea
                        class={`
                        w-full p-2 mt-3 border border-ctp-surface0 bg-ctp-mantle rounded-md
                        focus:outline-none focus:border-ctp-surface2 transition-color duration-500
                        ${postContent.length > 0 ? "h-32" : "h-11"}
                    `}
                        placeholder={`What's on your mind today @${user.username}?`}
                        maxlength="4000"
                        bind:value={postContent}
                    ></textarea>
                    <p class="mb-2 text-ctp-red text-right">
                        {postingError}
                    </p>
                    <div class="flex w-full justify-end">
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
                            <span class="ml-2 text-lg mb-0.5">Post</span>
                        </button>
                    </div>
                {/if}
            </div>

            {#each user.posts as post}
                <div class="px-3 py-4 border-b border-b-ctp-surface0 flex">
                    <div>
                        <img
                            src={user.avatarUrl}
                            alt={user.username}
                            class="w-14 h-14 rounded-full object-cover"
                        />
                    </div>
                    <div class="ml-2 w-full">
                        <div class="flex w-full">
                            <h1 class="text-2xl font-bold leading-none flex">
                                {user.displayName}
                                <Badges {user} small={true} />
                            </h1>
                            <span
                                class="text-ctp-subtext0 ml-1 mt-[5px] leading-none my-auto"
                            >
                                @{user.username}
                            </span>
                            <span class="ml-auto flex">
                                {#if !phone}
                                    <span class="text-ctp-subtext1"
                                        >{createTimeString(post.postedAt)}</span
                                    >
                                {/if}

                                <MessageOptionsDropdown
                                    post={{
                                        ...post,
                                        authorId: user,
                                    }}
                                />
                            </span>
                        </div>
                        <p class="text-lg prose">
                            {@html parsePost(
                                post,
                                true,
                                `/@${user.username}/${post._id}`,
                            )}
                        </p>
                        <div class="flex mt-2">
                            <a href={`/@${user.username}/${post._id}`} class="flex">
                                <MessageSquare size={24} class="my-auto" />
                                <span class="ml-1 mb-1">{post.commentCount}</span>
                            </a>
                        </div>
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
