export const MESSAGE_STATUS = {
  open: { label: 'Open', tone: 'sky' },
  pending: { label: 'Awaiting reply', tone: 'amber' },
  resolved: { label: 'Resolved', tone: 'emerald' },
  archived: { label: 'Archived', tone: 'slate' },
}

export const MESSAGE_CATEGORIES = {
  all: 'All',
  unread: 'Unread',
  order: 'Orders',
  product: 'Products',
  general: 'General',
  archived: 'Archived',
}

export const MESSAGE_SENDERS = {
  customer: 'customer',
  vendor: 'vendor',
  system: 'system',
}

export const MESSAGES_PAGE_SIZE = 8

export const SORT_FIELDS = {
  updated: 'updated',
  unread: 'unread',
  customer: 'customer',
}

export const SORT_DIRECTIONS = {
  asc: 'asc',
  desc: 'desc',
}
