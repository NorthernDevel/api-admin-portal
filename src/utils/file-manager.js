const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const path = require('path')
const { dirname } = require('path')
// ROOT PATH
const rootDirectory = dirname(require.main.filename)
const fs = require('fs-extra')

// Upload Image
const uploadImage = async (files, siteId, directory, id) => {
  if (files.image != null) {
    const pathName = `public/images/${siteId}/${directory}`

    const objectId = new ObjectId()
    const imageName = objectId.toString()

    const fileExtention = files.image.originalFilename.split('.')[1]
    const newImageName = `${imageName}.${fileExtention}`
    const newpath = path.resolve(rootDirectory, pathName, newImageName)
    if (await fs.exists(newpath)) {
      await fs.remove(newpath)
    }
    await fs.moveSync(files.image.filepath, newpath)

    // NOTE: Update product image.
    return { id, imageName }
  }
}

const createPrefixDirectory = (prefixDirectory) => {
  const pathName = `${rootDirectory}/public/images/${prefixDirectory}`
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

module.exports = {
  uploadImage,
  createPrefixDirectory,
}
