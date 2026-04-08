import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidatePath("/", "page");
  revalidatePath("/plattform", "page");
  revalidatePath("/full-service", "page");
  revalidatePath("/partner", "page");
  revalidatePath("/losningar", "page");
  revalidatePath("/losningar/ceo-founders", "page");
  revalidatePath("/losningar/cfo-finance", "page");
  revalidatePath("/losningar/saas-tech", "page");
  revalidatePath("/losningar/konsult-tjanster", "page");
  revalidatePath("/losningar/ehandel", "page");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
