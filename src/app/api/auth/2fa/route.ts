import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Base32 helpers
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
function toBase32(buffer: Buffer): string {
  let bits = 0
  let value = 0
  let output = ''
  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }
  return output
}

function fromBase32(input: string): Buffer {
  let bits = 0
  let value = 0
  const bytes: number[] = []
  for (const char of input.replace(/=+$/g, '').toUpperCase()) {
    const idx = BASE32_ALPHABET.indexOf(char)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(bytes)
}

function hotp(secretBase32: string, counter: number, digits = 6): string {
  const secret = fromBase32(secretBase32)
  const counterBuffer = Buffer.alloc(8)
  counterBuffer.writeBigUInt64BE(BigInt(counter))
  const hmac = crypto.createHmac('sha1', secret).update(counterBuffer).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const code = ((hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits).toString()
  return code.padStart(digits, '0')
}

function totp(secretBase32: string, timeStep = 30, digits = 6, skew = 1): boolean {
  const counter = Math.floor(Date.now() / 1000 / timeStep)
  const code = (global as any).totpCode
  if (!code) return false
  for (let i = -skew; i <= skew; i++) {
    if (hotp(secretBase32, counter + i, digits) === code) return true
  }
  return false
}

function generateSecret(): string {
  const random = crypto.randomBytes(20)
  return toBase32(random)
}

function generateRecoveryCodes(n = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < n; i++) {
    codes.push(crypto.randomBytes(5).toString('hex'))
  }
  return codes
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json().catch(() => ({}))

    if (action === 'init') {
      const secret = generateSecret()
      const account = encodeURIComponent(session.user.email || '')
      const issuer = encodeURIComponent('TeamFlow')
      const otpauthUrl = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`

      const recoveryCodes = generateRecoveryCodes()
      await prisma.user.update({ where: { id: session.user.id }, data: { twoFactorSecret: secret, twoFactorEnabled: false, recoveryCodes } })
      return NextResponse.json({ secret, otpauthUrl, recoveryCodes })
    }

    if (action === 'verify') {
      const { code } = body as { code?: string }
      if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user?.twoFactorSecret) return NextResponse.json({ error: '2FA not initialized' }, { status: 400 })

      ;(global as any).totpCode = String(code)
      const ok = totp(user.twoFactorSecret)
      ;(global as any).totpCode = undefined
      if (!ok) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

      await prisma.user.update({ where: { id: session.user.id }, data: { twoFactorEnabled: true } })
      return NextResponse.json({ success: true })
    }

    if (action === 'disable') {
      await prisma.user.update({ where: { id: session.user.id }, data: { twoFactorEnabled: false, twoFactorSecret: null, recoveryCodes: [] } as any })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    console.error('2FA error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { twoFactorEnabled: true } })
    return NextResponse.json({ twoFactorEnabled: !!user?.twoFactorEnabled })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


