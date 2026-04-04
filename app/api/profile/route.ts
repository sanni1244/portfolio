/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

async function getDb() {
  const client = await clientPromise;
  return client.db('portfolioData'); 
}

export async function GET() {
  try {
    const db = await getDb();
    // Switched to 'fs_profile' table to avoid collision with the previous one
    const profile = await db.collection('fs_profile').findOne({ _id: "main_profile" as any });
    
    if (!profile) {
      return NextResponse.json({});
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const profileData = await request.json();
    const db = await getDb();
    
    await db.collection('fs_profile').updateOne(
      { _id: "main_profile" as any },
      { $set: profileData },
      { upsert: true }
    );
    
    return NextResponse.json({ message: 'Profile saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}