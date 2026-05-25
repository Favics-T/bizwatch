import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAnalytics } from '../store/analyticsSlice.js'

export function useEngines(businessType) {
  const dispatch = useDispatch()
  const { data, loading, error, lastUpdated } = useSelector((state) => state.analytics)

  const analyse = useCallback(() => {
    dispatch(fetchAnalytics(businessType))
  }, [dispatch, businessType])

  return { data, loading, error, lastUpdated, analyse }
}
