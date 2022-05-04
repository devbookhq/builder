import cn from 'classnames'
import { ReactNode } from 'react'
import Link from 'next/link'

import Title, { Size } from 'components/typography/Title'

interface Props {
  href: string
  title: string
  icon?: ReactNode
  size?: Size
  active?: boolean
  shallow?: boolean
}

function TitleLink({
  href,
  title,
  icon,
  size,
  active,
  shallow,
}: Props) {
  return (
    <Link
      href={href}
      shallow={shallow}
    >
      <a className="

        hover:no-underline
      ">
        <Title
          rank={active ? Title.rank.Primary : Title.rank.Secondary}
          className="hover:text-white-900"
          size={size}
          title={title}
          icon={icon}
        />
      </a>
    </Link>
  )
}

TitleLink.size = Size
export default TitleLink