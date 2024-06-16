// In this file we will write the function to handle S3 requests

import { config } from "dotenv";
import {S3} from "aws-sdk"

config();
const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    endpoint: process.env.S3_ENDPOINT
})

export async function copyS3Folder(sourcePrefix: string, destinationPrefix: string, continuationToken?: string):Promise<void>{
  try {
    const listParams={
        Bucket:process.env.BUCKET as string,
        Prefix: sourcePrefix,
        ContinuationToken: continuationToken
    }
    const listedObject=await s3.listObjectsV2(listParams).promise();
    if (!listedObject.Contents || listedObject.Contents.length === 0) return;   
    await Promise.all(listedObject.Contents.map(async (object)=>{
      if(!object.Key)return;
      let destinationKey=object.Key.replace(sourcePrefix, destinationPrefix);
      let copyParams = {
        Bucket: process.env.S3_BUCKET ?? "",
        CopySource: `${process.env.S3_BUCKET}/${object.Key}`,
        Key: destinationKey
    };
       await s3.copyObject(copyParams).promise();
       console.log(`Copied ${object.Key} to ${destinationKey}`);

    }))

    if (listedObject.IsTruncated) {
        listParams.ContinuationToken = listedObject.NextContinuationToken;
        await copyS3Folder(sourcePrefix, destinationPrefix, continuationToken);
    }

  } catch (error) {
    console.error("Error Copying Folder",error);

  }
}


export const saveToS3 = async (key: string, filePath: string, content: string): Promise<void> => {
    const params = {
        Bucket: process.env.S3_BUCKET ?? "",
        Key: `${key}${filePath}`,
        Body: content
    }

    await s3.putObject(params).promise()
}

