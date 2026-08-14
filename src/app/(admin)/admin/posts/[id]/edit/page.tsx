import React from 'react';
import { ModelForm, type FieldConfig } from '../../../_components/ModelForm';

const fields: FieldConfig[] = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'e.g. Danphe Health Launches New Module',
    required: true,
  },
  {
    name: 'slug',
    label: 'Slug',
    type: 'slug',
    slugFrom: 'title',
  },
  {
    name: 'author',
    label: 'Author',
    type: 'text',
    placeholder: 'e.g. John Doe',
  },
  {
    name: 'coverImageUrl',
    label: 'Cover Image',
    type: 'image',
    folder: 'posts',
  },
  {
    name: 'excerpt',
    label: 'Excerpt',
    type: 'textarea',
    rows: 3,
    placeholder: 'A brief summary of the post…',
  },
  {
    name: 'body',
    label: 'Body',
    type: 'richtext',
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { label: 'News & Events', value: 'NEWS_EVENT' },
      { label: 'Community', value: 'COMMUNITY' },
    ],
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    defaultValue: 'DRAFT',
    options: [
      { label: 'Draft', value: 'DRAFT' },
      { label: 'Published', value: 'PUBLISHED' },
    ],
  },
  {
    name: 'publishedAt',
    label: 'Published Date',
    type: 'text',
    placeholder: 'YYYY-MM-DD',
    description: 'YYYY-MM-DD format',
    validate: (value: unknown) => {
      if (value && typeof value === 'string' && value.trim()) {
        const parsed = Date.parse(value.trim());
        if (isNaN(parsed)) return 'Invalid date format';
      }
      return undefined;
    },
  },
];

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  return (
    <ModelForm
      title="Post"
      fields={fields}
      apiBase="/api/posts"
      listHref="/admin/posts"
      id={unwrappedParams.id}
    />
  );
}
