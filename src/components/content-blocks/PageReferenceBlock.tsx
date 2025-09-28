'use client'

import { ContentBlock } from '@/types/content'
import { loadComponent } from '@/lib/componentRegistry'
import { ComponentType, useEffect, useState } from 'react'

interface PageReferenceBlockProps {
  block: ContentBlock & { type: 'page_reference_block' }
}

export default function PageReferenceBlock({ block }: PageReferenceBlockProps) {
  const { page_reference, block_title, hide_title } = block
  const [PageComponent, setPageComponent] = useState<ComponentType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!page_reference) {
      setError('No component path provided')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    loadComponent(page_reference)
      .then((component) => {
        if (component) {
          setPageComponent(() => component)
        } else {
          setError(`Component not found: ${page_reference}`)
        }
      })
      .catch((err) => {
        console.error('Error loading component:', err)
        setError(`Failed to load component: ${page_reference}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [page_reference])

  if (loading) {
    return (
      <div className="page-reference-block">
        {!hide_title && block_title && (
          <h2 className="text-xl lg:text-2xl font-bold mb-4">{block_title}</h2>
        )}
        <div className="p-4 border border-gray-300 bg-gray-50 text-gray-600 rounded animate-pulse">
          <p>Loading component: {page_reference}</p>
        </div>
      </div>
    )
  }

  if (error || !PageComponent) {
    return (
      <div className="page-reference-block">
        {!hide_title && block_title && (
          <h2 className="text-xl lg:text-2xl font-bold mb-4">{block_title}</h2>
        )}
        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded">
          <p className="font-medium">Error: {error}</p>
          <p className="text-sm mt-1">
            Ensure the component exists at: <code className="bg-red-100 px-1 rounded">src/components/{page_reference}</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-reference-block">
      {!hide_title && block_title && (
        <h2 className="text-xl lg:text-2xl font-bold mb-4">{block_title}</h2>
      )}
      <div className="referenced-page-content">
        <PageComponent />
      </div>
    </div>
  )
}