import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@five-apps/database";

export async function POST(req: NextRequest) {
  const { vibe, name, email, address } = await req.json();

  if (!vibe || !name || !email || !address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      email,
      vibeLevel: vibe,
      totalNok: 0,
      status: "pending",
      address: {
        create: {
          name,
          line1: address,
          city: "Unknown",
          postal: "0000",
          country: "NO",
        },
      },
    },
  });

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
