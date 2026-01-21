'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function InformationPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to main app - the navigation will handle showing the information
        router.replace('/')
    }, [router])

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-b-2 border-primary"></div>
                <p>Redirecting to information...</p>
            </div>
        </div>
    )
}