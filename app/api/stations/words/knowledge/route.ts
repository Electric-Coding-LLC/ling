import {
  handleVocabularyKnowledgeGet,
  handleVocabularyKnowledgePatch,
  handleVocabularyKnowledgePut,
} from "../../vocabulary-route-handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleVocabularyKnowledgeGet("words");
}

export async function PUT(request: Request) {
  return handleVocabularyKnowledgePut("words", request);
}

export async function PATCH(request: Request) {
  return handleVocabularyKnowledgePatch("words", request);
}
