import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

// GET — Single order lao
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Please log in first" },
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

        const { id } = await params;

        const response = await fetch(`${BACKEND_URL}/orders/${id}`, {
            headers: {
                Authorization: `Bearer ${backendToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.message || data.error || "Order fetch failed" },
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

// PUT — Order status update
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Please log in first" },
                { status: 401 }
            );
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json(
                { error: "Only admins can update order status" },
                { status: 403 }
            );
        }

        const backendToken = (session.user as any).backendToken;
        if (!backendToken) {
            return NextResponse.json(
                { error: "Token not found" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await req.json();

        const response = await fetch(`${BACKEND_URL}/orders/${id}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${backendToken}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.message || data.error || "Status update failed" },
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