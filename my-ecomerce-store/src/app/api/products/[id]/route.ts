import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/products/${id}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Error fetching product" },
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const backendToken = (session.user as any).backendToken;
    if (!backendToken) {
      return NextResponse.json({ error: "Token not found" }, { status: 401 });
    }

    const { id } = await params;

    // ← Content type check — FormData ya JSON?
    const contentType = req.headers.get("content-type") || "";
    let body: BodyInit;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${backendToken}`,
    };

    if (contentType.includes("multipart/form-data")) {
      body = await req.formData();
      // Content-Type header set mat karo — browser automatically boundary add karta hai
    } else {
      body = await req.text();
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${BACKEND_URL}/products/${id}`, {
      method: "PUT",
      headers,
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Error updating product" },
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const backendToken = (session.user as any).backendToken;
    if (!backendToken) {
      return NextResponse.json({ error: "Token not found" }, { status: 401 });
    }

    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${backendToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Error deleting product" },
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
