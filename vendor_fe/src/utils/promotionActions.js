export function getPromotionActionCopy(action, promotion) {
  const name = `"${promotion.name}"`

  switch (action) {
    case 'pause':
      return {
        title: 'Pause promotion?',
        description: `${name} will stop applying to new orders until you resume it.`,
        confirmLabel: 'Pause promotion',
        tone: 'warning',
      }
    case 'resume':
      return {
        title: 'Resume promotion?',
        description: `${name} will become active again for eligible products within its schedule.`,
        confirmLabel: 'Resume promotion',
        tone: 'success',
      }
    case 'end':
      return {
        title: 'End promotion?',
        description: `${name} will be marked as expired and will no longer apply to new orders.`,
        confirmLabel: 'End promotion',
        tone: 'warning',
      }
    case 'delete':
      return {
        title: 'Delete promotion?',
        description: `${name} will be permanently removed from your promotions list. This action cannot be undone.`,
        confirmLabel: 'Delete promotion',
        tone: 'danger',
      }
    default:
      return null
  }
}

export function canPausePromotion(status) {
  return status === 'active' || status === 'scheduled'
}

export function canResumePromotion(status) {
  return status === 'paused'
}

export function canEndPromotion(status) {
  return status === 'active' || status === 'paused' || status === 'scheduled'
}

export function canEditPromotion(status) {
  return status !== 'cancelled'
}
