import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

type User = {
  username: string
  pin: string
}

let users: User[] = []

export async function POST(request: Request) {
  const { username, password, pin } = await request.json()

  if (pin) {
    // Sign up
    if (users.some(user => user.username === username)) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }
    users.push({ username, pin })
    cookies().set('user', username)
    return NextResponse.json({ message: 'User created successfully' })
  } else {
    // Log in
    const user = users.find(user => user.username === username)
    if (user) {
      cookies().set('user', username)
      return NextResponse.json({ message: 'Logged in successfully' })
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
}

export async function GET() {
  const user = cookies().get('user')
  if (user) {
    return NextResponse.json({ username: user.value })
  }
  return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
}

export async function DELETE() {
  cookies().delete('user')
  return NextResponse.json({ message: 'Logged out successfully' })
}

