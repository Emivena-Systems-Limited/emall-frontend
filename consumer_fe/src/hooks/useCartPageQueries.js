import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { CART_RECOMMENDATIONS_QUERY_KEY, CART_SUMMARY_QUERY_KEY } from '../constants/cart'
import { selectCartItems } from '../store/slices/cartSlice'
import { getCartRecommendations, getCartSummary } from '../services/cartService'

export function useCartPageQueries() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const items = useSelector(selectCartItems)
  const hasItems = items.length > 0

  const summaryQuery = useQuery({
    queryKey: CART_SUMMARY_QUERY_KEY,
    queryFn: getCartSummary,
    enabled: isAuthenticated && hasItems,
    staleTime: 30_000,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const recommendationsQuery = useQuery({
    queryKey: CART_RECOMMENDATIONS_QUERY_KEY,
    queryFn: getCartRecommendations,
    enabled: hasItems,
    staleTime: 60_000,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  return { summaryQuery, recommendationsQuery }
}
