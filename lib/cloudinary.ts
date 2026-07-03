import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

export function getPublicIdFromUrl(url: string) {
  const parts = url.split("/")
  const versioned = parts[parts.length - 1]
  return versioned.replace(/\.[^.]+$/, "")
}
