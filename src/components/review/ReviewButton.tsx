import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "../ui";

type ReviewButtonProps = {
  isLoading: boolean;
};

export function ReviewButton({ isLoading }: ReviewButtonProps) {
  return (
    <Button
      className="review-button"
      type="submit"
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <LoaderCircle
            className="review-button__spinner"
            size={18}
            aria-hidden="true"
          />
          Analyzing...
        </>
      ) : (
        <>
          Review Code
          <ArrowRight size={17} aria-hidden="true" />
        </>
      )}
    </Button>
  );
}
