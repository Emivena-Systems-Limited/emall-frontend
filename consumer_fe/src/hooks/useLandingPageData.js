import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLandingPageHome } from '../services/landingPageService'
import { readLandingPageCache, writeLandingPageCache } from '../utils/landingPageCache'

export function useLandingPageData() {
  const query = useQuery({
    queryKey: ['landing-page-home'],
    queryFn: getLandingPageHome,
    initialData: readLandingPageCache,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (query.data) {
      writeLandingPageCache(query.data)
    }
  }, [query.data])

  return query
}
