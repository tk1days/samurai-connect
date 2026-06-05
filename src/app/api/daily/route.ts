import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { expertId } = await req.json();

  const res = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: `sc-${expertId}-${Date.now()}`,
      properties: {
        max_participants: 2,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1時間で期限切れ
        enable_chat: true,
        enable_screenshare: false,
      },
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "ルーム作成失敗" }, { status: 500 });
  }

  const room = await res.json();
  return NextResponse.json({ url: room.url, name: room.name });
}
