import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
      true,
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    // Revalidate the sync tags used by sanityFetch
    revalidateTag("sanity", "default");

    return NextResponse.json({ revalidated: true, type: body?._type });
  } catch (err) {
    return new Response((err as Error).message, { status: 500 });
  }
}
