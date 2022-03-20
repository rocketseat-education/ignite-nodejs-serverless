import type { AWS } from '@serverless/typescript';


const serverlessConfiguration: AWS = {
  service: 'ignitecertificate',
  frameworkVersion: '2',
  plugins: [
    'serverless-esbuild',
    'serverless-dynamodb-local',
    'serverless-s3-local',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['dynamodb:*'],
        Resource: ['*'],
      },
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: ['*'],
      },
    ],
  },
  package: { individually: false, include: ['./src/templates/**'] },
  functions: {
    generateCertificate: {
      handler: 'src/functions/generateCertificate.handler',
      events: [
        {
          http: {
            path: 'generateCertificate',
            method: 'post',
            cors: true,
          },
        },
      ],
    },
    verifyCertificate: {
      handler: 'src/functions/verifyCertificate.handler',
      events: [
        {
          http: {
            path: 'verifyCertificate/{id}',
            method: 'get',
            cors: true,
          },
        },
      ],
    },
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      external: ['chrome-aws-lambda'],
    },
    dynamodb: {
      stages: ['dev', 'local'],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
      },
    },
    s3: {
      host: 'localhost',
      directory: './tmp',
    },
  },
  resources: {
    Resources: {
      dbCertificateUsers: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'users_certificate',
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
        },
      },
      bucketCertificates: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: 'certificadoignite2021',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
