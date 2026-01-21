'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '~/lib/supabase'
import { Twenty6ixButton } from '~/components/ui/Twenty6ixButton'
import { Twenty6ixCard, Twenty6ixCardContent, Twenty6ixCardHeader, Twenty6ixCardTitle } from '~/components/ui/Twenty6ixCard'

export function DatabaseConnectionTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [details, setDetails] = useState<any>(null)

  const testConnection = async () => {
    setStatus('testing')
    setError(null)
    setDetails(null)

    try {
      console.log('🔍 Testing Supabase connection...')
      console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('🔧 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing')
      
      // Test 0: Check if we can reach Supabase at all
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
      }
      
      console.log('🌐 Testing basic connectivity to:', supabaseUrl)
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        }
      })
      
      console.log('🌐 Basic connectivity response:', response.status, response.statusText)
      
      // Test 1: Basic connection with a simple query
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      if (error) {
        console.error('❌ Supabase error details:', error)
        throw error
      }

      console.log('✅ Database connection successful')
      setStatus('success')
      setDetails({ message: 'Database connection successful', data })

    } catch (err: any) {
      console.error('❌ Database connection failed:', err)
      setStatus('error')
      setError(err.message || 'Unknown error')
      setDetails(err)
    }
  }

  // Auto-test on mount
  useEffect(() => {
    testConnection()
  }, [])

  return (
    <Twenty6ixCard className="max-w-md mx-auto mt-4">
      <Twenty6ixCardHeader>
        <Twenty6ixCardTitle className="text-center">Database Status</Twenty6ixCardTitle>
      </Twenty6ixCardHeader>
      <Twenty6ixCardContent className="space-y-4">
        <div className="text-center">
          {status === 'testing' && (
            <div className="text-[#00A3AD]">
              <div className="h-4 w-4 mx-auto mb-2 animate-spin rounded-full border-b-2 border-[#00A3AD]"></div>
              Testing connection...
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-green-400">
              ✅ Database Connected
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-red-400">
              ❌ Database Error
              {error && (
                <div className="text-xs mt-2 text-[#B8C1D0]">
                  {error}
                </div>
              )}
            </div>
          )}
          
          <Twenty6ixButton
            variant="secondary"
            onClick={testConnection}
            disabled={status === 'testing'}
            className="w-full mt-4"
          >
            Test Connection
          </Twenty6ixButton>
          
          {details && (
            <details className="mt-4 text-left">
              <summary className="text-xs text-[#6E7688] cursor-pointer">
                Show Details
              </summary>
              <pre className="text-xs text-[#B8C1D0] mt-2 overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </Twenty6ixCardContent>
    </Twenty6ixCard>
  )
}