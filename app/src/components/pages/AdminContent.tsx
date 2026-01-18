'use client'

import React from 'react'
import { useApp } from '~/contexts/AppContext'
import { AdminDashboard } from '~/components/features/AdminDashboard'
import { AppLayout } from '~/components/layout/AppLayout'

export function AdminContent() {
    const { state } = useApp()

    // Redirect if not authenticated or not admin
    if (!state.user) {
        return (
            <AppLayout currentPage="admin">
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                        <p className="text-muted-foreground">You need to be signed in as an admin to access this page.</p>
                    </div>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout currentPage="admin">
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                    <p className="text-muted-foreground">Manage tasks, pricing, and monitor system performance.</p>
                </div>

                <AdminDashboard user={state.user} />
            </div>
        </AppLayout>
    )
}