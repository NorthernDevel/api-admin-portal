const subSchema = (fields, isArray = false) => ({
  type: isArray ? [fields] : fields,
  _id: false,
})

module.exports = {
  subSchema,
}
