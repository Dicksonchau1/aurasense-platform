'use client';

import React, {  useState  } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { z } from "zod"
import { RegistryAsset, RegistryAssetInput } from "@/types/atlas"
import { assetInputSchema } from "@/lib/atlas/registry-store"

interface EditAssetSheetProps {
  open: boolean
  asset: RegistryAsset | null
  onClose: () => void
  onEdited: (asset: RegistryAsset) => void
}

export default function EditAssetSheet({ open, asset, onClose, onEdited }: EditAssetSheetProps) {
  const [form, setForm] = useState<RegistryAssetInput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Populate form when asset changes
  React.useEffect(() => {
    if (asset) {
      setForm({
        name: asset.name,
        class: asset.class,
        status: asset.status,
        location: asset.location,
        notes: asset.notes || ""
      })
    }
  }, [asset])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!form) return
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    const parsed = assetInputSchema.safeParse(form)
    if (!parsed.success) {
      setError("Invalid input. Please check all fields.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/atlas/registry/assets/${asset?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error("Failed to update asset")
      const updated = await res.json()
      onEdited(updated)
      onClose()
    } catch (err: any) {
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Asset</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <input name="name" value={form?.name || ""} onChange={handleChange} placeholder="Name" className="input" required />
          <input name="class" value={form?.class || ""} onChange={handleChange} placeholder="Class" className="input" required />
          <input name="status" value={form?.status || ""} onChange={handleChange} placeholder="Status" className="input" required />
          <input name="location" value={form?.location || ""} onChange={handleChange} placeholder="Location" className="input" required />
          <textarea name="notes" value={form?.notes || ""} onChange={handleChange} placeholder="Notes" className="input" />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
