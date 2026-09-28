import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'

const components = {
  a({ href = '', children }) {
    if (href.startsWith('/')) return <Link to={href}>{children}</Link>
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  },
  img({ src, alt }) {
    return <img src={src} alt={alt || ''} loading="lazy" />
  },
  table({ children }) {
    return <div className="article-table"><table>{children}</table></div>
  },
}

// Story text is stored as simple Markdown (plain text with a few easy conventions).
// react-markdown never runs raw HTML, so the text can't inject anything into the page.
export default function ArticleBody({ text }) {
  return (
    <div className="article">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{text || ''}</ReactMarkdown>
    </div>
  )
}
