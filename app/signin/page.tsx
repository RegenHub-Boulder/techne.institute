import { Suspense } from 'react'
import SignInForm from './_components/SignInForm'

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
