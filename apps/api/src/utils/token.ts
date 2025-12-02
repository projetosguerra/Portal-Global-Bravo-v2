import crypto from 'crypto';
const b64 = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');

export function signToken(payload: Record<string, unknown>, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, iat: Math.floor(Date.now() / 1000) };
  const data = `${b64(header)}.${b64(body)}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}