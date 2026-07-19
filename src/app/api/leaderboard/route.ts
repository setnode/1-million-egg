import { NextResponse } from 'next/server';
import { ViemLeaderboardService } from '@/services/leaderboard';

// Enable ISR (Incremental Static Regeneration) cache. Revalidate every 10 seconds.
export const revalidate = 10;

const service = new ViemLeaderboardService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || '0';
    const user = searchParams.get('user') || undefined;

    const data = await service.getLeaderboard(season, user);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Leaderboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
