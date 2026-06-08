import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
    PORT: number;
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    IMAGEKIT_PUBLIC_KEY: string;
    IMAGEKIT_PRIVATE_KEY: string;
    IMAGEKIT_URL_ENDPOINT: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;
    EMAIL_FROM: string;
    FRONTEND_URL: string;
}

const requiredEnvVars = [
    "MONGODB_URI",
    "JWT_SECRET",
    "IMAGEKIT_PUBLIC_KEY",
    "IMAGEKIT_PRIVATE_KEY",
    "IMAGEKIT_URL_ENDPOINT",
    "EMAIL_USER",
    "EMAIL_PASS",
    "EMAIL_FROM",
];

// ← Zaroori variables check karo
requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`❌ Missing required env variable: ${key}`);
    }
});

export const env: EnvConfig = {
    PORT: parseInt(process.env.PORT || "5000"),
    MONGODB_URI: process.env.MONGODB_URI as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY as string,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY as string,
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT as string,
    EMAIL_USER: process.env.EMAIL_USER as string,
    EMAIL_PASS: process.env.EMAIL_PASS as string,
    EMAIL_FROM: process.env.EMAIL_FROM as string,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};