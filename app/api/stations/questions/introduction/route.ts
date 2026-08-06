import { handleGrammarIntroduction } from "../../grammar-route-handlers";

export const dynamic = "force-dynamic";

export async function POST() {
  return handleGrammarIntroduction("questions");
}
