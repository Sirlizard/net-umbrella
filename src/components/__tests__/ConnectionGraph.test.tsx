import React from 'react'
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import ConnectionGraph from '../ConnectionGraph'

test('renders connection graph svg', () => {
  const nodes = [
    { id: 'a', name: 'Alice', count: 2 },
    { id: 'b', name: 'Bob', count: 1 },
  ]
  const edges = { 'a|b': 1 }
  render(<ConnectionGraph nodes={nodes as any} edges={edges} width={300} height={200} />)
  // prefer queryByRole (won't throw) and fall back to any svg present
  const svg = screen.queryByRole('img', { hidden: true }) || document.querySelector('svg')
  expect(svg).toBeTruthy()
})
