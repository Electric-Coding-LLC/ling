import {
  handleVocabularyKnowledgeGet,
  handleVocabularyKnowledgePatch,
  handleVocabularyKnowledgePut,
} from "../../vocabulary-route-handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleVocabularyKnowledgeGet("nouns");
}

export async function PUT(request: Request) {
  return handleVocabularyKnowledgePut("nouns", request);
}

export async function PATCH(request: Request) {
  return handleVocabularyKnowledgePatch("nouns", request);
}
