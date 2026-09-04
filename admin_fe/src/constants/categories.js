export const CATEGORY_ENDPOINTS = {
  GET_PARENTS: '/api/category/get_parents',
  GET_WITH_CHILDREN: '/api/category/get_with_children',
  CREATE: '/api/category/admin/store',
  update: (id) => `/api/category/admin/update/${encodeURIComponent(id)}`,
  toggleFeatured: (id) => `/api/category/admin/${encodeURIComponent(id)}/toggle_featured`,
  remove: (id) => `/api/category/delete/${encodeURIComponent(id)}`,
}

export const CATEGORY_WRITE_ENABLED = true

export const CATEGORY_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'
export const CATEGORY_IMAGE_MAX_BYTES = 5 * 1024 * 1024

export const CATEGORY_KINDS = [
  {
    key: 'department',
    label: 'Department',
    hint: 'A top-level shop section.',
  },
  {
    key: 'subcategory',
    label: 'Subcategory',
    hint: 'Sits under a department.',
  },
]

export const CATEGORY_VIEWS = [
  { key: 'tree', label: 'Departments' },
  { key: 'parents', label: 'Parents' },
]
