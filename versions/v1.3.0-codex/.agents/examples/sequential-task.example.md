# Example: repair incomplete process documentation

Illustration only: names, findings, and results below are not claims about this repository or executed checks.

## Feature and item boundaries

Requested outcome: create an order using a verified payment method. Agree the request/response contract and persistence
invariant first. T1 owns the repository operation; T2 owns service orchestration and depends on T1; T3 owns transport
registration and depends on T2. The final gate traces request → service → persistence → response.

T2's implementation fetches the payment method, rejects absence, validates amount/currency, validates metadata, persists
the order, and returns its public result. It has catch/log/rethrow behavior per the business-service rule.

## Initial review

Its JSDoc says only:

```text
Process flow:
1. Fetches the payment method.
2. Creates the order.
3. Returns the result.
```

Finding F1: the process flow omits missing-method rejection, amount/currency checks, and metadata validation. Applicable
throwing conditions must also be documented. Three steps alone are not the defect; the omission of meaningful behavior
is.

## Focused repair

Update the comment to match the actual code, for example:

```text
Process flow:
1. Fetches the payment method and rejects an unknown method.
2. Validates the amount and currency against the method's limits.
3. Validates metadata against the selected method's requirements.
4. Persists the order using the agreed conditional-write contract.
5. Returns the public order result.
```

Add accurate parameter, return, and failure descriptions under the standard. Do not invent a conditional write if the
implementation has none: that would require a separate behavioral finding and repair where the contract requires it.

Record repair attempt 1, review the behavior and comment again, check relevant unchanged/changed contracts, and record
actual existing command results. T2 passes only with evidence; then T3 may begin. If required checks cannot run, T2
remains blocked from passage even if the documentation repair is complete.
