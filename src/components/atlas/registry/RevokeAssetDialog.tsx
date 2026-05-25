'use client';

import { useState } from "react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { RegistryAsset } from "@/types/atlas"

interface RevokeAssetDialogProps {
  open: boolean
  asset: RegistryAsset | null
  onClose: () => void
  onRevoked: (id: string) => void
}

export default function RevokeAssetDialog({ open, asset, onClose, onRevoked }: RevokeAssetDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRevoke = async () => {
    if (!asset) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/atlas/registry/assets/${asset.id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Failed to revoke asset")
      onRevoked(asset.id)
      onClose()
    } catch (err: any) {
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={v => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke Asset</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="py-2 text-sm text-gray-500">
          Are you sure you want to revoke this asset?
          <div className="mt-2 font-mono text-xs text-gray-400">{asset?.id}</div>
        </div>
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRevoke} disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading ? "Revoking..." : "Revoke"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
