import { NextResponse } from "next/server"
import { cloudinary } from "@/lib/cloudinary"
import { getEffectiveProfile } from "@/lib/permissions"

const MAX_FILE_BYTES = 5 * 1024 * 1024

async function getProfileOrNull() {
  try {
    return await getEffectiveProfile()
  } catch {
    return null
  }
}

function profileFolder(profileId: string) {
  return `vlink/profiles/${profileId}/services`
}

export async function POST(req: Request) {
  try {
    const profile = await getProfileOrNull()
    if (!profile) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta el archivo" }, { status: 400 })
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "La imagen supera 5 MB" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    // La carpeta se deriva del perfil autorizado, nunca del cliente
    const folder = profileFolder(profile.id)

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      stream.end(buffer)
    })

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id })
  } catch (error: any) {
    console.error("Error subiendo imagen a Cloudinary:", error)
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const profile = await getProfileOrNull()
    if (!profile) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { publicId } = await req.json()
    if (typeof publicId !== "string" || !publicId) {
      return NextResponse.json({ error: "Falta publicId" }, { status: 400 })
    }

    // Solo se pueden borrar imágenes dentro de la carpeta del propio perfil
    if (!publicId.startsWith(`${profileFolder(profile.id)}/`) || publicId.includes("..")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    await cloudinary.uploader.destroy(publicId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error eliminando imagen de Cloudinary:", error)
    return NextResponse.json({ error: "Error al eliminar la imagen" }, { status: 500 })
  }
}
