import { S3Client } from "@aws-sdk/client-s3";

import {
  S3_REGION,
  S3_ENDPOINT,
  S3_ACCESS_KEY,
  S3_ACCESS_SECRET,
} from "$env/static/private";

const s3 = new S3Client({
  forcePathStyle: true,
  region: S3_REGION,
  endpoint: S3_ENDPOINT + "/s3",
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_ACCESS_SECRET,
  },
});

export default s3;
