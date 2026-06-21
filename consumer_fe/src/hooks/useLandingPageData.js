import { useQuery } from '@tanstack/react-query'
import { getLandingPageHome } from '../services/landingPageService'

export function useLandingPageData() {
  return useQuery({
    queryKey: ['landing-page-home'],
    queryFn: getLandingPageHome,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
