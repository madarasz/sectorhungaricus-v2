import { getAllContent } from '@/lib/markdown'
import { GalleryContent } from '@/types/content'
import Link from 'next/link'

export default async function GalleryPage() {
  const galleries = await getAllContent('galleries') as GalleryContent[]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Gallery</h1>

      {galleries.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries.map((gallery, index: number) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {gallery.data.images?.[0] && (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Cover: {gallery.data.images[0].src}</span>
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{gallery.data.title}</h2>
                {gallery.data.description && (
                  <p className="text-gray-600 mb-4">{gallery.data.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {gallery.data.images?.length || 0} photos
                  </span>
                  <Link
                    href={`/gallery/${gallery.slug}`}
                    className="text-red-600 hover:text-red-700 font-semibold"
                  >
                    View Gallery →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600">No galleries available yet.</p>
          <p className="text-gray-500 mt-2">Check back soon for tournament photos!</p>
        </div>
      )}
    </div>
  )
}