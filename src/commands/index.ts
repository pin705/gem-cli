import type { CommandDef } from 'citty'

const _rDefault = (r: any) => (r.default || r) as Promise<CommandDef>

export const commands = {
  'init-template': () => import('./init-template').then(_rDefault),
} as const
