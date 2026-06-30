export function canActivateProduct(status) {
  return status !== 'active'
}

export function canDeactivateProduct(status) {
  return status === 'active'
}

export function getProductStatusActionCopy({ product, status, count }) {
  const isActivate = status === 'active'
  const isBulk = typeof count === 'number' && count > 0

  if (isBulk) {
    const plural = count === 1 ? 'product' : 'products'
    return {
      title: isActivate ? `Activate ${count} ${plural}?` : `Deactivate ${count} ${plural}?`,
      description: isActivate
        ? 'These listings will go live in your catalogue and become available for customers to purchase.'
        : 'These listings will be hidden from customers. You can activate them again at any time.',
      confirmLabel: isActivate ? `Activate ${count} ${plural}` : `Deactivate ${count} ${plural}`,
      tone: isActivate ? 'success' : 'warning',
      loadingLabel: isActivate ? 'Activating…' : 'Deactivating…',
    }
  }

  return {
    title: isActivate ? 'Activate product?' : 'Deactivate product?',
    description: isActivate
      ? `"${product.name}" will go live in your catalogue and become available for customers to purchase.`
      : `"${product.name}" will be hidden from your storefront. You can activate it again whenever you're ready.`,
    confirmLabel: isActivate ? 'Activate product' : 'Deactivate product',
    tone: isActivate ? 'success' : 'warning',
    loadingLabel: isActivate ? 'Activating…' : 'Deactivating…',
  }
}
