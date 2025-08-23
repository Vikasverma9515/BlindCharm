// "use client"

// import { Trash2 } from "lucide-react"
// import { useRouter } from "next/navigation"
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// import { Button } from "@/components/ui/button"

// export default function DeleteAccountButton() {
//   const supabase = createClientComponentClient()
//   const router = useRouter()

//   const handleDelete = async () => {
//     const confirmed = confirm(
//       "Are you sure you want to delete your account? This action cannot be undone."
//     )
//     if (!confirmed) return

//     try {
//       // Call our API route to delete user
//       const res = await fetch("/api/delete-account", {
//         method: "DELETE",
//       })

//       if (res.ok) {
//         alert("Account deleted successfully.")
//         router.push("/") // redirect to home/landing
//       } else {
//         const { error } = await res.json()
//         alert("Error deleting account: " + error)
//       }
//     } catch (err) {
//       console.error(err)
//       alert("Unexpected error deleting account.")
//     }
//   }

//   return (
//     <Button variant="destructive" onClick={handleDelete}>
//       <Trash2 className="w-5 h-5 mr-2" />
//       Delete Account
//     </Button>
//   )
// }


"use client"

import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/blocks/Components/alert-dialog/alert-dialog"


export default function DeleteAccountButton() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleDelete = async () => {
    try {
      const res = await fetch("/api/delete-account", {
        method: "DELETE",
      })

      if (res.ok) {
        // Show a success message, then redirect
        alert("Account deleted successfully.")
        router.push("/") 
      } else {
        const { error } = await res.json()
        alert("Error deleting account: " + error)
      }
    } catch (err) {
      console.error(err)
      alert("Unexpected error deleting account.")
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="w-5 h-5 mr-2" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Yes, delete my account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
