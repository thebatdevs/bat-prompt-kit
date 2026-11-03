---
name: generate-stack-aws-policies
description:
  Generate or update one least-privilege IAM permissions policy for one Serverless stack, including mandatory
  CloudFormation and CloudWatch logging access. Requires the stack directory path as input and writes only to that
  stack's aws/iam-policy.json.
---

# Generate one stack AWS policy

Generate exactly one IAM permissions policy for exactly one Serverless stack. The user must provide the stack directory
path, such as `stacks/admin-finance-config`. Resolve relative paths from the repository root.

## Input and scope

- Require one stack path as input. The path must identify a single directory containing `serverless.ts`.
- Reject repository roots, `stacks/`, globs, lists, and requests to process all stacks. Ask for one concrete stack path
  when the input is missing, ambiguous, or resolves to more than one stack.
- Inspect only that stack and the shared modules reachable from its configuration and runtime code. Do not generate or
  update policies for sibling stacks.
- Preserve unrelated changes and follow the repository's `AGENTS.md`, engineering standard, and project profile.

## Analyze the stack

- Inspect the selected stack's `serverless.ts`, registered functions and events, environment bindings, resources, and
  reachable handler → service → repository/integration calls.
- Follow imports into shared configuration, naming helpers, and AWS wrappers only when they are reachable from the
  selected stack. A dependency or unused wrapper does not justify a permission.
- Map each reachable AWS operation to its IAM action and narrowest justified resource. Include configured event-source
  and Lambda VPC execution requirements when applicable.
- Always derive the selected stack's CloudWatch log-group and log-stream ARNs. Logging permissions are mandatory even
  when the application code does not call CloudWatch Logs directly.
- Resolve organization, product, stage, region, function names, table/index names, queues, buckets, parameters, and
  other resources from executable configuration. Do not treat comments, templates, or old policies as authoritative.
- Inspect an existing output policy before replacing it. Preserve justified restrictions and resolve unclear grants
  before removing them.
- Check current official AWS authorization documentation when action, ARN, resource-scoping, or condition semantics are
  uncertain. Use `Resource: "*"` only when AWS does not support narrower resource scoping or the required execution
  permission demands it. Never use action wildcards to hide uncertainty.

Evaluate configuration offline when useful, with safe placeholder bindings. Do not print credentials or complete
environment blocks, inspect local credentials, resolve live secrets/SSM values, contact AWS, deploy, or apply policies.

## Output contract

Write exactly one generated JSON file:

```text
<provided-stack-path>/aws/iam-policy.json
```

- Create the stack-local `aws/` directory when absent.
- The file must be a valid IAM identity permissions policy with version `2012-10-17` and a `Statement` array.
- Combine all justified runtime permissions for the selected stack in this one document, using clear statement `Sid`
  values. Include configured VPC execution permissions when required.
- Always include CloudFormation logging permissions needed to create and manage the selected stack's CloudWatch log
  groups, including retention and tags when configured. Include any required non-resource-scoped discovery action in a
  separate statement with `Resource: "*"`.
- Always include CloudWatch Logs write permissions for the selected stack's functions: `logs:CreateLogGroup`,
  `logs:CreateLogStream`, and `logs:PutLogEvents`. Scope resource-capable actions to the selected stack's log groups and
  streams. Do not grant access to sibling stacks' log groups.
- Use account placeholder `123456789012` when the account is unspecified and `__STAGE__` when no stage is selected. Use
  the verified region. IAM JSON cannot contain Serverless variables or CloudFormation intrinsics; resolve them or
  replace them with these documented placeholders.
- Keep the mandatory CloudFormation logging permissions in this same policy. Do not generate separate trust policies,
  deployment-role policies, logging supplements, READMEs, role resources, attachments, provider IAM changes, or any
  second output file.
- Do not modify an existing policy outside the selected stack's `aws/iam-policy.json`.

## Verify and report

- Parse `aws/iam-policy.json` and verify its version, statement structure, actions, resources, conditions, and
  placeholders against the selected stack's configuration and reachable AWS calls.
- Verify that the policy contains the mandatory CloudFormation log-group management and CloudWatch log-writing grants,
  scoped to the selected stack wherever supported.
- Run the repository formatter or its applicable JSON check and `git diff --check`.
- Report the input stack path, generated policy path, material grants and their evidence, placeholders requiring
  replacement, checks actually run, and unresolved bindings.
- State that local validation is not IAM simulation and that the policy was generated but not applied.

Official references when AWS semantics require verification:

- [Service authorization reference](https://docs.aws.amazon.com/service-authorization/latest/reference/reference_policies_actions-resources-contextkeys.html)
- [CloudWatch Logs authorization](https://docs.aws.amazon.com/service-authorization/latest/reference/list_logs.html)
- [Lambda VPC requirements](https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html)
