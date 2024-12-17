import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

type Note = {
  id: string
  title: string
  content: string
}

// In a real app, you'd use a database. For simplicity, we're using an in-memory store.
let notes: Record<string, Note[]> = {}

export async function GET() {
  const user = cookies().get('user')
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }
  return NextResponse.json(notes[user.value] || [])
}

export async function POST(request: Request) {
  const user = cookies().get('user')
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }
  const note = await request.json()
  if (!notes[user.value]) {
    notes[user.value] = []
  }
  notes[user.value].push(note)
  return NextResponse.json(note)
}

export async function PUT(request: Request) {
  const user = cookies().get('user')
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }
  const updatedNote = await request.json()
  notes[user.value] = notes[user.value].map(note => 
    note.id === updatedNote.id ? updatedNote : note
  )
  return NextResponse.json(updatedNote)
}

export async function DELETE(request: Request) {
  const user = cookies().get('user')
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }
  const { id } = await request.json()
  notes[user.value] = notes[user.value].filter(note => note.id !== id)
  return NextResponse.json({ message: 'Note deleted successfully' })
}

