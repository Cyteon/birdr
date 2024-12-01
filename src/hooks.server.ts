import mongoose from "mongoose";
import type { Handle } from "@sveltejs/kit";
import { RetryAfterRateLimiter } from "sveltekit-rate-limiter/server";
import {
  MONGODB_URI,
  LIMITER_COOKIE_NAME,
  LIMITER_COOKIE_SECRET,
} from "$env/static/private";

await mongoose.connect(MONGODB_URI);

const limiters = {
  "/api/v1/auth/register": {
    limiter: new RetryAfterRateLimiter({
      IP: [5, "2h"],
    }),
    methods: ["POST"],
  },
  "/api/v1/auth/login": {
    limiter: new RetryAfterRateLimiter({
      IP: [10, "30m"],
    }),
    methods: ["POST"],
  },
  "/api/v1/posts": {
    limiter: new RetryAfterRateLimiter({
      cookie: {
        name: LIMITER_COOKIE_NAME,
        secret: LIMITER_COOKIE_SECRET,
        rate: [12, "10m"],
        preflight: false,
      },
      IPUA: [12, "10m"],
      IP: [100, "h"],
    }),
    methods: ["PUT"],
  },
};

export const handle: Handle = async ({ event, resolve }) => {
  let limiter = limiters[event.url.pathname]?.limiter;

  if (
    limiter &&
    limiters[event.url.pathname].methods.includes(event.request.method)
  ) {
    const status = await limiter.check(event);

    if (status.limited) {
      let response = Response.json(
        {
          message: `You are being rate limited. Please try after ${status.retryAfter} seconds.`,
        },
        {
          status: 429,
          headers: { "Retry-After": status.retryAfter.toString() },
        },
      );
      return response;
    }
  }

  const response = await resolve(event);
  return response;
};
