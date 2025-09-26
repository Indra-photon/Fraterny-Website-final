import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { uploadImage } from '@/services/images';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import TextEditor from '@/components/blog/TextEditor';
import { BlogFormValues } from '../types';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

const CATEGORIES = [
  'News',
  'Announcement',
  'Guide',
  'Review',
  'Feature',
  'Interview',
  'Case Study'
];

// type BlogFormProps = {
//   editingId: string | null;
//   formValues: {
//     title: string;
//     content: string;
//     category: string;
//     tags: string[];
//     published: boolean;
//     image_key?: string | null;
//   };
//   setFormValues: (values: BlogFormValues | ((prev: BlogFormValues) => BlogFormValues)) => void;
//   setEditingId: (id: string | null) => void;
//   onSuccess: () => void;
// };

type BlogFormProps = {
  editingId: string | null;
  formValues: BlogFormValues;
  setFormValues: (values: BlogFormValues | ((prev: BlogFormValues) => BlogFormValues)) => void;
  setEditingId: (id: string | null) => void;
  onSuccess: () => void;
};


const BlogForm = ({ editingId, formValues, setFormValues, setEditingId, onSuccess }: BlogFormProps) => {
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  //   const { name, value, type } = e.target;
  //   const checked = 'checked' in e.target ? e.target.checked : undefined;
  //   setFormValues(prev => ({
  //     ...prev,
  //     [name]: type === 'checkbox' ? checked : value
  //   }));
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value, type } = e.target;
  const checked = 'checked' in e.target ? e.target.checked : undefined;
  
  setFormValues(prev => {
    const newValues = {
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    };
    
    // Auto-generate slug when title changes (only if slug is empty)
    if (name === 'title' && !prev.slug) {
      newValues.slug = generateSlug(value);
    }
    
    return newValues;
  });
};


  const handleAddTag = () => {
    if (tagInput && !formValues.tags.includes(tagInput)) {
      setFormValues(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormValues(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setUploadingImage(true);
      const imageKey = `blog-${editingId || Date.now()}`;
      const result = await uploadImage(
        file,
        imageKey,
        `Image for blog: ${formValues.title}`,
        formValues.title || 'Blog image',
        'Blog'
      );

      if (result) {
        setFormValues(prev => ({
          ...prev,
          image_key: imageKey
        }));
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleRemoveImage = () => {
    setFormValues(prev => ({
      ...prev,
      image_key: null
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: formValues.title,
            content: formValues.content,
            category: formValues.category || null,
            tags: formValues.tags.length > 0 ? formValues.tags : null,
            published: formValues.published,
            image_key: formValues.image_key,
            updated_at: new Date().toISOString(),
            meta_description: formValues.meta_description || null,
            slug: formValues.slug || null,
            seo_title: formValues.seo_title || null,
            excerpt: formValues.excerpt || null,
            featured_image_alt: formValues.featured_image_alt || null,
            social_image_key: formValues.social_image_key || null,
            reading_time: formValues.reading_time || null,
            meta_keywords: formValues.meta_keywords.length > 0 ? formValues.meta_keywords : null,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Blog post updated successfully');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            title: formValues.title,
            content: formValues.content,
            category: formValues.category || null,
            tags: formValues.tags.length > 0 ? formValues.tags : null,
            published: formValues.published,
            image_key: formValues.image_key,
            meta_description: formValues.meta_description || null,
            slug: formValues.slug || null,
            seo_title: formValues.seo_title || null,
            excerpt: formValues.excerpt || null,
            featured_image_alt: formValues.featured_image_alt || null,
            social_image_key: formValues.social_image_key || null,
            reading_time: formValues.reading_time || null,
            meta_keywords: formValues.meta_keywords.length > 0 ? formValues.meta_keywords : null,
          });

        if (error) throw error;
        toast.success('Blog post created successfully');
      }

      setFormValues({ 
        title: '', 
        content: '', 
        category: '', 
        tags: [], 
        published: true, 
        image_key: null,
        meta_description: '',
        meta_keywords: [],
        slug: '',
        seo_title: '',
        excerpt: '',
        featured_image_alt: '',
        social_image_key: null,
        reading_time: 0,
      });
      setEditingId(null);
      onSuccess();
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error('Failed to save blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-medium text-navy">
          {editingId ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formValues.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Featured Image
          </label>
          
          {formValues.image_key ? (
            <div className="mb-4">
              <div className="relative w-full max-w-md aspect-video mb-2 rounded overflow-hidden bg-gray-100">
                <ResponsiveImage
                  dynamicKey={formValues.image_key}
                  alt={formValues.title || "Blog featured image"}
                  className="w-full h-full object-cover"
                  sizes="medium"
                  // src=""
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-500">Change image</p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-1 text-sm text-gray-500">Upload a featured image for your blog post</p>
            </div>
          )}
          
          <div className="mt-2">
            <label className="inline-flex items-center px-4 py-2 bg-navy text-white rounded-md hover:bg-opacity-90 transition-colors cursor-pointer">
              <Upload size={16} className="mr-2" />
              {uploadingImage ? 'Uploading...' : 'Upload Image'}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formValues.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex items-center">
            <input
              type="text"
              id="tagInput"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
              placeholder="Add a tag and press Enter or Add"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="ml-2 px-4 py-2 bg-navy text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              Add
            </button>
          </div>
          {formValues.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formValues.tags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-terracotta bg-opacity-20 text-terracotta"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-terracotta hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <TextEditor
            content={formValues.content}
            onChange={(value) => setFormValues(prev => ({ ...prev, content: value }))}
          />
          <p className="text-sm text-gray-500 mt-1">
            Use the formatting tools above to style your content
          </p>
        </div>

        {/* SEO Section */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
          
          <div className="space-y-4">
            {/* Meta Description */}
            <div>
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                value={formValues.meta_description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
                rows={3}
                maxLength={160}
                placeholder="Brief description for search engines (150-160 characters)"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formValues.meta_description.length}/160 characters
              </p>
            </div>

            {/* Meta Keywords */}
            <div>
              <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Keywords
              </label>
              <input
                type="text"
                id="meta_keywords"
                value={formValues.meta_keywords.join(', ')}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only split and filter when user is not actively typing (on blur or when they finish typing)
                  setFormValues(prev => ({ 
                    ...prev, 
                    meta_keywords: value ? value.split(',').map(k => k.trim()) : []
                  }));
                }}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate keywords with commas
              </p>
            </div>

            {/* SEO Title */}
            <div>
              <label htmlFor="seo_title" className="block text-sm font-medium text-gray-700 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                id="seo_title"
                name="seo_title"
                value={formValues.seo_title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
                placeholder="Custom title for search engines (leave empty to use post title)"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formValues.slug}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
                placeholder="url-friendly-slug (auto-generated from title if empty)"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formValues.excerpt}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
                rows={2}
                placeholder="Short summary for blog previews"
              />
            </div>

            {/* Featured Image Alt Text */}
            <div>
              <label htmlFor="featured_image_alt" className="block text-sm font-medium text-gray-700 mb-1">
                Featured Image Alt Text
              </label>
              <input
                type="text"
                id="featured_image_alt"
                name="featured_image_alt"
                value={formValues.featured_image_alt}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
                placeholder="Describe the featured image for accessibility"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="published"
            name="published"
            checked={formValues.published}
            onChange={handleChange}
            className="h-4 w-4 text-navy focus:ring-navy border-gray-300 rounded"
          />
          <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
            Publish immediately
          </label>
        </div>

        <div className="flex items-center justify-end space-x-4">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormValues({ title: '', content: '', category: '', tags: [], published: true, image_key: null, meta_description: '', meta_keywords: [], slug: '', seo_title: '', excerpt: '', featured_image_alt: '', social_image_key: null, reading_time: 0 });
                setEditingId(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-navy text-white rounded-md hover:bg-opacity-90 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (editingId ? 'Update Post' : 'Create Post')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
