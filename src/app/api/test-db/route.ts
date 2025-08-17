import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Test session
    const session = await getServerSession(authOptions)
    
    // Test basic query
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      session: session ? 'authenticated' : 'not authenticated',
      userCount,
      userId: session?.user?.id || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test DB error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}