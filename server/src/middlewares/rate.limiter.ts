// import rateLimit from "express-rate-limit";
// import RedisStore from "rate-limit-redis";
// import { redis } from "../redis/redis";

// export const limiter = rateLimit({
//   store: new RedisStore({
//     sendCommand: (...args: any[]) => {
//       const [command, ...rest] = args;
//       return redis.sendCommand(command, rest as any) as any;
//     },
//   }),
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: {
//     status: false,
//     message: "Rate limit exceeded. Try again later.",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });
