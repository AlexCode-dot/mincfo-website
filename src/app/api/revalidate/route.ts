import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("sanity-content", "default");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
