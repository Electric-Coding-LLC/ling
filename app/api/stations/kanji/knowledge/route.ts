import {
  handleKanjiKnowledgeGet,
  handleKanjiKnowledgePatch,
  handleKanjiKnowledgePut,
} from "../../kanji-route-handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleKanjiKnowledgeGet("kanji");
}

export async function PUT(request: Request) {
  return handleKanjiKnowledgePut(request, "kanji");
}

export async function PATCH(request: Request) {
  return handleKanjiKnowledgePatch(request, "kanji");
}
