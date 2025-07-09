"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

export default function TestFirebasePage() {
  const [status, setStatus] = useState<string>("Testing...")
  const [authStatus, setAuthStatus] = useState<string>("Checking auth...")
  const [firestoreStatus, setFirestoreStatus] = useState<string>("Checking Firestore...")

  useEffect(() => {
    // Test Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthStatus(`✅ Auth working - User: ${user.email}`)
      } else {
        setAuthStatus("✅ Auth working - No user signed in")
      }
    })

    // Test Firestore connection
    const testFirestore = async () => {
      try {
        // Try to read from a collection (this will fail if rules are too restrictive)
        const testCollection = collection(db, 'test')
        await getDocs(testCollection)
        setFirestoreStatus("✅ Firestore connection working")
      } catch (error: any) {
        setFirestoreStatus(`❌ Firestore error: ${error.message}`)
      }
    }

    testFirestore()

    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Firebase Connection Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Firebase Authentication</h2>
            <p className="text-sm">{authStatus}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Firestore Database</h2>
            <p className="text-sm">{firestoreStatus}</p>
          </div>

          <div className="pt-4 border-t">
            <h2 className="text-lg font-semibold mb-2">Firebase Config</h2>
            <div className="text-sm space-y-1">
              <p><strong>Project ID:</strong> college-application-7a4e7</p>
              <p><strong>Auth Domain:</strong> college-application-7a4e7.firebaseapp.com</p>
            </div>
          </div>

          <div className="pt-4">
            <a 
              href="/" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-4"
            >
              Back to Home
            </a>
            <a 
              href="/debug" 
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Debug Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
