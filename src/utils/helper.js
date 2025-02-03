import formidable from 'formidable'

const subSchema = (fields, isArray = false) => ({
  type: isArray ? [fields] : fields,
  _id: false,
})

const getFormData = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true,
      keepExtensions: true,
      filter: (part) => {
        // ตรวจสอบขนาดไฟล์ไม่เกิน 1MB
        if (part.fileSize > 1 * 1024 * 1024) {
          return false // ไม่รับไฟล์ที่ใหญ่กว่า 1MB
        }

        return true
      },
    })
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      } else {
        resolve({ fields, files })
      }
    })
  })
}

export { subSchema, getFormData }
