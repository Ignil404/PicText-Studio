import { useNavigate } from 'react-router-dom'
import { TemplateGallery } from '../components/TemplateGallery'

export function HomePage() {
  const navigate = useNavigate()

  return <TemplateGallery onSelect={(id) => navigate(`/editor/${id}`)} />
}
