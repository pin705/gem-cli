import { configType } from '.'
import { convertKebabToTitleCase } from '../../../utils/string'

export function AppReactComponent(appConfig: any) {
  const { id, label, logoUrl, tag, capitalizedFileName } = appConfig
  return `import type { AlignProp, BaseProps, ObjectDevices } from '@gem-sdk/core';
import { makeStyleResponsive } from '@gem-sdk/core';
import ThirdPartyPreview from './ThirdPartyPreview';

export const AppConfig = {
  id: '${id}',
  label: '${label}',
  logoUrl:
    '${logoUrl}',
  tag: '${tag}',
};

export type ${capitalizedFileName}Props = BaseProps<{
  align?: ObjectDevices<AlignProp>;
  openApp?: any;
  install?: any;
}>;

const ${capitalizedFileName}Content: React.FC<${capitalizedFileName}Props> = () => {
  return (
    <>
      <div className="gp-p-2">
        <ThirdPartyPreview
          setting={{
            label: '${label}',
            iconSvg: \`<img class="gp-w-[24px] gp-border gp-border-[#494949] gp-rounded-[3px]" src="\${AppConfig.logoUrl}">\`,
          }}
        />
      </div>
    </>
  );
};

const ${capitalizedFileName}: React.FC<${capitalizedFileName}Props> = ({ setting }) => {
  return (
    <div
      style={{
        ...makeStyleResponsive('ta', setting?.align),
      }}
    >
      <${capitalizedFileName}Content />
    </div>
  );
};

export default ${capitalizedFileName};`
}

export function AppReactWithAppBlockComponent(appConfig: any) {
  const { id, label, logoUrl, tag, capitalizedFileName } = appConfig
  return `import type { AlignProp, BaseProps, ObjectDevices } from '@gem-sdk/core';
import { makeStyleResponsive } from '@gem-sdk/core';
import ThirdPartyPreview from './ThirdPartyPreview';

export const AppConfig = {
  id: '${id}',
  label: '${label}',
  logoUrl:
    '${logoUrl}',
  tag: '${tag}',
};

export type ${capitalizedFileName}Props = BaseProps<{
  align?: ObjectDevices<AlignProp>;
  openApp?: any;
  install?: any;
  appBlockId?: string;
  widgetType?: string;
}>;

const ${capitalizedFileName}Content: React.FC<${capitalizedFileName}Props> = () => {
  return (
    <>
      <div className="gp-p-2">
        <ThirdPartyPreview
          setting={{
            label: '${label}',
            iconSvg: \`<img class="gp-w-[24px] gp-border gp-border-[#494949] gp-rounded-[3px]" src="\${AppConfig.logoUrl}">\`,
          }}
        />
      </div>
    </>
  );
};

const ${capitalizedFileName}: React.FC<${capitalizedFileName}Props> = ({ setting }) => {
  return (
    <div
      style={{
        ...makeStyleResponsive('ta', setting?.align),
      }}
    >
      <${capitalizedFileName}Content />
    </div>
  );
};

export default ${capitalizedFileName};`
}

export function AppLiquidComponent(config: configType) {
  const { capitalizedFileName } = config
  return `import { makeStyleResponsive, template } from '@gem-sdk/core';
import type { ${capitalizedFileName}Props } from './${capitalizedFileName}';

const ${capitalizedFileName} = ({ setting, advanced }: ${capitalizedFileName}Props) => {
  const { align } = setting ?? {};

  return template\`
    <div
      class="\${advanced?.cssClass}"
      style="\${{
        ...makeStyleResponsive('ta', align),
      }}"
    >
      // any thing
    </div>
  \`;
};
export default ${capitalizedFileName};`
}

export function AppLiquidWithAppBlockComponent(config: configType) {
  const { capitalizedFileName } = config

  return `
    import type { ${capitalizedFileName}Props } from './${capitalizedFileName}';
    import { getLiquidForAppBlock } from '../helpers/thirdParty';

    const ${capitalizedFileName} = ({ setting, advanced }: ${capitalizedFileName}Props) => {

      const { align, appBlockId } = setting ?? {};

      return getLiquidForAppBlock(appBlockId, align, advanced?.cssClass);

    };
    export default ${capitalizedFileName};
  `
}

export function AppSettingTemplate(config: configType) {
  const { fileName, label, logoUrl, sourceURL } = config
  const modStr = fileName[0].toUpperCase() + fileName.slice(1)

  return `import { AppConfig } from './../components/${fileName}';
import type { ${modStr}Props } from './../components/${fileName}';
import type { ComponentSetting } from '@gem-sdk/core';

const config: ComponentSetting<${modStr}Props> = {
  tag: AppConfig.tag,
  label: AppConfig.label,
  icon: '<img class="gp-w-[24px] gp-border gp-border-[#494949] gp-rounded-[3px]" src="${logoUrl}">',
  editorConfigs: {
    placeholder: {
      flowTag: ['Product'],
    },
    component: {
      isThirdParty: true,
    },
  },
  presets: [
    {
      id: AppConfig.id,
      name: {
        en: AppConfig.label,
      },
      hideTextContent: true,
      icon: {
        desktop: \`<div class="w-full flex flex-col items-center">
        <img class="w-24 border border-dark-200 rounded-medium" src="${logoUrl}">
        <span class="preset-item-title">${label}</span>
      </div>\`,
      },
      components: [
        {
          tag: AppConfig.tag,
        },
      ],
    },
  ],
  settings: [
    {
      id: 'setting',
      controls: [
        {
          id: 'install',
          type: 'open-link',
          target: '_blank',
          linkType: 'install',
          href: '${sourceURL}?utm_source=gempages',
          appName: AppConfig.label,
        },
        {
          id: 'openApp',
          type: 'open-link',
          target: '_blank',
          linkType: 'openApp',
          href: '',
          appName: AppConfig.label,
        },
        {
          id: 'align',
          label: 'Alignment',
          type: 'segment',
          options: [
            {
              label: 'Left',
              value: 'left',
              type: 'align',
            },
            {
              label: 'Center',
              value: 'center',
              type: 'align',
            },
            {
              label: 'Right',
              value: 'right',
              type: 'align',
            },
          ],
          devices: {
            desktop: {
              default: 'left',
            },
          },
        },
      ],
    },
  ],
  ui: [
    {
      type: 'control',
      setting: {
        id: 'install',
      },
    },
    {
      type: 'control',
      setting: {
        id: 'openApp',
      },
    },
    {
      type: 'control',
      label: {
        en: 'Align',
      },
      setting: {
        id: 'align',
      },
    },
  ],
};

export default config;`
}

const WidgetSettingTemplate = (widgets?: string[]) => {
  if (!widgets) return ''

  const widgetOptionsTemplate = widgets
    .map((widget) => {
      return `{
      label: '${convertKebabToTitleCase(widget)}',
      value: '${widget}',
    },`
    })
    .join('\n')

  return `{
    id: 'widgetType',
    label: 'Choose widget',
    type: 'select',
    options: [
      ${widgetOptionsTemplate}
    ],
    default: '${widgets[0]}',
  },`
}

export function AppSettingWithAppBlockTemplate(config: configType) {
  const { fileName, label, logoUrl, sourceURL, widgets } = config
  const modStr = fileName[0].toUpperCase() + fileName.slice(1)

  return `import { AppConfig } from './../components/${fileName}';
import type { ${modStr}Props } from './../components/${fileName}';
import type { ComponentSetting } from '@gem-sdk/core';

const config: ComponentSetting<${modStr}Props> = {
  tag: AppConfig.tag,
  label: AppConfig.label,
  icon: '<img class="gp-w-[24px] gp-border gp-border-[#494949] gp-rounded-[3px]" src="${logoUrl}">',
  editorConfigs: {
    placeholder: {
      flowTag: ['Product'],
    },
    component: {
      isThirdParty: true,
    },
  },
  presets: [
    {
      id: AppConfig.id,
      name: {
        en: AppConfig.label,
      },
      hideTextContent: true,
      icon: {
        desktop: \`<div class="w-full flex flex-col items-center">
        <img class="w-24 border border-dark-200 rounded-medium" src="${logoUrl}">
        <span class="preset-item-title">${label}</span>
      </div>\`,
      },
      components: [
        {
          tag: AppConfig.tag,
        },
      ],
    },
  ],
  settings: [
    {
      id: 'setting',
      controls: [
        {
          id: 'appBlockId',
          type: 'input',
          default: '',
        },
        ${WidgetSettingTemplate(widgets)}
        {
          id: 'install',
          type: 'open-link',
          target: '_blank',
          linkType: 'install',
          href: '${sourceURL}?utm_source=gempages',
          appName: AppConfig.label,
        },
        {
          id: 'openApp',
          type: 'open-link',
          target: '_blank',
          linkType: 'openApp',
          href: '',
          appName: AppConfig.label,
        },
        {
          id: 'align',
          label: 'Alignment',
          type: 'segment',
          options: [
            {
              label: 'Left',
              value: 'left',
              type: 'align',
            },
            {
              label: 'Center',
              value: 'center',
              type: 'align',
            },
            {
              label: 'Right',
              value: 'right',
              type: 'align',
            },
          ],
          devices: {
            desktop: {
              default: 'left',
            },
          },
        },
      ],
    },
  ],
  ui: [
    {
      type: 'control',
      setting: {
        id: 'install',
      },
    },
    {
      type: 'control',
      setting: {
        id: 'openApp',
      },
    },
    {
      type: 'control',
      label: {
        en: 'Align',
      },
      setting: {
        id: 'align',
      },
    },
  ],
};

export default config;`
}

export const AppBlockConfigTemplate = (config: configType) => {
  const { capitalizedFileName, appName, appId } = config

  return `export const ${capitalizedFileName}Config = {
  ${capitalizedFileName}: {
    appName: '${appName}',
    appId: '${appId}',
  },
};`
}

export const AppBlockSettingTemplate = (config: configType) => {
  const { capitalizedFileName, tag, widgets } = config

  if (!widgets) return ''

  const settingByWidgetTemplate = widgets
    .map((widget) => {
      return `'${widget}': null,`
    })
    .join('\n')

  return `const ${capitalizedFileName} = {
  ${tag}: {
    ${settingByWidgetTemplate}
  },
};`
}
