import {
  handleVocabularyKnowledgeGet,
  handleVocabularyKnowledgePatch,
  handleVocabularyKnowledgePut,
} from "../../vocabulary-route-handlers";
export const dynamic = "force-dynamic";
export async function GET() { return handleVocabularyKnowledgeGet("pointing"); }
export async function PUT(request: Request) { return handleVocabularyKnowledgePut(request, "pointing"); }
export async function PATCH(request: Request) { return handleVocabularyKnowledgePatch(request, "pointing"); }
