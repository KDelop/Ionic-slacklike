import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk';

export const S3_MEDIA_BUCKET = {
  BUCKET: 'kiss-uploads.sokt.io',
  BUCKET_BASE_URL: 'https://kiss-uploads.sokt.io',
  ACCESS_KEY: 'AKIAT5PXQ23PSBQEB3P3',
  SECRET_KEY: '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'
};


AWS.config.update({
  accessKeyId: S3_MEDIA_BUCKET.ACCESS_KEY,
  secretAccessKey: S3_MEDIA_BUCKET.SECRET_KEY,
  region: 'ap-south-1'
});
@Injectable()
export class UploadFileService {
  constructor() {
    //
  }

  public uploadfile(obj: any): Promise<any> {
    const params = {
      Bucket: S3_MEDIA_BUCKET.BUCKET,
      Key: obj.key,
      Body: obj.content,
      ContentType: obj.file.type,
      ACL: 'public-read'
    };
    // return bucket.upload(params);
    const bucket = new AWS.S3.ManagedUpload({ params });
    return new Promise((resolve, reject) => {
      bucket.send((err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(data);
          resolve(data);
        }
      });
    });
  }
}
