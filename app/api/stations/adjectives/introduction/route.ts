import { handleVocabularyIntroduction } from "../../vocabulary-route-handlers";

export const dynamic = "force-dynamic";

export async function POST() {
  return handleVocabularyIntroduction("adjectives");
}
