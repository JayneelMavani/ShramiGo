import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Header({ title, showBack = false }: { title: string; showBack?: boolean }) {
  const navigate = useNavigate()
  return <header className="app-header">
    {showBack && <button className="icon-button" aria-label="Go back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>}
    <h1>{title}</h1>
  </header>
}
