import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Return success since we're managing cart state locally
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart API Error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to process cart request' },
      { status: 500 }
    );
  }
}