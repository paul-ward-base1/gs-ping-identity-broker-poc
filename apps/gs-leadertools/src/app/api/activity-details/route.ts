import { NextResponse } from 'next/server';
import { fetchAemData } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const path = searchParams.get('path');
  const context = searchParams.get('context'); // 'activityDetails' or 'activityPreview'

  if (!path || !context) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const rawPath = `${context};path=${path}`;
  const encodedPath = encodeURIComponent(rawPath);

  try {
    const {
      data: {
        activities: { items },
      },
    } = await fetchAemData(encodedPath);

    return NextResponse.json(items[0]);
  } catch (error: unknown) {
    console.error('AEM fetch error:', error, { path: encodedPath });
    return NextResponse.json({ error: 'Failed to fetch activity details' }, { status: 500 });
  }
}
