import { useState } from "react"
import { useSignup } from "../hooks/useSignup"

const Signup = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [photo, setPhoto] = useState(null) // Use null for file input
  const { signup, error, isLoading } = useSignup()


  const handleSubmit = async (e) => {
    e.preventDefault()

    // Call the signup function with the necessary parameters
    await signup(username, email, password, passwordConfirm, photo)
  }

  return (
    <form className="signup" onSubmit={handleSubmit}>
      <h3>Sign Up</h3>
      
      <label>Username:</label>
      <input 
        type="text" 
        onChange={(e) => setUsername(e.target.value)} 
        value={username} 
      />
      <label>Email address:</label>
      <input 
        type="email" 
        onChange={(e) => setEmail(e.target.value)} 
        value={email} 
      />
      <label>Password:</label>
      <input 
        type="password" 
        onChange={(e) => setPassword(e.target.value)} 
        value={password} 
      />
      <label>Confirm Password:</label>
      <input 
        type="password" 
        onChange={(e) => setPasswordConfirm(e.target.value)} 
        value={passwordConfirm} 
      />
      <label>Photo:</label>
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => setPhoto(e.target.files[0])} 
      />

      <button disabled={isLoading}>Sign up</button>
      {error && <div className="error">{error}</div>}
    </form>
  )
}

export default Signup
