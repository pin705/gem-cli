import { defineCommand } from 'citty'
import { consola } from 'consola'
import prompts from 'prompts'
import { _initThirdPartyTemplate } from './thirdparty'

export default defineCommand({
  meta: {
    name: 'init-template',
    description: 'Create default template for element',
  },
  args: {
    cwd: {
      type: 'string',
      description: 'Current working directory',
    },
    dev: {
      type: 'boolean',
      description: 'Run in dev mode',
    },
    watch: {
      type: 'boolean',
      description: 'Watch mode',
    },
  },
  async run() {
    const response = await prompts({
      type: 'select',
      name: 'select-template',
      message: 'Pick template',
      choices: [
        { title: 'Third Party App', value: 'third-party' },
        {
          title: 'Third Party App using App block',
          value: 'third-party-app-block',
        },
        { title: 'Base Element', value: 'element' },
      ],
    })

    switch (response['select-template']) {
      case 'third-party': {
        consola.start('Creating third party template...')
        await _initThirdPartyTemplate()
        break
      }
      case 'third-party-app-block': {
        consola.start('Creating third party using App block template...')
        await _initThirdPartyTemplate(true)
        break
      }
      case 'element': {
        consola.warn('Element template is not supported yet')
        break
      }
    }
  },
})
