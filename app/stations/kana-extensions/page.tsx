import { redirect } from "next/navigation";

export const dynamic = "force-static";

export default function KanaExtensionsPage() {
  redirect("/stations/sound-marks");
}
