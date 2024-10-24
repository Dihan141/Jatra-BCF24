import { Link } from 'react-router-dom'
import { useLogout } from '../hooks/useLogout'
import { useAuthContext } from '../hooks/useAuthContext'

const Navbar = () => {
  const { logout } = useLogout()
  const { user } = useAuthContext()

  const handleClick = () => {
    logout()
  }

  return (
    <header>
      <div className="container">
        <Link to="/" className="logo-link" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="https://res.cloudinary.com/djbspykue/image/upload/v1729760463/gegagcimrehfbsjidftq.png"
            alt="Jatra Logo"
            style={{ width: '90px', height: '80px', marginRight: '10px' }} // Adjust size as needed
          />
          <h1 style={{ margin: 0 }}>Jatra</h1>
        </Link>
        <nav>
          {user && (
            <div>
              <span>{user.email}</span>
              <button onClick={handleClick}>Log out</button>
            </div>
          )}
          {!user && (
            <div>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
