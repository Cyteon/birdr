<script lang="ts">
    import { setCookie } from "typescript-cookie";

    let identifier = "";
    let password = "";
    let error = "";
    let loading = false;

    async function login() {
        error = "";
        loading = true;

        if (!identifier || !password) {
            error = "Please fill in all the fields";
            loading = false;
            return;
        }

        if (password.length < 8) {
            error = "Invalid credentials";
            loading = false;
            return;
        }

        try {
            const res = await fetch("/api/v1/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ identifier, password }),
            });

            if (res.ok) {
                const data = await res.json();

                setCookie("token", data.token, {
                    expires: 365,
                    path: "/",
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
        <form class="bg-ctp-mantle p-5 rounded-md" onsubmit={login}>
            <h1 class="font-bold text-3xl">Welcome Back!</h1>

            <label for="identifier" class="block mt-5 text-lg"
                >Username or Email</label
            >
            <input
                type="text"
                id="identifier"
                placeholder="Username or Email"
                class="w-full text-lg p-2 my-2 border-2 border-ctp-base bg-ctp-crust rounded-lg"
                bind:value={identifier}
            />

            <label for="password" class="block mt-2 text-lg">Password</label>
            <input
                type="password"
                id="password"
                placeholder="Password"
                class="w-full text-lg p-2 my-2 mb-1 border-2 border-ctp-base bg-ctp-crust rounded-lg"
                bind:value={password}
            />

            <p class="text-ctp-red">{error}</p>
            <button class="w-full text-lg mt-2 p-2">Login</button>
            <p class="text-ctp-subtext1 mt-2">
                Dont have an account? <a
                    href="/auth/register"
                    class="text-ctp-blue">Register</a
                >
            </p>
        </form>
    </div>
</div>
