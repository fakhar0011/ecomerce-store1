import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

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

        // ✅ Admin Check
        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json(
                { error: "Only admin can view this" },
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

        // ✅ Saare query params backend ko forward karo
        // (status, orderId, minPrice, maxPrice, dateFrom, dateTo, page, limit)
        const { searchParams } = new URL(req.url);
        const query = searchParams.toString();
        const url = `${BACKEND_URL}/orders${query ? `?${query}` : ""}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${backendToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.message || data.error || "Orders fetch failed" },
                { status: response.status }
            );
        }

        // ✅ Backend { success, data, pagination } → { orders, pagination }
        return NextResponse.json({
            orders: data.data || [],
            pagination: data.pagination || {},
        }, { status: response.status });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}