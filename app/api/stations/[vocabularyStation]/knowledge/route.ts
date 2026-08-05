import { isVocabularyStationId } from "@/src/modules/learning/vocabulary";
import {
  handleVocabularyKnowledgeGet,
  handleVocabularyKnowledgePatch,
  handleVocabularyKnowledgePut,
} from "../../vocabulary-route-handlers";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ vocabularyStation: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const stationId = await getStationId(params);
  return stationId
    ? handleVocabularyKnowledgeGet(stationId)
    : new Response(null, { status: 404 });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const stationId = await getStationId(params);
  return stationId
    ? handleVocabularyKnowledgePut(request, stationId)
    : new Response(null, { status: 404 });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const stationId = await getStationId(params);
  return stationId
    ? handleVocabularyKnowledgePatch(request, stationId)
    : new Response(null, { status: 404 });
}

async function getStationId(params: RouteContext["params"]) {
  const { vocabularyStation } = await params;
  return isVocabularyStationId(vocabularyStation) ? vocabularyStation : null;
}
