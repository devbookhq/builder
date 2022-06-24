import CodeIcon from 'components/icons/Code'
import BoxIcon from 'components/icons/Box'
import PackageIcon from 'components/icons/Package'

export enum Tab {
  Code = 'code',
  Env = 'env',
  Deps = 'deps',
}

export const tabs = {
  [Tab.Code]: {
    key: Tab.Code,
    title: 'Code',
    icon: <CodeIcon />,
  },
  [Tab.Deps]: {
    key: Tab.Deps,
    title: 'Dependencies',
    icon: <PackageIcon />,
  },
  [Tab.Env]: {
    key: Tab.Env,
    title: 'Environment',
    icon: <BoxIcon />,
  },
}
