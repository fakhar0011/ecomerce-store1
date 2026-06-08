import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

// GET — User ke saare orders lao
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        // ✅ Auth Check
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Please login first" },
                { status: 401 }
            );
        }

        const backendToken = (session.user as any).backendToken;
        if (!backendToken) {
            return NextResponse.json(
                { error: "Token not found" },
                { status: 401 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/orders/my-orders`, {
            headers: {
                Authorization: `Bearer ${backendToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.message || "Error fetching orders" },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// POST — Naya order banao
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        // ✅ Auth Check
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Please login first" },
                { status: 401 }
            );
        }

        const backendToken = (session.user as any).backendToken;
        if (!backendToken) {
            return NextResponse.json(
                { error: "Token not found" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const response = await fetch(`${BACKEND_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${backendToken}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.message || "Error creating order" },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}