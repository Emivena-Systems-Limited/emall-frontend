import { useMemo } from 'react'
import { useProductCategoryOptions } from './useCategories'
import { useProducts } from './useProducts'
import {
  buildCategorySelectOptions,
  buildProductSelectOptions,
  flattenCategoryTree,
} from '../utils/promotionFormOptions'

export function usePromotionFormIngredients() {
  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts()

  const {
    parentCategories,
    categoryTree,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useProductCategoryOptions()

  const categoryOptions = useMemo(() => {
    const source = categoryTree.length > 0 ? categoryTree : parentCategories
    return buildCategorySelectOptions(flattenCategoryTree(source))
  }, [categoryTree, parentCategories])

  const productOptions = useMemo(
    () => buildProductSelectOptions(products),
    [products],
  )

  const isLoading = productsLoading || categoriesLoading
  const isError = productsError || categoriesError
  const isReady = !isLoading && !isError

  return {
    products,
    categoryOptions,
    productOptions,
    isLoading,
    isError,
    isReady,
    refetch: () => Promise.all([refetchProducts(), refetchCategories()]),
  }
}
