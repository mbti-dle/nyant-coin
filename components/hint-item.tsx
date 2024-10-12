'use client'

import { FC } from 'react'

import { HintModel } from '@/types/hint'

interface HintItemProps {
  hint: HintModel
}

const HintItem: FC<HintItemProps> = ({ hint }) => (
  <div className="mb-4 p-4 border-2 border-black-500 rounded shadow">
    <p className="mt-2 text-sm text-gray-500">카테고리: {hint.category}</p>
    <h3 className="font-bold mb-2">{hint.brief_content}</h3>
    <p className="mb-2">{hint.full_content_match}</p>
    <p className="mb-2">{hint.full_content_mismatch}</p>
  </div>
)

export default HintItem
