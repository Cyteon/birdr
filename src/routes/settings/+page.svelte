<script lang="ts">
    import { state } from "$lib/state.svelte";
    import SideBar from "$lib/components/SideBar.svelte";
    import { getCookie } from "typescript-cookie";
    import { browser } from "$app/environment";

    let displayName = "";
    let username = "";
    let bio = "";
    let userInfoError = "";
    let userInfoSuccess = "";

    let theme: "latte" | "frappe" | "macchiato" | "mocha" = "macchiato";

    if (browser) {
        theme = localStorage.getItem("theme") as "latte" | "frappe" | "macchiato" | "mocha" || "macchiato";
    }

    function updateTheme() {
        localStorage.setItem("theme", theme);
        document.documentElement.className = `ctp-${theme}`;
    }

    async function updateUserInfo() {
        userInfoError = "";
        userInfoSuccess = "";

        if (/[^a-zA-Z0-9]/.test(username)) {
            userInfoError = "Username can only contain letters and numbers";
            return;
        }

        const avatar = (document.getElementById("avatar") as HTMLInputElement).files?.[0];
        let body = {};

        if (displayName !== "") {
            if (displayName.length > 30) {
                userInfoError = "Display name must be less than 30 characters!";
                return;
            }

            body.displayName = displayName;
        }

        if (username !== "") {
            if (username.length > 20) {
                userInfoError = "Username must be less than 20 characters!";
                return;
            }

            body.username = username;
        }

        if (bio !== "") {
            if (bio.length > 160) {
                userInfoError = "Bio must be less than 160 characters!";
                return;
            }

            body.bio = bio;
        }

        if (avatar) {
            if (avatar.size > 2048 * 2048) {
                userInfoError = "Avatar must be less than 2MB!";
                return;
            }

            if (!avatar.type.startsWith("image/")) {
                userInfoError = "Avatar must be an image!";
                return;
            }

            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();

                reader.onload = () => {
                    resolve(reader.result as string);
                };

                reader.readAsDataURL(avatar);
            });

            body.avatar = base64;
        }

        const res = await fetch("/api/v1/users/@me", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            state.user = await res.json();

            userInfoSuccess = "Successfully updated user info!";
        } else {
            userInfoError = (await res.json()).message;
        }
    }
</script>

<div class="flex min-h-screen w-full">
    <SideBar />

    <div class="m-3 p-2 border border-ctp-surface0 rounded-md w-full">
        <h1 class="text-3xl font-bold">Settings</h1>

        <div class="mt-5 flex flex-wrap">
            <div class="mr-2 mb-2 flex flex-col w-64">
                <h1 class="text-xl font-semibold">Display Name</h1>
                <input
                    type="text"
                    placeholder={state.user?.displayName as string}
                    bind:value={displayName}
                />

                <h1 class="text-xl font-semibold mt-3">Username</h1>
                <input
                    type="text"
                    placeholder={state.user?.username as string}
                    on:keypress={(e) => {
                        if (e.key === " ") {
                            e.preventDefault();
                        }
                    }}
                    bind:value={username}
                />

                <h1 class="text-xl font-semibold mt-3">Bio</h1>
                <textarea
                    class="unique2 bg-ctp-mantle mt-2 text-lg p-2 rounded-lg outline-none "
                    placeholder={state.user?.bio as string}
                    bind:value={bio}
                ></textarea>


                <!-- avatar upload -->

                <h1 class="text-xl font-semibold mt-3">Avatar</h1>
                <input
                    type="file"
                    accept="image/*"
                    id="avatar"
                    class="
                        unique2 bg-ctp-mantle mt-2 text-lg file:bg-ctp-crust file:p-2 file:border-none
                        file:text-ctp-text file:rounded-l-lg rounded-lg
                    "
                    />

                {#if userInfoError}
                    <p class="text-ctp-red mt-1 text-lg">
                        {userInfoError}
                    </p>
                {:else if userInfoSuccess}
                    <p class="text-ctp-green mt-1 text-lg">
                        {userInfoSuccess}
                    </p>
                {/if}


                <button
                    class="text-xl py-2 mt-2"
                    on:click={() => updateUserInfo()}
                >
                    Update
                </button>
            </div>
            <div class="mr-2 mb-2">
                <h1 class="text-xl font-semibold mb-4">Delete</h1>
                <a href="/settings/delete" class="text-xl py-2 px-4 rounded-md text-ctp-crust bg-ctp-red">Delete Account</a>
            </div>
            <div>
                <h1 class="text-xl font-semibold">Theme</h1>
                <div class="flex flex-col">
                    <select class="mt-2 p-3 rounded-md" bind:value={theme} on:change={() => updateTheme()}>
                        <option value="latte">Latte</option>
                        <option value="frappe">Frappe</option>
                        <option value="macchiato">Macchiato</option>
                        <option value="mocha">Mocha</option>
                        <option value="">Black & White</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    input:not(.unique2), select:not(.unique2) {
        outline: none;
        @apply w-64 text-lg p-2 mt-2 border border-ctp-surface0 bg-ctp-mantle rounded-md;
    }
</style>
