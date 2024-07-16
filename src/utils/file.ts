import fs from 'node:fs'
import path from 'node:path'
import { consola } from 'consola'
import { colors } from 'consola/utils'

export function writeFile(
  dirPath: string,
  {
    content,
    name,
  }: {
    content: string
    name: string
  },
) {
  try {
    const filePath = path.join(dirPath, name)
    // Write to the file
    fs.writeFileSync(filePath, content)
    consola.start(colors.yellow(`Creating file: ${name}`))
    consola.success(colors.green(`Create file: ${name} successfully!`))
  } catch (error_: any) {
    if (error_.code === 'ENOENT') {
      // If the file does not exist, handle it appropriately
      consola.error(colors.red(`File does not exist: ${error_.message}`))
    } else if (error_.code === 'EISDIR') {
      // Handle the specific EISDIR error
      consola.error(colors.red(`Cannot write to a directory: ${error_.message}`))
    } else {
      // Handle any other errors
      consola.error(colors.red(`Error writing file: ${error_.message}`))
    }
  }
}
