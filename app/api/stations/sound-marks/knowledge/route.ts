import { SOUND_MARK_PATTERN_IDS } from "@/src/modules/learning/kana-extensions";
import {
  getKanaPatternKnowledge,
  updateAllKanaPatternKnowledge,
  updateKanaPatternKnowledge,
} from "@/src/modules/learning/kana-pattern-api";

export const dynamic = "force-dynamic";

export async function GET() {
  return getKanaPatternKnowledge(SOUND_MARK_PATTERN_IDS);
}

export async function PUT(request: Request) {
  return updateKanaPatternKnowledge(request, SOUND_MARK_PATTERN_IDS);
}

export async function PATCH(request: Request) {
  return updateAllKanaPatternKnowledge(request, SOUND_MARK_PATTERN_IDS);
}
