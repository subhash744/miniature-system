import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import UpvoteButton from '@/components/upvote-button'

// Mock the storage functions
jest.mock('@/lib/storage', () => ({
  canUpvote: jest.fn(),
  addUpvote: jest.fn(),
  getCurrentUser: jest.fn(),
}))

describe('UpvoteButton', () => {
  const mockCanUpvote = require('@/lib/storage').canUpvote
  const mockAddUpvote = require('@/lib/storage').addUpvote
  const mockGetCurrentUser = require('@/lib/storage').getCurrentUser

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with initial upvote count', () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user123' })
    
    render(<UpvoteButton userId="test123" currentUpvotes={5} />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should disable button when user has already upvoted', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user123' })
    mockCanUpvote.mockResolvedValue(false) // User has already upvoted
    
    render(<UpvoteButton userId="test123" currentUpvotes={5} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should enable button when user can upvote', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user123' })
    mockCanUpvote.mockResolvedValue(true) // User can upvote
    
    render(<UpvoteButton userId="test123" currentUpvotes={5} />)
    
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
  })

  it('should call addUpvote when clicked', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user123' })
    mockCanUpvote.mockResolvedValue(true)
    mockAddUpvote.mockResolvedValue(undefined)
    
    render(<UpvoteButton userId="test123" currentUpvotes={5} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockAddUpvote).toHaveBeenCalledWith('test123', 'user123')
  })
})