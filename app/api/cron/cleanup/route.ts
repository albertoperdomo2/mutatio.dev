import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// this endpoint is called by Vercel cron once a day to clean up temporary data
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (
    !cronSecret || // if CRON_SECRET is not set, disable this endpoint
    !authHeader || 
    !authHeader.startsWith('Bearer ') || 
    authHeader.substring(7) !== cronSecret
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    
    const { count: deletedSessionsCount } = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: now
        }
      }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: deletedResponsesCount } = await prisma.mutationResponse.deleteMany({
      where: {
        savedMutationVersionId: null,
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      deletedSessionsCount,
      deletedResponsesCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in cleanup cron:', error);
    return NextResponse.json({ 
      error: 'Internal server error during cleanup',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}