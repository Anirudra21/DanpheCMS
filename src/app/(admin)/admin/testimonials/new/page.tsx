import { ModelForm, type FieldConfig } from '../../_components/ModelForm';

const fields: FieldConfig[] = [
  {
    name: 'quote',
    label: 'Quote',
    type: 'textarea',
    placeholder: 'What did they say about us?',
    required: true,
    rows: 3,
  },
  {
    name: 'authorName',
    label: 'Author Name',
    type: 'text',
    placeholder: 'e.g. Dr. Rajesh Sharma',
    required: true,
  },
  {
    name: 'authorOrg',
    label: 'Author Organization',
    type: 'text',
    placeholder: 'e.g. Kathmandu Medical College',
  },
  {
    name: 'imageUrl',
    label: 'Author Photo',
    type: 'image',
    folder: 'testimonials',
  },
  {
    name: 'order',
    label: 'Display Order',
    type: 'number',
    defaultValue: 0,
    min: 0,
    description: 'Lower numbers appear first.',
  },
  {
    name: 'isPublished',
    label: 'Published',
    type: 'checkbox',
    defaultValue: false,
  },
];

export default function NewTestimonialPage() {
  return (
    <ModelForm
      title="Testimonial"
      fields={fields}
      apiBase="/api/testimonials"
      listHref="/admin/testimonials"
    />
  );
}
