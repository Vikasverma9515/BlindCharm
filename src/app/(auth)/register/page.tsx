// src/app/(auth)/register/page.tsx
import Link from 'next/link'
import SignUpForm from '@/components/auth/SignUpForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
          Create Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-700">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-red-600 hover:text-red-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 shadow-md sm:rounded-lg sm:px-10 border border-gray-200">
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}