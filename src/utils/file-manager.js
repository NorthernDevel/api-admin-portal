import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadDir = path.join(__dirname, '../../public', 'images')

// Upload Image
const uploadImage = async (file, siteId, directory) => {
  const pathName = `${siteId}/${directory}`
  const fileExtention = path.extname(file.originalFilename)
  const newImageName = `${uuidv4()}${fileExtention}`
  const newPath = path.resolve(uploadDir, pathName, newImageName)

  if (await fs.exists(newPath)) {
    await fs.remove(newPath)
  }

  await fs.moveSync(file.filepath, newPath)

  return { newImageName }
}

const deleteImage = async (imageName, siteId, directory) => {
  const pathName = `${siteId}/${directory}`
  const deletePath = path.resolve(uploadDir, pathName, imageName)

  if (await fs.pathExists(deletePath)) {
    await fs.remove(deletePath)
  }
}

const createPrefixDirectory = (prefixDirectory) => {
  const pathName = `${uploadDir}/${prefixDirectory}`
  if (!fs.existsSync(pathName)) {
    // NOTE: Main dir.
    fs.mkdirSync(pathName)
    // NOTE: app-icons dir.
    if (!fs.existsSync(`${pathName}/app-icons`))
      fs.mkdirSync(`${pathName}/app-icons`)
    // NOTE: banners dir.
    if (!fs.existsSync(`${pathName}/banners`))
      fs.mkdirSync(`${pathName}/banners`)
    // NOTE: icons dir.
    if (!fs.existsSync(`${pathName}/icons`)) fs.mkdirSync(`${pathName}/icons`)
    // NOTE: logos dir.
    if (!fs.existsSync(`${pathName}/logos`)) fs.mkdirSync(`${pathName}/logos`)
    // NOTE: popups dir.
    if (!fs.existsSync(`${pathName}/popups`)) fs.mkdirSync(`${pathName}/popups`)
    // NOTE: promotions dir.
    if (!fs.existsSync(`${pathName}/promotions`))
      fs.mkdirSync(`${pathName}/promotions`)
  }
}

export { uploadImage, deleteImage, createPrefixDirectory }
