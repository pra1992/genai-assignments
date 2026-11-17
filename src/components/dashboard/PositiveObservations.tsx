import { Check } from "lucide-react";
import type { PositiveObservation } from "../../types/review";

export function PositiveObservations({
  observations,
}: {
  observations: PositiveObservation[];
}) {
  return (
    <section
      className="positive-observations card"
      aria-labelledby="positive-title"
    >
      <div className="dashboard-section__heading">
        <div>
          <p className="eyebrow">WHAT'S WORKING</p>
          <h3 id="positive-title">Positive observations</h3>
        </div>
      </div>
      {observations.length > 0 ? (
        <ul>
          {observations.map((observation) => (
            <li key={observation.id}>
              <Check size={16} aria-hidden="true" />
              <span>{observation.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-secondary">No positive observations were provided.</p>
      )}
    </section>
  );
}
