import { handleKanjiIntroduction } from "../../kanji-route-handlers";

export const dynamic = "force-dynamic";

export async function POST() {
  return handleKanjiIntroduction("characters");
}
