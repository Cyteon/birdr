<script lang="ts">
    import { setCookie } from "typescript-cookie";

    let username = "";
    let email = "";
    let displayName = "";
    let password = "";
    let error = "";
    let loading = false;

    async function register() {
        error = "";
        loading = true;

        if (!username || !password || !email || !displayName) {
            error = "Please fill in all the fields";
            loading = false;
            return;
        }

        if (/[^a-zA-Z0-9]/.test(username)) {
            error = "Username can only contain letters and numbers";
            loading = false;
            return;
        }

        if (password.length < 8) {
            error = "Password must be at least 8 characters long";
            loading = false;
            return;
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            error = "Invalid email";
            loading = false;
            return;
        }

        try {
            const res = await fetch("/api/v1/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    displayName,
                    password,
                }),
            });

            if (res.ok) {
                const data = await res.json();

                setCookie("token", data.token, {
                    expires: 365,
                });

                window.location.href = "/";
            } else {
                const data = await res.json();
                error = data.message;
            }
        } catch (err) {
            error = "Something went wrong";
        }
    }
</script>

<div class="h-screen w-full flex">
    <div class="p-2 m-auto">
        <form
            class="bg-ctp-mantle p-5 rounded-md w-[420px]"
            onsubmit={register}
        >
            <h1 class="font-bold text-3xl">Hi there!</h1>

            <label for="email" class="block mt-5 text-lg">Email</label>
            <input
                type="email"
                id="email"
                placeholder="example@example.com"
                class="w-full text-lg p-2 my-2 border-2 border-ctp-base bg-ctp-crust rounded-lg"
                bind:value={email}
            />

            <label for="username" class="block mt-2 text-lg">Username</label>
            <input
                type="text"
                id="username"
                placeholder="Username"
                class="w-full text-lg p-2 my-2 border-2 border-ctp-base bg-ctp-crust rounded-lg"
                bind:value={username}
            />

            <label for="displayName" class="block mt-2 text-lg"
                >Display Name</label
            >
            <input
                type="text"
                id="displayName"
                placeholder="Display Name"
                class="w-full text-lg p-2 my-2 border-2 border-ctp-base bg-ctp-crust rounded-lg"
                bind:value={displayName}
            />

            <label for="password" class="block mt-2 text-lg">Password</label>
            <input
                type="password"
                id="password"
                placeholder="Password"
                class="w-full text-lg p-2 my-2 border-2 border-ctp-base bg-ctp-crust rounded-lg"
                bind:value={password}
            />

            <p class="text-ctp-red">{error}</p>
            <button class="w-full text-lg mt-2 p-2">Register</button>
            <p class="text-ctp-subtext1 mt-2">
                Already have an account? <a
                    href="/auth/login"
                    class="text-ctp-blue">Login</a
                >
            </p>
        </form>
    </div>
</div>
