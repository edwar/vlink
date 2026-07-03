"use client"

import { useState, useRef } from "react"
import { ImagePlus, X, Loader2, GripVertical } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { sileo } from "sileo"
import { addServiceImage, removeServiceImage, reorderServiceImages } from "@/app/actions/services"

interface ServiceImage {
  id: string
  url: string
  order: number
}

interface ServiceImageUploaderProps {
  serviceId: string
  images: ServiceImage[]
  profileId: string
  onImagesChange: (images: ServiceImage[]) => void
}

export function ServiceImageUploader({ serviceId, images, profileId, onImagesChange }: ServiceImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    const uploaded: ServiceImage[] = []

    try {
      for (const file of files) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          sileo.error({ title: "Formato no válido", description: `${file.name}: solo JPG, PNG o WebP.` })
          continue
        }
        if (file.size > 5 * 1024 * 1024) {
          sileo.error({ title: "Imagen muy grande", description: `${file.name}: debe pesar menos de 5 MB.` })
          continue
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("profileId", profileId)

        const res = await fetch("/api/upload/service-image", { method: "POST", body: formData })
        if (!res.ok) throw new Error((await res.json()).error || "Error al subir")

        const data = await res.json()
        const result = await addServiceImage(serviceId, data.url)

        if (result.success && result.image) {
          uploaded.push(result.image)
        }
      }

      if (uploaded.length > 0) {
        onImagesChange([...images, ...uploaded])
      }
    } catch (err: any) {
      sileo.error({ title: "Error al subir", description: err.message })
    } finally {
      setUploading(false)
    }

    if (inputRef.current) inputRef.current.value = ""
  }

  const handleRemove = async (imageId: string) => {
    setRemoving(imageId)
    try {
      await removeServiceImage(imageId)
      onImagesChange(images.filter((img) => img.id !== imageId))
    } catch (err: any) {
      sileo.error({ title: "Error al eliminar", description: err.message })
    } finally {
      setRemoving(null)
    }
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const next = [...images]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    const reordered = next.map((img, i) => ({ ...img, order: i }))
    onImagesChange(reordered)
    reorderServiceImages(serviceId, reordered.map((img) => img.id)).catch(() => {})
  }

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return
    const next = [...images]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    const reordered = next.map((img, i) => ({ ...img, order: i }))
    onImagesChange(reordered)
    reorderServiceImages(serviceId, reordered.map((img) => img.id)).catch(() => {})
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((img, index) => (
          <div key={img.id} className="group relative h-20 w-20 shrink-0 rounded-xl border border-border/40 overflow-hidden">
            <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
              {index > 0 && (
                <button type="button" onClick={() => handleMoveUp(index)} className="h-6 w-6 rounded-full bg-white/80 text-foreground flex items-center justify-center hover:bg-white transition-colors text-xs font-black">
                  {"<"}
                </button>
              )}
              {index < images.length - 1 && (
                <button type="button" onClick={() => handleMoveDown(index)} className="h-6 w-6 rounded-full bg-white/80 text-foreground flex items-center justify-center hover:bg-white transition-colors text-xs font-black">
                  {">"}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleRemove(img.id)}
              disabled={removing === img.id}
              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/80 transition-all"
            >
              {removing === img.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "h-20 w-20 shrink-0 rounded-xl border-2 border-dashed border-border flex items-center justify-center transition-all hover:border-primary/30",
            uploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <ImagePlus className="h-6 w-6 text-muted-foreground" />}
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground font-medium">
        JPG, PNG o WebP. Máx 5 MB c/u. Pasa el mouse sobre las imágenes para reordenar o eliminar.
      </p>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
