
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Plus, Trash2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'

interface Note {
  id: string
  title: string
  content: string
}

export default function NoteTakingApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkLoginStatus()
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotes()
    }
  }, [isLoggedIn])

  const checkLoginStatus = async () => {
    const res = await fetch('/api/auth')
    if (res.ok) {
      const data = await res.json()
      setIsLoggedIn(true)
      setUsername(data.username)
    }
  }

  const fetchNotes = async () => {
    const res = await fetch('/api/notes')
    if (res.ok) {
      const data = await res.json()
      setNotes(data)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, pin: isSignUp ? pin : undefined }),
    })
    const data = await res.json()
    if (res.ok) {
      setIsLoggedIn(true)
      toast({
        title: isSignUp ? 'Sign up successful' : 'Login successful',
        description: data.message,
      })
    } else {
      toast({
        title: 'Error',
        description: data.error,
        variant: 'destructive',
      })
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    setIsLoggedIn(false)
    setNotes([])
    setCurrentNote(null)
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    })
  }

  const createNewNote = async () => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'New Note',
      content: ''
    }
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote),
    })
    if (res.ok) {
      setNotes([...notes, newNote])
      setCurrentNote(newNote)
      toast({
        title: 'Note created',
        description: 'A new note has been created.',
      })
    }
  }

  const updateNote = async (id: string, title: string, content: string) => {
    const updatedNote = { id, title, content }
    const res = await fetch('/api/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedNote),
    })
    if (res.ok) {
      const updatedNotes = notes.map(note =>
        note.id === id ? updatedNote : note
      )
      setNotes(updatedNotes)
      setCurrentNote(updatedNote)
      toast({
        title: 'Note updated',
        description: 'Your note has been successfully updated.',
      })
    }
  }

  const deleteNote = async (id: string) => {
    const res = await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      const filteredNotes = notes.filter(note => note.id !== id)
      setNotes(filteredNotes)
      setCurrentNote(null)
      toast({
        title: 'Note deleted',
        description: 'Your note has been successfully deleted.',
        variant: 'destructive',
      })
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-4 h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">
              {isSignUp ? 'Sign Up' : 'Login'}
            </h1>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isSignUp && (
                <Input
                  type="text"
                  placeholder="Create a PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              )}
              <Button type="submit" className="w-full">
                {isSignUp ? 'Sign Up' : 'Login'}
              </Button>
            </form>
            <p className="mt-4 text-center">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2"
              >
                {isSignUp ? 'Login' : 'Sign Up'}
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col bg-gradient-to-r from-cyan-500 to-blue-500">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Note Taking App</h1>
        <div className="flex items-center space-x-2">
          <span className="text-white">Welcome, {username}!</span>
          <Button onClick={handleLogout} variant="secondary">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
      <div className="flex flex-1 gap-4">
        <Card className="w-1/3 overflow-y-auto">
          <CardContent className="p-4">
            <Button onClick={createNewNote} className="w-full mb-4">
              <Plus className="mr-2 h-4 w-4" /> New Note
            </Button>
            {notes.map(note => (
              <div
                key={note.id}
                className={`p-2 mb-2 rounded cursor-pointer transition-colors duration-200 ${
                  currentNote?.id === note.id ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                }`}
                onClick={() => setCurrentNote(note)}
              >
                <h3 className="font-semibold truncate">{note.title}</h3>
                <p className="text-sm truncate">{note.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="w-2/3">
          <CardContent className="p-4">
            {currentNote ? (
              <div className="space-y-4">
                <Input
                  value={currentNote.title}
                  onChange={e => updateNote(currentNote.id, e.target.value, currentNote.content)}
                  placeholder="Note Title"
                  className="text-lg font-semibold"
                />
                <Textarea
                  value={currentNote.content}
                  onChange={e => updateNote(currentNote.id, currentNote.title, e.target.value)}
                  placeholder="Write your note here..."
                  className="h-[calc(100vh-300px)] resize-none"
                />
                <Button
                  variant="destructive"
                  onClick={() => deleteNote(currentNote.id)}
                  className="mt-4"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Note
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Select a note or create a new one</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}

