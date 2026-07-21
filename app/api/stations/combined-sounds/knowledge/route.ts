import { COMBINED_SOUND_PATTERN_IDS } from "@/src/modules/learning/kana-extensions";
import {
  getKanaPatternKnowledge,
  updateAllKanaPatternKnowledge,
  updateKanaPatternKnowledge,
} from "@/src/modules/learning/kana-pattern-api";

export const dynamic = "force-dynamic";

export async function GET() {
  return getKanaPatternKnowledge(COMBINED_SOUND_PATTERN_IDS);
}

export async function PUT(request: Request) {
  return updateKanaPatternKnowledge(request, COMBINED_SOUND_PATTERN_IDS);
}

export async function PATCH(request: Request) {
  return updateAllKanaPatternKnowledge(request, COMBINED_SOUND_PATTERN_IDS);
}
