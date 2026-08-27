import https from 'node:https';
import axios from 'axios';

export const runtime = 'nodejs';

const ALLOWED_ORIGIN = process.env.AEM_API
  ? new URL(process.env.AEM_API).origin
  : null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response('Missing url parameter', { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return new Response('Invalid url parameter', { status: 400 });
  }

  if (!ALLOWED_ORIGIN || parsedUrl.origin !== ALLOWED_ORIGIN) {
    return new Response('URL not allowed', { status: 403 });
  }

  try {
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      return new Response('File not found', { status: response.status });
    }

    const filename = parsedUrl.pathname.split('/').pop() || 'download.pdf';
    const contentType = String(response.headers['content-type'] ?? 'application/octet-stream');

    return new Response(Buffer.from(response.data), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Download proxy error:', error, { url });
    return new Response('Failed to fetch file', { status: 500 });
  }
}
