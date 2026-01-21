'use client'

import React, { useEffect, useState } from 'react'
import { Twenty6ixCard, Twenty6ixCardContent } from './Twenty6ixCard'
import { Check, Zap, X } from 'lucide-react'
import { cn } from '~/lib/utils'

interface ToastProps {
    message: string
    type?: 'success' | 'error' | 'info'
    duration?: number
    onClose?: () => void
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(() => onClose?.(), 300) // Wait for animation
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    const handleClose = () => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300)
    }

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <Check className="h-4 w-4 text-[#00A3AD]" />
            case 'error':
                return <X className="h-4 w-4 text-red-400" />
            default:
                return <Zap className="h-4 w-4 text-[#A100FF]" />
        }
    }

    return (
        <div className={cn(
            'fixed top-4 right-4 z-50 transition-all duration-300',
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        )}>
            <Twenty6ixCard className="min-w-[300px] max-w-[400px]">
                <Twenty6ixCardContent className="p-4">
                    <div className="flex items-center gap-3">
                        {getIcon()}
                        <span className="text-white text-sm flex-1">{message}</span>
                        <button
                            onClick={handleClose}
                            className="text-[#B8C1D0] hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </Twenty6ixCardContent>
            </Twenty6ixCard>
        </div>
    )
}

// Toast Manager Hook
export function useToast() {
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([])

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = Date.now().toString()
        setToasts(prev => [...prev, { id, message, type }])
    }

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }

    const ToastContainer = () => (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    )

    return { showToast, ToastContainer }
}