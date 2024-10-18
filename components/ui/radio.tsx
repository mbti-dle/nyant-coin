import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface RadioButtonProps {
  name: string
  label: string
  isChecked: boolean
  className?: string
  onChangeInput: (event: React.ChangeEvent<HTMLInputElement>) => void
}

interface RadioGroupProps {
  className?: string
  children: React.ReactNode
}

export const RadioButton = ({
  name,
  label,
  isChecked,
  className,
  onChangeInput,
}: RadioButtonProps) => {
  const radioButtonClassName = twMerge(
    clsx(
      'flex h-[54px] w-[190px] cursor-pointer items-center justify-center rounded-xl border-2 border-solid border-primary text-lg',
      {
        'bg-primary text-white': isChecked,
        'bg-white text-black': !isChecked,
      },
      className
    )
  )

  return (
    <div>
      <input
        type="radio"
        id={label}
        name={name}
        value={label}
        checked={isChecked}
        onChange={onChangeInput}
        className="hidden"
      />
      <label htmlFor={label} className={radioButtonClassName}>
        {label}
      </label>
    </div>
  )
}

const RadioGroup = ({ className, children }: RadioGroupProps) => {
  return <div className={twMerge('flex flex-col items-center gap-3', className)}>{children}</div>
}

export default RadioGroup
