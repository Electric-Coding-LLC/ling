import { FirstVisitWelcome } from "./first-visit-welcome";
import { NetworkMap } from "./network-map";

export const dynamic = "force-static";

export default function Home() {
  return (
    <main className="shell">
      <FirstVisitWelcome />
      <NetworkMap />
    </main>
  );
}
