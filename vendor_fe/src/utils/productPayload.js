export function metadataRowsToObject(rows) {
  return rows.reduce((metadata, row) => {
    const key = row.key?.trim()
    const value = row.value?.trim()
    if (key && value) metadata[key] = value
    return metadata
  }, {})
}

export function buildProductPayload(values) {
  return {
    category_slug: values.category_slug,
    subcategory_slug: values.subcategory_slug,
    brand_slug: values.brand_slug,
    name: values.name.trim(),
    sku: values.sku.trim(),
    description: values.description.trim(),
    status: values.status,
    price: Number(values.price),
    quantity: Number(values.quantity),
    metadata: metadataRowsToObject(values.metadata),
    product_images: values.image_urls
      .filter((url) => url.trim())
      .map((imageUrl) => ({ image_url: imageUrl.trim() })),
    videos: values.videos
      .filter((video) => video.video_url?.trim())
      .map((video) => ({
        title: video.title.trim(),
        video_url: video.video_url.trim(),
      })),
  }
}
