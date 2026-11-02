#!/usr/bin/env python3
"""Calculate documentation quality scores from ten evidence-based ratings."""
import json
import sys
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

WEIGHTS = {
    "Accuracy": 20, "Clarity": 15, "Token Efficiency": 15,
    "Actionability": 15, "Structural Quality": 10, "Context Relevance": 7,
    "Consistency": 5, "Retrievability": 5, "Completeness": 5,
    "Verifiability": 3,
}


def calculate(ratings):
    if not isinstance(ratings, dict) or set(ratings) != set(WEIGHTS):
        raise ValueError("Provide exactly these criteria: " + ", ".join(WEIGHTS))
    rows = []
    for criterion, weight in WEIGHTS.items():
        raw = ratings[criterion]
        if isinstance(raw, bool) or not isinstance(raw, (int, float, Decimal)):
            raise ValueError(f"{criterion}: rating must be a number")
        rating = Decimal(str(raw))
        if not rating.is_finite() or not 0 <= rating <= 10:
            raise ValueError(f"{criterion}: rating must be finite and within 0–10")
        if rating != rating.quantize(Decimal("0.1")):
            raise ValueError(f"{criterion}: at most one decimal place allowed")
        rows.append({"criterion": criterion, "rating": str(rating),
                     "weight": weight, "weighted_score": str(rating * weight / 10)})
    exact = sum(Decimal(row["weighted_score"]) for row in rows)
    displayed = exact.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
    raw_class = next(label for threshold, label in (
        (95, "Exceptional"), (90, "Excellent"), (80, "Good"),
        (70, "Acceptable"), (60, "Weak"), (0, "Poor")
    ) if displayed >= threshold)
    gates = {key: "PASS" if Decimal(str(ratings[key])) >= 9 else "FAIL"
             for key in ("Accuracy", "Actionability")}
    capped = "FAIL" in gates.values() and displayed >= 80
    return {"ratings": rows, "exact_dqs": str(exact), "dqs": str(displayed),
            "raw_classification": raw_class,
            "classification": "Acceptable" if capped else raw_class,
            "gates": gates}


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate criterion: {key}")
        result[key] = value
    return result


if __name__ == "__main__":
    try:
        if len(sys.argv) != 2:
            raise ValueError("Usage: score.py '<JSON object of all ten ratings>'")
        ratings = json.loads(sys.argv[1], parse_float=Decimal,
                             object_pairs_hook=unique_object)
        print(json.dumps(calculate(ratings), indent=2))
    except (ValueError, InvalidOperation) as error:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(2)
