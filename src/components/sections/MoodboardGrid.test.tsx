import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MoodboardGrid from './MoodboardGrid'
import type { Photo } from '../../types/solum'

describe('MoodboardGrid Component', () => {
  const mockPhotos: Photo[] = [
    {
      id: 'photo-1.jpg',
      url: 'solum-media:///workspace/vault/photo-1.jpg',
      aspectRatio: 1.0,
      createdAt: '2026-05-22T10:00:00Z',
      order: 1,
      name: 'Photo One'
    },
    {
      id: 'doc-2.pdf',
      url: 'solum-media:///workspace/vault/doc-2.pdf',
      aspectRatio: 1.0,
      createdAt: '2026-05-22T10:05:00Z',
      order: 2,
      name: 'Doc Two'
    }
  ]

  it('should render image thumbnails and PDF document icons', () => {
    render(<MoodboardGrid photos={mockPhotos} />)
    
    // Check if the image photo name is rendered
    expect(screen.getByText('Photo One')).toBeDefined()
    
    // Check if the PDF document label is rendered
    expect(screen.getByText('PDF Document')).toBeDefined()
    expect(screen.getByText('Doc Two')).toBeDefined()
  })

  it('should call onRenamePhoto when image name changes to a new non-empty string', () => {
    const onRenamePhoto = vi.fn()
    const onSetActionMode = vi.fn()

    render(
      <MoodboardGrid
        photos={mockPhotos}
        actionMode="rename"
        onRenamePhoto={onRenamePhoto}
        onSetActionMode={onSetActionMode}
      />
    )

    // Click the photo name/card to enter rename mode
    const item = screen.getByText('Photo One')
    fireEvent.click(item)

    // Verify input appears
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('Photo One')

    // Change value
    fireEvent.change(input, { target: { value: 'New Photo Name' } })
    fireEvent.submit(input.closest('form')!)

    // Verify callbacks are called
    expect(onRenamePhoto).toHaveBeenCalledWith('photo-1.jpg', 'New Photo Name')
    expect(onSetActionMode).toHaveBeenCalledWith(null)
  })

  it('should NOT call onRenamePhoto when name remains identical', () => {
    const onRenamePhoto = vi.fn()
    const onSetActionMode = vi.fn()

    render(
      <MoodboardGrid
        photos={mockPhotos}
        actionMode="rename"
        onRenamePhoto={onRenamePhoto}
        onSetActionMode={onSetActionMode}
      />
    )

    // Click to edit
    const item = screen.getByText('Photo One')
    fireEvent.click(item)

    const input = screen.getByRole('textbox')
    
    // Blur without changes
    fireEvent.blur(input)

    expect(onRenamePhoto).not.toHaveBeenCalled()
    expect(onSetActionMode).toHaveBeenCalledWith(null)
  })

  it('should NOT call onRenamePhoto when name is empty', () => {
    const onRenamePhoto = vi.fn()
    const onSetActionMode = vi.fn()

    render(
      <MoodboardGrid
        photos={mockPhotos}
        actionMode="rename"
        onRenamePhoto={onRenamePhoto}
        onSetActionMode={onSetActionMode}
      />
    )

    // Click to edit
    const item = screen.getByText('Photo One')
    fireEvent.click(item)

    const input = screen.getByRole('textbox')

    // Change to empty and submit
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(input.closest('form')!)

    expect(onRenamePhoto).not.toHaveBeenCalled()
  })
})
