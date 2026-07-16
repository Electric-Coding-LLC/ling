import { getOrCreateUser } from "@/src/modules/users/repository";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export const dynamic = "force-dynamic";

export async function GET() {
  const identity = await getCurrentIdentity();
  if (!identity) {
    return Response.json(
      { error: "unauthorized" },
      { status: 401, headers: privateNoStoreHeaders() },
    );
  }

  const user = await getOrCreateUser(identity);
  return Response.json(
    {
      id: user.id,
      displayName: identity.displayName,
    },
    { headers: privateNoStoreHeaders() },
  );
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
