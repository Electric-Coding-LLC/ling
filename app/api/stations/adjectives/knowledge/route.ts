import {
  handleVocabularyKnowledgeGet,
  handleVocabularyKnowledgePatch,
  handleVocabularyKnowledgePut,
} from "../../vocabulary-route-handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleVocabularyKnowledgeGet("adjectives");
}

export async function PUT(request: Request) {
  return handleVocabularyKnowledgePut("adjectives", request);
}

export async function PATCH(request: Request) {
  return handleVocabularyKnowledgePatch("adjectives", request);
}
