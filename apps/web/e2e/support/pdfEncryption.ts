import { createHash } from 'node:crypto';

const PASSWORD_PADDING = Buffer.from(
  '28bf4e5e4e758a4164004e56fffa01082e2e00b6d0683e802f0ca9fe6453697a',
  'hex'
);
const DOCUMENT_ID = Buffer.from('a41f0e9be3aa12f685c10ef2a037aff1', 'hex');

function digest(value: Buffer) {
  return createHash('md5').update(value).digest();
}

function padPassword(value: string) {
  return Buffer.concat([Buffer.from(value, 'latin1').subarray(0, 32), PASSWORD_PADDING]).subarray(0, 32);
}

function encryptRc4(value: Buffer, key: Buffer): Buffer {
  const state = Array.from({ length: 256 }, (_, index) => index);
  let swap = 0;
  for (let index = 0; index < 256; index += 1) {
    swap = (swap + state[index] + key[index % key.length]) % 256;
    [state[index], state[swap]] = [state[swap], state[index]];
  }
  const result = Buffer.alloc(value.length);
  let left = 0;
  let right = 0;
  for (let index = 0; index < value.length; index += 1) {
    left = (left + 1) % 256;
    right = (right + state[left]) % 256;
    [state[left], state[right]] = [state[right], state[left]];
    result[index] = value[index] ^ state[(state[left] + state[right]) % 256];
  }
  return result;
}

/** 암호 입력 UI 검증에만 사용하는 구형 PDF 표준 암호화이며 서비스용 암호화가 아니다. */
export function createPdfEncryption(password: string) {
  const paddedPassword = padPassword(password);
  const owner = encryptRc4(paddedPassword, digest(paddedPassword).subarray(0, 5));
  const permissions = Buffer.alloc(4);
  permissions.writeInt32LE(-4);
  const key = digest(Buffer.concat([paddedPassword, owner, permissions, DOCUMENT_ID])).subarray(0, 5);
  const user = encryptRc4(PASSWORD_PADDING, key);
  const dictionary = `<< /Filter /Standard /V 1 /R 2 /Length 40 /O <${owner.toString('hex')}> /U <${user.toString('hex')}> /P -4 >>`;
  return {
    dictionary,
    trailerId: `/ID [<${DOCUMENT_ID.toString('hex')}> <${DOCUMENT_ID.toString('hex')}>]`,
    encryptStream(stream: string, objectNumber: number) {
      const reference = Buffer.alloc(5);
      reference.writeUIntLE(objectNumber, 0, 3);
      const objectKey = digest(Buffer.concat([key, reference])).subarray(0, 10);
      return encryptRc4(Buffer.from(stream, 'latin1'), objectKey).toString('latin1');
    },
  };
}
