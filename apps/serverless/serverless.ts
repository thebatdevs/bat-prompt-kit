import type { AWS } from '@serverless/typescript';
import 'dotenv/config';
import env from './env';
import { APIS_EXAMPLE } from './src/functions/api/example';

const serverlessConfig: AWS = {
  service: 'bat-peasant-serverless-example',
  frameworkVersion: '4',
  plugins: ['serverless-offline', 'serverless-prune-plugin'],
  provider: {
    name: 'aws',
    stage: "${opt:stage, 'dev'}",
    runtime: 'nodejs24.x',
    region: env.AWS_REGION as AWS['provider']['region'],
    ...(env.AWS_PROFILE ? { profile: env.AWS_PROFILE } : {}),
    timeout: 29,
    memorySize: 512,
    architecture: 'arm64',
    deploymentBucket: { blockPublicAccess: true },
    logRetentionInDays: 14,
    environment: { EXAMPLE_TABLE_NAME: '${self:service}-${sls:stage}-example-table' },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:DescribeTable',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:Query',
              'dynamodb:UpdateItem',
            ],
            Resource: [
              { 'Fn::GetAtt': ['ExampleTable', 'Arn'] },
              { 'Fn::Join': ['/', [{ 'Fn::GetAtt': ['ExampleTable', 'Arn'] }, 'index/*']] },
            ],
          },
        ],
      },
    },
  },
  functions: { ...APIS_EXAMPLE },
  package: { individually: true, patterns: ['!.env*', '!test/**', '!dist/**'] },
  build: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      target: 'node24',
      // Include the SDK versions declared by this app rather than relying on Lambda's copy.
      exclude: [],
    },
  },
  custom: {
    prune: { automatic: true, number: 2 },
    'serverless-offline': { host: '127.0.0.1', httpPort: 3003, lambdaPort: 3004 },
  },
  resources: {
    Resources: {
      ExampleTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:service}-${sls:stage}-example-table',
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'status', AttributeType: 'S' },
            { AttributeName: 'createdAt', AttributeType: 'S' },
          ],
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'status-createdAt-index',
              KeySchema: [
                { AttributeName: 'status', KeyType: 'HASH' },
                { AttributeName: 'createdAt', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
            },
          ],
        },
      },
    },
  },
};

export default serverlessConfig;
