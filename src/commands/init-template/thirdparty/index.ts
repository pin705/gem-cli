import { consola } from 'consola'
import { colors } from 'consola/utils'
import fs from 'node:fs'
import { parse } from 'node-html-parser'
import path from 'node:path'
import readline from 'node:readline'
import { promisify } from 'node:util'
import { writeFile } from '../../../utils/file'
import {
  capitalize,
  capitalizeFirstLetter,
  convertStringToCamelCase,
  convertToKebabCase,
  extractSubstrings,
  makeFile,
  removeSpecialChars,
} from '../../../utils/string'
import {
  AppBlockConfigTemplate,
  AppBlockSettingTemplate,
  AppLiquidComponent,
  AppLiquidWithAppBlockComponent,
  AppReactComponent,
  AppReactWithAppBlockComponent,
  AppSettingTemplate,
  AppSettingWithAppBlockTemplate,
} from './content'

export type configType = {
  id: string
  logoUrl: string
  fileName: string
  tag: string
  capitalizedFileName: string
  label: string
  sourceURL: string
  appName?: string
  appId?: string
  widgets?: string[]
}

const basePath = path.join(process.cwd(), 'packages/components/src/third-party')
const corePackageBasePath = path.join(
  process.cwd(),
  'packages/core/src/helpers/third-party',
)

const paths = {
  componentsDir: path.join(basePath, 'components'),
  indexDir: path.join(basePath, 'index.ts'),
  indexLiquidDir: path.join(basePath, 'index.liquid.ts'),
  settingDir: path.join(basePath, 'setting'),
  settingIndexDir: path.join(basePath, 'setting/index.ts'),
  nextDir: path.join(basePath, 'next.ts'),
  builderDir: path.join(process.cwd(), 'packages/components/src/builder.ts'),
  thirdPartyAppSetting: path.join(corePackageBasePath, 'appSetting.ts'),
  thirdPartyAppConfig: path.join(corePackageBasePath, 'appConfig.ts'),
  thirdPartyConstant: path.join(corePackageBasePath, 'constant.ts'),
}

let config: configType = {
  id: '',
  logoUrl:
    'https://ucarecdn.com/e60d4b13-c990-4676-b1cb-50e18ce6911a/-/format/auto/-/preview/3000x3000/-/quality/lighter/',
  fileName: 'ThirdPartyElement',
  tag: '',
  capitalizedFileName: '',
  label: '',
  sourceURL: '',
  appName: '',
  appId: '',
  widgets: [''],
}

export const _initThirdPartyTemplate = async (isUsingAppBlock?: boolean) => {
  try {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const question = promisify(rl.question).bind(rl)

    const sourceURL = (await question(
      `Please enter third party url (Example: https://apps.shopify.com/easy-order-form): `,
    )) as any

    if (!sourceURL) {
      consola.error(colors.red('No source URL found'))
      rl.close()
      return
    }

    const url = new URL(sourceURL)
    if (url.hostname !== 'apps.shopify.com') {
      consola.error(colors.red('Source URL is not from Shopify App Store'))
      rl.close()
      return
    }

    const request = await fetch(sourceURL, {
      method: 'GET',
      redirect: 'follow',
    })

    if (request.status !== 200) {
      consola.error(colors.red('Error fetching data'))
      rl.close()
      return
    }

    const pageContent = await request.text()
    const document = parse(pageContent)
    const adpHero = document.querySelector('#adp-hero')
    if (!adpHero) {
      consola.error(colors.red('No adp-hero found'))
      rl.close()
      return
    }

    const figure = adpHero?.querySelector('figure')
    if (!figure) {
      consola.error('No figure found')
      rl.close()
      return
    }

    const img = figure.querySelector('img')
    if (!img) {
      consola.error('No img found')
      return
    }

    const imgSrc = img.getAttribute('src')
    if (!imgSrc) {
      consola.error('No logo URL found')
      return
    }

    const title = img.getAttribute('alt')
    const titleNotSpecialChars = removeSpecialChars(title || config.fileName)
    const fileName = convertStringToCamelCase(
      titleNotSpecialChars || config.fileName,
    )
    const capitalizedFileName = capitalize(fileName)

    const label = title || capitalizedFileName
    const tag = capitalizedFileName

    const id = convertToKebabCase(fileName)
    const logoUrl = imgSrc || config.logoUrl

    config = {
      id,
      logoUrl,
      fileName,
      tag,
      capitalizedFileName,
      label,
      sourceURL,
    }

    if (isUsingAppBlock) {
      const appName = (await question(`Please enter app name: `)) as any

      if (!appName) {
        consola.error(colors.red('App name cannot be empty'))
        rl.close()
        return
      }

      const appId = (await question(`Please enter app id: `)) as any

      if (!appId) {
        consola.error(colors.red('App id cannot be empty'))
        rl.close()
        return
      }

      const widgets = (await question(
        `Please enter widget name (required at least 1 widget)\nIf there are multiple widgets please separate them by comma (Eg: widget1,widget2):`,
      )) as any

      if (!widgets) {
        consola.error(colors.red('Please enter at least one widget'))
        rl.close()
        return
      }

      config = {
        ...config,
        appId,
        appName,
        widgets: extractSubstrings(widgets),
      }
    }

    if (!fs.existsSync(paths.componentsDir)) {
      fs.mkdirSync(paths.componentsDir, { recursive: true })
    }

    const appReactComponent = isUsingAppBlock
      ? AppReactWithAppBlockComponent(config)
      : AppReactComponent(config)

    const appLiquidComponent = isUsingAppBlock
      ? AppLiquidWithAppBlockComponent(config)
      : AppLiquidComponent(config)

    const appSettingTemplate = isUsingAppBlock
      ? AppSettingWithAppBlockTemplate(config)
      : AppSettingTemplate(config)

    // Create the file tsx
    writeFile(paths.componentsDir, {
      content: appReactComponent,
      name: makeFile(fileName, 'tsx'),
    })

    // Create the file liquid
    writeFile(paths.componentsDir, {
      content: appLiquidComponent,
      name: makeFile(fileName, 'liquid.ts'),
    })

    // Create the setting file
    writeFile(paths.settingDir, {
      content: appSettingTemplate,
      name: makeFile(fileName, 'ts'),
    })

    await fileImported(fileName, 'tsx')
    await fileImported(fileName, 'liquid')
    await fileImported(fileName, 'next')
    await fileImported(fileName, 'setting')
    await fileImported(fileName, 'builder')

    if (isUsingAppBlock) {
      await updateAppConfigContent(config)
      await updateAppSettingContent(config)
      await updateAppConstantContent(config)
    }

    rl.close()
  } catch (error) {
    consola.error(error)
  }
}

async function fileImported(fileName: string, fileType: string) {
  const importers: { [key: string]: (fileName: string) => void } = {
    tsx: importFileReact,
    liquid: importFileLiquid,
    next: importFileNext,
    builder: importFileBuilder,
    setting: importSettingFile,
  }

  const importer = importers[fileType]

  if (importer) {
    importer(fileName)
  } else {
    consola.error(colors.red(`Unsupported file type: ${fileType}`))
  }
}

async function updateAppConfigContent(config: configType) {
  fs.readFile(paths.thirdPartyAppConfig, 'utf8', (err, data) => {
    if (err) {
      consola.error('Error reading the file:', err)
      return
    }

    const newConfigTemplate = AppBlockConfigTemplate(config)

    // Ensure there's a newline before the new block
    const updatedContent = data.trimEnd() + '\n\n' + newConfigTemplate

    // Write the updated content back to the file
    fs.writeFile(paths.thirdPartyAppConfig, updatedContent, 'utf8', (err) => {
      if (err) {
        consola.error('Error writing to the file:', err)
      } else {
        consola.success(colors.green('New block config added successfully!'))
      }
    })
  })
}

async function updateAppSettingContent(config: configType) {
  fs.readFile(paths.thirdPartyAppSetting, 'utf8', (err, data) => {
    if (err) {
      consola.error('Error reading the file:', err)
      return
    }

    const newSettingTemplate = AppBlockSettingTemplate(config)

    const exportStatement =
      'export const composeSettingsByWidgetType: Record<string, any> = {'
    const insertPosition = data.indexOf(exportStatement)

    if (insertPosition === -1) {
      console.log('Export statement not found.')
    } else {
      // Insert the new config before the export statement
      const beforeInsert = data.slice(0, insertPosition)
      const afterInsert = data.slice(insertPosition)

      data = beforeInsert + newSettingTemplate + '\n\n' + afterInsert

      // Add the new config to the composeSettingsByWidgetType object
      data = data.replace(
        exportStatement,
        `${exportStatement}\n  ...${config.capitalizedFileName},`,
      )

      // Write the modified data back to the file
      fs.writeFileSync(paths.thirdPartyAppSetting, data)

      consola.success(colors.green('New block setting added successfully.'))
    }
  })
}

async function updateAppConstantContent(config: configType) {
  fs.readFile(paths.thirdPartyConstant, 'utf8', (err, data) => {
    if (err) {
      consola.error('Error reading the file:', err)
      return
    }

    const { capitalizedFileName } = config

    const newConfigName = `${capitalizedFileName}Config`

    // Append new import
    const importRegex = /(import {[\S\s]+?)(} from '.\/appConfig';)/
    data = data.replace(importRegex, (match, importStart, importEnd) => {
      return `${importStart}  ${newConfigName},\n${importEnd}`
    })

    // Find the mapShopifyAppMeta object and append newConfig
    const objectRegex = /(export const mapShopifyAppMeta:[^{]+{[\S\s]+?)(};)/
    data = data.replace(objectRegex, (match, objectContent, closingBrace) => {
      return `${objectContent}  ...${newConfigName},\n${closingBrace}`
    })

    // Write the modified content back to the file
    fs.writeFileSync(paths.thirdPartyConstant, data)

    consola.success(colors.green('File constant updated successfully.'))
  })
}

function updateFileContent(args: any) {
  const { filePath, newImport, newExport, newExportPropsType } = args
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      consola.error(colors.red(`Error reading file: ${err}`))
      return
    }

    const importRegex = /(import .+ from .+;\n)+/
    const exportRegex = /export {\n([\S\s]*?)\n};/
    const exportDefaultRegex = /export default {\n([\S\s]*?)\n};/
    const exportTypeRegex = /export type {\n([\S\s]*?)\n};/

    const updatedContent = data
      .replace(importRegex, `$&${newImport}`)
      .replace(
        exportRegex,
        (match, p1) => `export {\n  ${newExport}\n${p1}\n};`,
      )
      .replace(
        exportDefaultRegex,
        (match, p1) => `export default {\n  ${newExport}\n${p1}\n};`,
      )
      .replace(
        exportTypeRegex,
        (match, p1) => `export type {\n  ${newExportPropsType}\n${p1}\n};`,
      )

    fs.writeFileSync(filePath, updatedContent)
    consola.success(colors.green(`File updated successfully`))
  })
}

function importFileReact(fileName: string) {
  const modStr = capitalizeFirstLetter(fileName)
  const newImport = `import ${fileName} from './components/${fileName}';\nimport type { ${modStr}Props } from './components/${fileName}';\n`

  const newExport = `${fileName},`
  const newExportPropsType = `${modStr}Props,`

  updateFileContent({
    filePath: paths.indexDir,
    newImport,
    newExport,
    newExportPropsType,
  })
}

function importFileNext(fileName: string) {
  const newImport = `const ${fileName} = dynamic(() => import('./components/${fileName}'), {\n  ssr: false,\n  loading: Loading,\n});\n`
  const newExport = `${fileName},`

  updateFileContent({
    filePath: paths.nextDir,
    newImport,
    newExport,
    newExportPropsType: '',
  })
}

function importFileBuilder(fileName: string) {
  const newImport = `import { ${fileName} } from './third-party';\n`
  const newExport = `${fileName},`

  updateFileContent({
    filePath: paths.builderDir,
    newImport,
    newExport,
    newExportPropsType: '',
  })
}

function importFileLiquid(fileName: string) {
  const newImport = `import ${fileName} from './components/${fileName}.liquid';\n`
  const newExport = `${fileName},`

  updateFileContent({
    filePath: paths.indexLiquidDir,
    newImport,
    newExport,
    newExportPropsType: '',
  })
}

function importSettingFile(fileName: string) {
  const newImport = `import ${fileName} from './${fileName}';\n`
  const newExport = `${fileName},`

  updateFileContent({
    filePath: paths.settingIndexDir,
    newImport,
    newExport,
    newExportPropsType: '',
  })
}
