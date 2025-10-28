import Link from 'next/link'

export default function Login() {
  return (
    <div>
      <Link href="/register">Don’t have an account? Register here</Link>
      <br />
      <Link href="/forgot-password">Forgot your password?</Link>
    </div>
  )
}