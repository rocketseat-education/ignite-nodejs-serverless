import AWS, { S3 } from 'aws-sdk';

const options: S3.ClientConfiguration = {
  s3ForcePathStyle: true,
  accessKeyId: 'S3RVER', // This specific key is required when working offline
  secretAccessKey: 'S3RVER',
  endpoint: new AWS.Endpoint('http://localhost:4569'),
};

const isOffline = () => {
  return process.env.IS_OFFLINE;
};

export const s3 = isOffline() ? new S3(options) : new S3();