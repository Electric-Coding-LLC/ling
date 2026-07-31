import { getAppVersion } from "../../../../src/modules/app-version";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    getAppVersion(),
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
