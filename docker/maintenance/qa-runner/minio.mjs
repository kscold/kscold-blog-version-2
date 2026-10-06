import { promises as fs } from 'node:fs';
import { extname } from 'node:path';
import { isSessionId } from './ids.mjs';

const CONTENT_TYPES = { '.png': 'image/png', '.json': 'application/json; charset=utf-8' };

/** 보관소를 쓰지 않을 때의 대역. 부르는 쪽이 켜짐 여부를 따지지 않아도 되게 한다. */
export const NO_MIRROR = {
  enabled: false,
  label: 'local',
  async upload() {},
  async remove() {},
};

/**
 * 실행 결과를 MinIO에도 한 벌 올려, 어드민의 스토리지 화면에서 볼 수 있게 한다.
 * 접속 정보가 없는 환경에서도 러너가 뜨도록 SDK는 보관을 켤 때만 불러온다.
 */
export async function createMinioMirror(settings, loadSdk = () => import('@aws-sdk/client-s3')) {
  if (!settings) return NO_MIRROR;
  const sdk = await loadSdk();
  const client = new sdk.S3Client({
    endpoint: settings.endpoint,
    region: settings.region,
    forcePathStyle: true,
    credentials: { accessKeyId: settings.accessKeyId, secretAccessKey: settings.secretAccessKey },
  });
  const keyOf = (sessionId, relativePath = '') =>
    [settings.prefix, sessionId, relativePath].filter(Boolean).join('/');

  async function upload(sessionId, files) {
    for (const file of files) {
      await client.send(
        new sdk.PutObjectCommand({
          Bucket: settings.bucket,
          Key: keyOf(sessionId, file.relativePath),
          Body: await fs.readFile(file.path),
          ContentType: CONTENT_TYPES[extname(file.path)] || 'application/octet-stream',
        })
      );
    }
  }

  /** 세션 하나의 보관분만 지운다. 접두어가 세션 폴더로 끝나도록 ID 모양을 다시 확인한다. */
  async function remove(sessionId) {
    if (!isSessionId(sessionId)) throw new Error('세션 ID가 올바르지 않습니다.');
    let token;
    do {
      const page = await client.send(
        new sdk.ListObjectsV2Command({
          Bucket: settings.bucket,
          Prefix: `${keyOf(sessionId)}/`,
          ContinuationToken: token,
        })
      );
      const objects = (page.Contents || [])
        .filter(item => item.Key)
        .map(item => ({ Key: item.Key }));
      if (objects.length) {
        await client.send(
          new sdk.DeleteObjectsCommand({
            Bucket: settings.bucket,
            Delete: { Objects: objects, Quiet: true },
          })
        );
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
  }

  return { enabled: true, label: `minio(${settings.bucket}/${settings.prefix})`, upload, remove };
}
