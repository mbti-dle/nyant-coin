import { useEffect, useState } from 'react'

import ReactDOM from 'react-dom'

interface ModalPortalProps {
  children: React.ReactNode
}

const ModalPortal = ({ children }: ModalPortalProps) => {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const root = document.getElementById('modal')
    setModalRoot(root)
  }, [])
  return modalRoot ? ReactDOM.createPortal(children, modalRoot) : null
}

export default ModalPortal
