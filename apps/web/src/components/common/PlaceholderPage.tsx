import { PageContainer } from './PageContainer'

export function PlaceholderPage({ title }: { title: string }) {
  return <PageContainer><div className="placeholder-page"><p className="eyebrow">ShramiGo</p><h2>{title}</h2><p>This screen is ready for its reference-based implementation.</p></div></PageContainer>
}
