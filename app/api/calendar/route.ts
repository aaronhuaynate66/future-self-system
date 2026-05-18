import { NextResponse } from "next/server";

const ICS_URL =
  "https://outlook.office365.com/owa/calendar/accd4e434ba94f65a09a24e1f90959fd@grupohng.com/6de5dfa6946a4105ba5e9209e894d08a4241347691072872097/calendar.ics";

export const revalidate = 300; // revalidar cada 5 min en Vercel

export async function GET() {
  try {
    const res = await fetch(ICS_URL, {
      headers: { "User-Agent": "AaronOS/2.0" },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "fetch_failed", status: res.status }, { status: 502 });
    }

    const text = await res.text();

    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
