import {
  FINAL_ROMAJI,
  ROMAJI_COLUMN_HEADINGS,
  ROMAJI_COMBINED_ROWS,
  ROMAJI_ROWS,
  ROMAJI_RULES,
} from "../../../src/modules/romaji";
import { StationTopbar } from "../station-topbar";
import { RomajiGuide } from "./romaji-guide";

export default function RomajiPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Rōmaji" mapPosition="romaji" />
      <div className="station-page station-page-travel station-page-romaji">
        <RomajiGuide
          columnHeadings={ROMAJI_COLUMN_HEADINGS}
          combinedRows={ROMAJI_COMBINED_ROWS}
          finalEntry={FINAL_ROMAJI}
          rows={ROMAJI_ROWS}
          rules={ROMAJI_RULES}
        />
      </div>
    </main>
  );
}
