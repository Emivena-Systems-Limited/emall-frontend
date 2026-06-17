export function readFileAsDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read the selected file'))
    reader.readAsDataURL(file)
  })
}

export async function fileToRegistrationCertificate(file) {
  const dataUri = await readFileAsDataUri(file)
  return {
    file_name: file.name,
    mime_type: file.type,
    size: file.size,
    data: dataUri,
  }
}
