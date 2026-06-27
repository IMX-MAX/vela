import { NextResponse } from 'next/server';
import { chatStepAction } from '@/app/actions';

export async function GET() {
  try {
    await chatStepAction([{ role: 'user', content: 'test' }], 'dummy');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.stack || err.toString() });
  }
}
