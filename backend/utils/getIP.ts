import { Request } from "express";

export const getIP = (req: Request): string => {
    // ← Proxy/Cloudflare ke through aaya?
    const forwarded = req.headers["x-forwarded-for"];

    if (forwarded) {
        const ip = Array.isArray(forwarded)
            ? forwarded[0]
            : forwarded.split(",")[0].trim();
        return ip;
    }

    // ← Direct IP
    const realIP = req.headers["x-real-ip"];
    if (realIP) {
        return Array.isArray(realIP) ? realIP[0] : realIP;
    }

    // ← Socket IP
    return req.socket.remoteAddress || "127.0.0.1";
};