import {
  handleVocabularyKnowledgeGet,
  handleVocabularyKnowledgePatch,
  handleVocabularyKnowledgePut,
} from "../../vocabulary-route-handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleVocabularyKnowledgeGet("verbs");
}

export async function PUT(request: Request) {
  return handleVocabularyKnowledgePut("verbs", request);
}

export async function PATCH(request: Request) {
  return handleVocabularyKnowledgePatch("verbs", request);
}
