import { defineCommand } from 'citty'
import { consola } from 'consola'
import { _initThirdPartyTemplate } from './thirdparty'
import select from '@inquirer/select';

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
      const answer = await select({
          message: 'Pick template:',
          choices: [
              { name: 'Third Party App', value: 'Third Party Appy' },
              { name: 'Third Party App using App block', value: 'third-party-app-block' },
              { name: 'Base Element', value: 'element' },
          ],
      });

    switch (answer) {
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
