import packageJson from "@/package.json";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      version: packageJson.version,
      build: process.env.SITES_BUILD_SHA ?? "development",
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
