import { NextResponse } from "next/server"
import { cloudinary } from "@/lib/cloudinary"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const profileId = formData.get("profileId") as string

    if (!file || !profileId) {
      return NextResponse.json({ error: "Faltan archivo o profileId" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const folder = `vlink/profiles/${profileId}/services`

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
    return NextResponse.json({ error: error.message || "Error al subir la imagen" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { publicId } = await req.json()
    if (!publicId) {
      return NextResponse.json({ error: "Falta publicId" }, { status: 400 })
    }

    await cloudinary.uploader.destroy(publicId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error eliminando imagen de Cloudinary:", error)
    return NextResponse.json({ error: error.message || "Error al eliminar la imagen" }, { status: 500 })
  }
}
