import {
  handleKanjiKnowledgeGet,
  handleKanjiKnowledgePatch,
  handleKanjiKnowledgePut,
} from "../../kanji-route-handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleKanjiKnowledgeGet("endings");
}

export async function PUT(request: Request) {
  return handleKanjiKnowledgePut(request, "endings");
}

export async function PATCH(request: Request) {
  return handleKanjiKnowledgePatch(request, "endings");
}
