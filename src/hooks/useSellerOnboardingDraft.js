import { useEffect, useMemo, useState } from 'react'
import { readSellerValue, writeSellerValue, removeSellerValue, subscribeSellerStorage, SELLER_STORAGE_KEYS } from '../services/seller/sellerStorage'

const STORAGE_KEY = SELLER_STORAGE_KEYS.profile

const initial = {
  storeName: '', legalName: '', businessType: 'Individual business', governorate: 'Tunis',
  city: '', phone: '', email: '', category: 'Electronics', description: '',
  registrationReference: '', website: '', fulfilment: 'Seller handles delivery',
  acceptsCod: true, acceptsOnlinePayment: false
}

function readDraft() {
  const value = readSellerValue(STORAGE_KEY, null)
  return value && typeof value === 'object' && !Array.isArray(value) ? { ...initial, ...value } : initial
}

export function useSellerOnboardingDraft() {
  const [form, setForm] = useState(readDraft)
  const [savedAt, setSavedAt] = useState(() => {
    const value = readDraft().savedAt
    return value ? new Date(value).toLocaleString() : ''
  })
  const [notice, setNotice] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => subscribeSellerStorage(STORAGE_KEY, () => {
    const next = readDraft()
    setForm(next)
    setSavedAt(next.savedAt ? new Date(next.savedAt).toLocaleString() : '')
  }), [])

  const completion = useMemo(() => {
    const checks = [
      Boolean(form.storeName.trim()), Boolean(form.legalName.trim()),
      Boolean(form.city.trim()), Boolean(form.phone.trim()),
      Boolean(form.email.trim()), Boolean(form.description.trim()),
      Boolean(form.category), Boolean(form.fulfilment)
    ]
    return Math.round(checks.filter(Boolean).length / checks.length * 100)
  }, [form])

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const saveDraft = () => {
    setIsSaving(true)
    try {
      const saved = { ...form, savedAt: new Date().toISOString() }
      if (!writeSellerValue(STORAGE_KEY, saved)) throw new Error('Storage unavailable')
      setForm(saved)
      setSavedAt(new Date(saved.savedAt).toLocaleString())
      setNotice('Your preparation draft is saved on this device. It has not been submitted to MARCHY.')
    } catch {
      setNotice('This browser could not save the draft. Check available storage and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const clearDraft = () => {
    if (typeof window === 'undefined' || !window.confirm('Clear the seller preparation draft saved on this device?')) return
    if (!removeSellerValue(STORAGE_KEY)) {
      setNotice('This browser could not clear the seller draft.')
      return
    }
    setForm(initial)
    setSavedAt('')
    setNotice('Local preparation draft cleared.')
  }

  const readyForReview = Boolean(
    form.storeName.trim() && form.legalName.trim() && form.city.trim() &&
    form.phone.trim() && form.email.trim() && form.description.trim()
  )

  return { form, savedAt, notice, isSaving, completion, readyForReview, update, saveDraft, clearDraft }
}
