import { NextRequest, NextResponse } from 'next/server';
import { processingStore } from './generate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const processingId = searchParams.get('processingId');

    if (!processingId) {
      return NextResponse.json(
        { error: 'processingId is required' },
        { status: 400 }
      );
    }

    const session = processingStore.get(processingId);

    if (!session) {
      return NextResponse.json(
        { error: 'Processing session not found' },
        { status: 404 }
      );
    }

    // Simulate progress based on elapsed time
    const elapsed = Date.now() - session.startTime;
    const totalDuration = 10000; // 10 seconds total

    if (elapsed < totalDuration) {
      // Scanning phase (0-3 seconds)
      if (elapsed < 3000) {
        session.progress.scanning = Math.min(100, (elapsed / 3000) * 100);
        session.stage = 'scanning';
      }
      // Enriching phase (3-7 seconds)
      else if (elapsed < 7000) {
        session.progress.scanning = 100;
        session.progress.enriching = Math.min(100, ((elapsed - 3000) / 4000) * 100);
        session.stage = 'enriching';
      }
      // Verifying phase (7-10 seconds)
      else {
        session.progress.scanning = 100;
        session.progress.enriching = 100;
        session.progress.verifying = Math.min(100, ((elapsed - 7000) / 3000) * 100);
        session.stage = 'verifying';
      }
    } else {
      session.progress = { scanning: 100, enriching: 100, verifying: 100 };
      session.stage = 'complete';
    }

    return NextResponse.json({
      processingId,
      stage: session.stage,
      progress: session.progress,
      logs: session.logs,
      formData: session.formData,
      status: session.stage === 'complete' ? 'complete' : 'processing',
    });
  } catch (error) {
    console.error('Error in /api/leads/status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
