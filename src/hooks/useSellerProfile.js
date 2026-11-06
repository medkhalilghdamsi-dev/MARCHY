import { useEffect, useState } from 'react'
import { readSellerProfile, subscribeSellerStorage, SELLER_STORAGE_KEYS } from '../services/seller/sellerStorage'

export function useSellerProfile() {
  const [profile, setProfile] = useState(readSellerProfile)

  useEffect(() => subscribeSellerStorage(SELLER_STORAGE_KEYS.profile, () => {
    setProfile(readSellerProfile())
  }), [])

  return profile
}
