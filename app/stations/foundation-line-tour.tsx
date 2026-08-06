import { getFoundationTour, type FoundationTourId } from "@/src/modules/learning/foundation-tours";
import { NavigationLink } from "../navigation-feedback";

export function FoundationLineTour({ tourId }: { readonly tourId: FoundationTourId }) {
  const tour = getFoundationTour(tourId);
  const headingId = `${tourId}-line-tour-title`;

  return (
    <section aria-labelledby={headingId} className="foundation-line-tour">
      <h2 id={headingId}>{tour.heading}</h2>
      <div className="foundation-line-tour-list">
        {tour.stations.map((station) => (
          <section className="foundation-line-tour-stop" key={station.id}>
            <h3>
              <NavigationLink href={station.href} loadingStation={station.name}>
                {station.name}
              </NavigationLink>
            </h3>
            <p>{station.description}</p>
          </section>
        ))}
      </div>
    </section>
  );
}
