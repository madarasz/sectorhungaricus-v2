import { ComponentType } from 'react'

interface ComponentInfo {
  component: ComponentType
  path: string
}

const componentCache = new Map<string, ComponentInfo>()

export function validateComponentPath(path: string): boolean {
  // Only allow alphanumeric characters, forward slashes, underscores, and hyphens
  if (!/^[a-zA-Z0-9/_-]+$/.test(path)) {
    return false
  }

  // Prevent directory traversal
  if (path.includes('..') || path.startsWith('/') || path.includes('//')) {
    return false
  }

  // Must not be empty
  if (!path.trim()) {
    return false
  }

  return true
}

export function normalizeComponentPath(path: string): string {
  // Remove .tsx extension if provided
  path = path.replace(/\.tsx$/, '')

  // Ensure it starts with components/
  if (!path.startsWith('components/')) {
    path = `components/${path}`
  }

  return path
}

export async function loadComponent(path: string): Promise<ComponentType | null> {
  // Validate path first
  if (!validateComponentPath(path)) {
    console.error(`Invalid component path: ${path}`)
    return null
  }

  const normalizedPath = normalizeComponentPath(path)

  // Check cache first
  if (componentCache.has(normalizedPath)) {
    return componentCache.get(normalizedPath)!.component
  }

  try {
    // Dynamic import with proper path resolution
    const moduleImport = await import(`../components/${path.replace(/^components\//, '')}`)
    const component = moduleImport.default as ComponentType

    if (!component) {
      console.error(`Component at ${path} does not have a default export`)
      return null
    }

    // Cache the component
    componentCache.set(normalizedPath, {
      component,
      path: normalizedPath
    })

    return component
  } catch (error) {
    console.error(`Failed to load component at ${path}:`, error)
    return null
  }
}

export function clearComponentCache(): void {
  componentCache.clear()
}

// Development helper to list available components
export function getAvailableComponents(): string[] {
  return Array.from(componentCache.keys())
}