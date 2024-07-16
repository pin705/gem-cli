export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function convertToKebabCase(str: string) {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
}

export function makeFile(
  fileName: string,
  fileType: 'tsx' | 'ts' | 'liquid.ts',
) {
  return `${fileName}.${fileType}`
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export const convertStringToCamelCase = (
  str: string,
  extension?: 'ts' | 'tsx',
) => {
  const words = str.split(' ')
  const camelCaseWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
  const camelCaseString = camelCaseWords.join('')
  const finalString = extension
    ? camelCaseString + `.${extension}`
    : camelCaseString
  return finalString
}

export const convertKebabToTitleCase = (input: string): string => {
  return input
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const removeSpecialChars = (originalString: string) => {
  const specialCharsRegex = /[^\s\w]/g
  const noSpecialCharsString = originalString.replace(specialCharsRegex, '')
  return noSpecialCharsString
}

export const extractSubstrings = (str: string) => {
  return str.includes(',') ? str.split(',').map((s) => s.trim()) : [str];
}
