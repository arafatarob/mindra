import { NextRequest, NextResponse } from 'next/server';

// Store processing sessions in memory (in production, use a database)
const processingStore = new Map<
  string,
  {
    processingId: string;
    formData: any;
    stage: 'scanning' | 'enriching' | 'verifying' | 'complete';
    progress: { scanning: number; enriching: number; verifying: number };
    logs: Array<{ msg: string; time: string }>;
    startTime: number;
  }
>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, location, companySize, volume } = body;

    // Validate input
    if (!industry || !location || !companySize || !volume) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a processing ID
    const processingId = `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Initialize processing session
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const session = {
      processingId,
      formData: { industry, location, companySize, volume },
      stage: 'scanning' as const,
      progress: { scanning: 0, enriching: 0, verifying: 0 },
      logs: [
        {
          msg: `Starting search for ${industry} companies in ${location}`,
          time: timeStr,
        },
      ],
      startTime: Date.now(),
    };

    processingStore.set(processingId, session);

    // Cleanup after 5 minutes
    setTimeout(() => {
      processingStore.delete(processingId);
    }, 5 * 60 * 1000);

    return NextResponse.json({
      processingId,
      status: 'started',
      message: 'Lead generation started',
    });
  } catch (error) {
    console.error('Error in /api/leads/generate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export for testing/simulation
export { processingStore };
