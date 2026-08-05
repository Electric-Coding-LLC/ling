import { isVocabularyStationId } from "@/src/modules/learning/vocabulary";
import { handleVocabularyIntroduction } from "../../vocabulary-route-handlers";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ vocabularyStation: string }> },
) {
  const { vocabularyStation } = await params;
  if (!isVocabularyStationId(vocabularyStation)) return new Response(null, { status: 404 });
  return handleVocabularyIntroduction(vocabularyStation);
}
