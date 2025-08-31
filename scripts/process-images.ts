import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

interface ImageVariant {
  suffix: string;
  width: number;
  height?: number;
  quality?: number;
}

// Define image variants for different use cases
const IMAGE_VARIANTS: ImageVariant[] = [
  // Thumbnail for cards/previews
  { suffix: '-thumb', width: 400, height: 300, quality: 85 },
  // Mobile optimized version
  { suffix: '-mobile', width: 800, height: 600, quality: 90 },
  // Desktop version (original size but optimized)
  { suffix: '-desktop', width: 1200, quality: 95 }
];

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function processImage(inputPath: string, outputDir: string): Promise<void> {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const extension = path.extname(inputPath).toLowerCase();
  
  // Skip if not an image
  if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(extension)) {
    return;
  }

  // Skip if already processed (has a variant suffix)
  if (IMAGE_VARIANTS.some(variant => filename.includes(variant.suffix))) {
    return;
  }

  console.log(`Processing: ${inputPath}`);

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    await Promise.all(
      IMAGE_VARIANTS.map(async (variant) => {
        const outputFilename = `${filename}${variant.suffix}${extension}`;
        const outputPath = path.join(outputDir, outputFilename);

        let processor = image.clone();

        // Apply resizing
        if (variant.height) {
          // Resize with specific dimensions and cover fit
          processor = processor.resize(variant.width, variant.height, {
            fit: 'cover',
            position: 'center'
          });
        } else {
          // Resize maintaining aspect ratio
          processor = processor.resize(variant.width, null, {
            withoutEnlargement: true
          });
        }

        // Apply quality settings for JPEG
        if (extension === '.jpg' || extension === '.jpeg') {
          processor = processor.jpeg({ quality: variant.quality || 90 });
        } else if (extension === '.png') {
          processor = processor.png({ quality: variant.quality || 90 });
        } else if (extension === '.webp') {
          processor = processor.webp({ quality: variant.quality || 90 });
        }

        await processor.toFile(outputPath);
        console.log(`  → Created: ${outputFilename}`);
      })
    );
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error);
  }
}

async function getGalleryImages(): Promise<string[]> {
  const contentDir = path.join(process.cwd(), 'content', 'galleries');
  const publicDir = path.join(process.cwd(), 'public');
  
  try {
    const files = await fs.readdir(contentDir);
    const galleryFiles = files.filter(file => file.endsWith('.md'));
    
    const allImages: string[] = [];
    
    for (const file of galleryFiles) {
      const filePath = path.join(contentDir, file);
      const fileContents = await fs.readFile(filePath, 'utf8');
      const { data } = matter(fileContents);
      
      if (data.images && Array.isArray(data.images)) {
        for (const image of data.images) {
          if (image.src) {
            // Convert relative path to absolute path
            const absolutePath = path.join(publicDir, image.src);
            allImages.push(absolutePath);
          }
        }
      }
    }
    
    return [...new Set(allImages)]; // Remove duplicates
  } catch (error) {
    console.error('Error reading gallery files:', error);
    return [];
  }
}

async function processAllImages(): Promise<void> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  try {
    // Ensure uploads directory exists
    await ensureDirectoryExists(uploadsDir);

    // Get images referenced in gallery content
    const galleryImages = await getGalleryImages();

    if (galleryImages.length === 0) {
      console.log('No images found in gallery content');
      return;
    }

    console.log(`Found ${galleryImages.length} gallery images to process...`);

    // Process each gallery image
    await Promise.all(
      galleryImages.map(async (imagePath) => {
        try {
          // Check if file exists
          await fs.access(imagePath);
          const dir = path.dirname(imagePath);
          await processImage(imagePath, dir);
        } catch (error) {
          console.warn(`Warning: Image file not found: ${imagePath}`);
        }
      })
    );

    console.log('✅ Gallery image processing complete!');
  } catch (error) {
    console.error('Error during image processing:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  processAllImages();
}

export { processAllImages, processImage, IMAGE_VARIANTS };