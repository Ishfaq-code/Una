import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <main>
      <h1>Welcome to UnaMono</h1>
      <p>This is the public landing page.</p>
      <Link to="/auth">
        <button type="button">Login</button>
      </Link>
    </main>
  )
}

export default LandingPage
