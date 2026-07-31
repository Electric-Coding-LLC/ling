import {
  handleWordsKnowledgeGet,
  handleWordsKnowledgePatch,
  handleWordsKnowledgePut,
} from "../../vocabulary-route-handlers";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleWordsKnowledgeGet();
}

export async function PUT(request: Request) {
  return handleWordsKnowledgePut(request);
}

export async function PATCH(request: Request) {
  return handleWordsKnowledgePatch(request);
}
