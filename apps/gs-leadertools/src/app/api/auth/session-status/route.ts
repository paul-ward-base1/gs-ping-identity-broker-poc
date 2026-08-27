import { NextResponse } from "next/server";
import { isSessionRevoked } from "@/lib/brokerSessionRevocation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const issuer = url.searchParams.get("issuer");
  const sid = url.searchParams.get("sid");
  const sub = url.searchParams.get("sub");
  const issuedAt = Number(url.searchParams.get("iat"));
  if (!issuer || (!sid && !sub)) return NextResponse.json({ revoked: false });

  const revoked = await isSessionRevoked({
    issuer,
    sid: sid ?? undefined,
    sub: sub ?? undefined,
    issuedAt: Number.isFinite(issuedAt) ? issuedAt : undefined,
  });
  return NextResponse.json({ revoked });
}
