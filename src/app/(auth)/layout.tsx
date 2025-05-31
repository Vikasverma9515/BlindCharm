// // src/app/(auth)/layout.tsx
// export default function AuthLayout({
//     children,
//   }: {
//     children: React.ReactNode
//   }) {
//     return (
//       <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
//         <div className="sm:mx-auto sm:w-full sm:max-w-md">
//           {children}
//         </div>
//       </div>
//     )
//   }

// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}