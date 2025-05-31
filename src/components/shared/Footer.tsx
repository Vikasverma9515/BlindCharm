// src/components/shared/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-gray-500 hover:text-indigo-600">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-500 hover:text-indigo-600">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-500 hover:text-indigo-600">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/help" className="text-gray-500 hover:text-indigo-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-gray-500 hover:text-indigo-600">
                  Safety Center
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-500 hover:text-indigo-600">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/privacy" className="text-gray-500 hover:text-indigo-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-indigo-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-500 hover:text-indigo-600">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
              Connect
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-indigo-600">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-indigo-600">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-indigo-600">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} BlindCharm. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}