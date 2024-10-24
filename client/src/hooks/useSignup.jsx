import { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import { useNavigate } from 'react-router-dom';

const uploadPhotoToCloudinary = async (photo) => {
  const formData = new FormData();
  
  formData.append('file', photo);
  formData.append('upload_preset', 'datanalytica'); 

  const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL;

  const response = await fetch(cloudinaryUrl, {
    method: 'POST',
    body: formData
  });

  const json = await response.json();
  console.log(json.secure_url);
  return json.secure_url; 
}

export const useSignup = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false) 
  const { dispatch } = useAuthContext()
  const navigate = useNavigate()

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const signup = async (name, email, password, passwordConfirm, photo) => {
    setIsLoading(true)
    setError(null)
    console.log(backendUrl);
    const createdAt = new Date().toISOString()
    const updatedAt = new Date().toISOString()

    let photoUrl = '../assets/avatar.png';
    if (photo) {
      photoUrl = await uploadPhotoToCloudinary(photo);
      if (!photoUrl) {
        setError("Photo upload failed");
        setIsLoading(false);
        return;
      }
    }
    console.log(backendUrl);
    const response = await fetch(`${backendUrl}/api/users/register`, { 
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        name, 
        email, 
        password, 
        passwordConfirm, 
        photo: photoUrl,
        created_at: createdAt,
        updated_at: updatedAt 
      })
    });

    const json = await response.json()
    console.log(json);

    if (!response.ok) {
      setIsLoading(false)
      setError(json.error || json.detail)
    } else {
      console.log(json)
      setIsLoading(false)
      navigate('/login')
    }
  }

  return { signup, isLoading, error }
}
