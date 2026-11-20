# Monorepo package `s3`

- **Import:** `@motforex-monorepo-packages/aws-s3`
- **Version:** 1.0.0
- **Source:**
  [packages/s3](/Users/thedashpuntsag/Documents/Repositories/motforex/serverless/stock-finance-sls-monorepo/packages/s3)
- **Entry:** `src/index.ts` re-exports `src/s3-client.ts`.
- **Verified snapshot:** 2026-11-21; see [package index](./monorepo.index.md).

## Functions

| Function                  | Input                                    | Output                               | Behavior                                                                                                               |
| ------------------------- | ---------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `getS3Client`             | None                                     | `S3Client`                           | Exported lazy singleton accessor; uses `getAwsRegion()` from `libs`.                                                   |
| `getS3FileUploadAccess`   | `S3UploadSignedUrlRequest`               | `Promise<S3SignedUrlResponse>`       | Presigns PUT with content type and optional metadata; defaults to 600 seconds.                                         |
| `getS3FileDownloadAccess` | `S3DownloadSignedUrlRequest`             | `Promise<S3SignedUrlResponse>`       | Presigns GET; defaults to 1800 seconds.                                                                                |
| `getS3ObjectHead`         | `bucketName: string`, `filePath: string` | `Promise<S3ObjectHead \| undefined>` | Sends HEAD; returns content type/length or undefined for `NotFound`/`NoSuchKey`. Other errors are logged and rethrown. |

## Contracts and reuse details

- Request/response types come from [schemas](./monorepo.schemas.md). Upload requires `bucketName`, `filePath`,
  `contentType`; optional fields are `metadata: Record<string, string>` and `expiresIn` in seconds. Download requires
  bucket/path with optional expiry.
- Both signing helpers return `{ filePath, signedUrl }`. They create access URLs; they do not transfer files or validate
  requests through the exported Zod schemas themselves.
- Upload signs the `content-type` header. The actual PUT must use the requested content type.
- `S3ObjectHead` is `{ contentType: string | undefined; contentLength: number | undefined }` and is exported from this
  package.
- Region defaults to `ap-southeast-1` when `AWS_REGION` is absent. Errors in the signing helpers go through
  `logErrorMessage`, which rethrows.
