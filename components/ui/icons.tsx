interface IconStyleProps {
  className?: string
}

interface IconProps extends IconStyleProps {
  name: string
}

const Icon = ({ name, className }: IconProps) => {
  return <span className={`material-symbols-sharp ${className}`}>{name}</span>
}

export const CopyIcon = ({ className }: IconStyleProps) => (
  <Icon name="content_copy" className={className} />
)

export const ArrowRightIcon = ({ className }: IconStyleProps) => (
  <Icon name="trending_flat" className={className} />
)

export const SendIcon = ({ className }: IconStyleProps) => (
  <Icon name="send" className={className} />
)

export const CheckIcon = ({ className }: IconStyleProps) => (
  <Icon name="check_circle" className={className} />
)

export const ArrowBackIcon = ({ className }: IconStyleProps) => (
  <Icon name="arrow_back_ios_new" className={className} />
)

export default Icon
