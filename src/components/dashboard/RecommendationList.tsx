import { ArrowUpRight } from "lucide-react";
import type { ReviewRecommendation } from "../../types/review";

export function RecommendationList({
  recommendations,
}: {
  recommendations: ReviewRecommendation[];
}) {
  return (
    <section
      className="recommendation-list card"
      aria-labelledby="recommendations-title"
    >
      <div className="dashboard-section__heading">
        <div>
          <p className="eyebrow">NEXT STEPS</p>
          <h3 id="recommendations-title">Recommendations</h3>
        </div>
      </div>
      {recommendations.length > 0 ? (
        <ul>
          {recommendations.map((recommendation) => (
            <li key={recommendation.id}>
              <ArrowUpRight size={16} aria-hidden="true" />
              <span>{recommendation.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-secondary">No recommendations were provided.</p>
      )}
    </section>
  );
}
