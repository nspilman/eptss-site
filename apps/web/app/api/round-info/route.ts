import { roundProvider, COVER_PROJECT_ID, CachePatterns, getCacheHeaders } from "@eptss/core";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const slugParam = searchParams.get('slug')

        // If slug is provided, use it as the identifier
        if (slugParam) {
            const round = await roundProvider({ slug: slugParam, projectId: COVER_PROJECT_ID })
            return NextResponse.json(round, {
                headers: getCacheHeaders(CachePatterns.roundPhase),
            })
        }

        // If no slug is provided, get the current round
        const round = await roundProvider({ projectId: COVER_PROJECT_ID })
        return NextResponse.json(round, {
            headers: getCacheHeaders(CachePatterns.roundPhase),
        })

    } catch (error) {
        console.error('Error fetching round info:', error)
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        )
    }
}