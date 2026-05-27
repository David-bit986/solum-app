import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import VaultsDashboard from './VaultsDashboard'
import type { Vault } from '../../types/solum'

describe('VaultsDashboard Rename Behavior', () => {
  const mockVaults: Vault[] = [
    { id: 'inspiration', name: 'Inspiration', count: 5, createdAt: '2026-05-20T10:00:00Z' }
  ]

  it('should call onRenameVault when name changes to a new non-empty string', () => {
    const onRenameVault = vi.fn()
    const onSetActionMode = vi.fn()

    render(
      <VaultsDashboard
        vaults={mockVaults}
        actionMode="rename"
        onRenameVault={onRenameVault}
        onSetActionMode={onSetActionMode}
      />
    )

    // Click on the vault item to enter edit mode
    const vaultItem = screen.getByText('Inspiration')
    fireEvent.click(vaultItem)

    // Verify input is now visible and has the current name
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('Inspiration')

    // Change value
    fireEvent.change(input, { target: { value: 'New Inspiration' } })
    // Submit form (or trigger blur)
    fireEvent.submit(input.closest('form')!)

    // Verify callbacks are triggered
    expect(onRenameVault).toHaveBeenCalledWith('inspiration', 'New Inspiration')
    expect(onSetActionMode).toHaveBeenCalledWith(null)
  })

  it('should NOT call onRenameVault when name remains identical', () => {
    const onRenameVault = vi.fn()
    const onSetActionMode = vi.fn()

    render(
      <VaultsDashboard
        vaults={mockVaults}
        actionMode="rename"
        onRenameVault={onRenameVault}
        onSetActionMode={onSetActionMode}
      />
    )

    // Click on the vault item to enter edit mode
    const vaultItem = screen.getByText('Inspiration')
    fireEvent.click(vaultItem)

    // Verify input is now visible
    const input = screen.getByRole('textbox')
    
    // Trigger blur without changing value
    fireEvent.blur(input)

    // Verify rename callback was NOT called, but action mode was reset/cleared
    expect(onRenameVault).not.toHaveBeenCalled()
    expect(onSetActionMode).toHaveBeenCalledWith(null)
  })

  it('should NOT call onRenameVault when name becomes empty', () => {
    const onRenameVault = vi.fn()
    const onSetActionMode = vi.fn()

    render(
      <VaultsDashboard
        vaults={mockVaults}
        actionMode="rename"
        onRenameVault={onRenameVault}
        onSetActionMode={onSetActionMode}
      />
    )

    // Click on the vault item to enter edit mode
    const vaultItem = screen.getByText('Inspiration')
    fireEvent.click(vaultItem)

    // Verify input is now visible
    const input = screen.getByRole('textbox')

    // Change to empty string and submit
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(input.closest('form')!)

    // Verify rename callback was NOT called
    expect(onRenameVault).not.toHaveBeenCalled()
  })
})
