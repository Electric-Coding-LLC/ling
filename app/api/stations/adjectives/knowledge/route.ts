import {
  handleGrammarKnowledgeGet,
  handleGrammarKnowledgePatch,
  handleGrammarKnowledgePut,
} from "../../grammar-route-handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleGrammarKnowledgeGet("adjectives");
}

export async function PUT(request: Request) {
  return handleGrammarKnowledgePut(request, "adjectives");
}

export async function PATCH(request: Request) {
  return handleGrammarKnowledgePatch(request, "adjectives");
}
