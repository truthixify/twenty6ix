'use client'

import React from 'react'
import { useApp } from '@/contexts/AppContext'
import { AdminDashboard } from '@/components/features/AdminDashboard'
import { AppLayout } from '@/components/layout/AppLayout'

export function AdminContent() {
    const { state } = useApp()

    return (
        <AppLayout currentPage="admin">
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                    <p className="text-muted-foreground">Manage tasks, pricing, and monitor system performance.</p>
                </div>

                <AdminDashboard user={state.user!} />
            </div>
        </AppLayout>
    )
}