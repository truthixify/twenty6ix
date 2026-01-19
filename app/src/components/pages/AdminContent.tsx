'use client'

import React from 'react'
import { useApp } from '~/contexts/AppContext'
import { AdminDashboard } from '~/components/features/AdminDashboard'

export function AdminContent() {
    const { state } = useApp()

    // Redirect if not authenticated or not admin
    if (!state.user) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2 text-white">Access Denied</h2>
                    <p className="text-[#B8C1D0]">You need to be signed in as an admin to access this page.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-[#B8C1D0]">Manage tasks, pricing, and monitor system performance.</p>
            </div>

            <AdminDashboard user={state.user} />
        </div>
    )
}