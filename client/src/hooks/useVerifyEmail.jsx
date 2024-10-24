// hooks/useVerifyEmail.js

import { useState } from 'react'

export const useVerifyEmail = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(null)


  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  const verifyEmail = async (token) => {
    setIsLoading(true)
    setError(null)

    const response = await fetch(`${backendUrl}/api/verifyemail/${token}`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    })
    
    if (!response.ok) {
      const json = await response.json()
      setError(json.error)
      setIsLoading(false)
    }
    
    if (response.ok) {
      const json = await response.json()
      // Handle success (e.g., navigate to login page, show success message, etc.)
      console.log('Email verified successfully:', json)
      setIsLoading(false)
    }
  }

  return { verifyEmail, isLoading, error }
}
