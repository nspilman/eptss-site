import { roundProvider } from "@/providers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const roundIdParam = searchParams.get('roundId')
        
        let roundId: number | undefined;
        if (roundIdParam) {
            const parsed = parseInt(roundIdParam, 10)
            if (isNaN(parsed)) {
                return NextResponse.json(
                    { error: 'Invalid roundId parameter' },
                    { status: 400 }
                )
            }
            roundId = parsed
        }
        
        const round = await roundProvider(roundId)
        return NextResponse.json(round)
        
    } catch (error) {
        console.error('Error fetching round info:', error)
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        )
    }
}