import { ModelForm, type FieldConfig } from '../../../_components/ModelForm';

const fields: FieldConfig[] = [
  {
    name: 'quote',
    label: 'Quote',
    type: 'textarea',
    placeholder: 'e.g. Danphe has transformed our hospital operations…',
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
    label: 'Organization',
    type: 'text',
    placeholder: 'e.g. Apollo Hospitals',
  },
  {
    name: 'imageUrl',
    label: 'Author Photo',
    type: 'image',
    folder: 'testimonials',
    description: 'Circular photo shown beside the testimonial.',
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

export default function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ModelForm
      title="Testimonial"
      fields={fields}
      apiBase="/api/testimonials"
      listHref="/admin/testimonials"
      id={params.then(p => p.id)}
    />
  );
}
