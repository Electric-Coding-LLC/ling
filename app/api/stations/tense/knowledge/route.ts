import {
  handleGrammarKnowledgeGet,
  handleGrammarKnowledgePatch,
  handleGrammarKnowledgePut,
} from "../../grammar-route-handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleGrammarKnowledgeGet("tense");
}

export async function PUT(request: Request) {
  return handleGrammarKnowledgePut(request, "tense");
}

export async function PATCH(request: Request) {
  return handleGrammarKnowledgePatch(request, "tense");
}
