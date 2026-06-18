import { createServerFn } from "@tanstack/react-start";
import { Redis } from "@upstash/redis";

const WAITLIST_KEY = "rema:waitlist";

let redis: Redis | undefined;

function getRedis(): Redis {
  redis ??= Redis.fromEnv();
  return redis;
}

/** Adds an email to the early-access waitlist stored in Upstash Redis. */
export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => {
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("A valid email is required.");
    }
    return { email };
  })
  .handler(async ({ data }) => {
    await getRedis().zadd(WAITLIST_KEY, {
      score: Date.now(),
      member: data.email,
    });
    return { ok: true as const };
  });
