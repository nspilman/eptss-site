import { roundProvider } from "@/providers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const slugParam = searchParams.get('slug')
        
        // If slug is provided, use it as the identifier
        if (slugParam) {
            const round = await roundProvider(slugParam)
            return NextResponse.json(round)
        }
        
        // If no slug is provided, get the current round
        const round = await roundProvider()
        return NextResponse.json(round)
        
    } catch (error) {
        console.error('Error fetching round info:', error)
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        )
    }
}