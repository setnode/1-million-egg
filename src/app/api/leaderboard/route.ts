import { NextResponse } from 'next/server';
import { ViemLeaderboardService } from '@/services/leaderboard';

// Force dynamic rendering to suppress Next.js static build warnings.
export const dynamic = "force-dynamic";

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
