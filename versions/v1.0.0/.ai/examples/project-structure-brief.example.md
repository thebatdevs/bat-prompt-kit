# Brief project structure example

This project follows a layered architecture designed to keep business logic isolated, testable, and reusable across
different entry points such as API handlers, scheduled jobs, queue consumers, and scripts.

## Core Architecture

```txt
Entry Layer → Service Layer → Repository Layer
```

Each layer has a clear responsibility:

| Layer            | Responsibility                                                                | Examples                                                   |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Entry Layer      | Accept external input, validate request shape, call services, return response | Lambda handler, Express route, Next.js route, cron handler |
| Service Layer    | Own business logic, workflow orchestration, domain validation, decisions      | create order, approve withdrawal, calculate fee            |
| Repository Layer | Own data access only                                                          | DynamoDB, PostgreSQL, S3, external persistence APIs        |
