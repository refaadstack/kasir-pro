import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PinPad } from '@/components/ui/PinPad'

describe('PinPad Component', () => {
  it('should render all number buttons', () => {
    render(<PinPad onComplete={vi.fn()} />)

    // Check if all numbers 0-9 are rendered
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument()
    }
  })

  it('should render backspace button', () => {
    render(<PinPad onComplete={vi.fn()} />)

    const backspaceButton = screen.getByText('⌫')
    expect(backspaceButton).toBeInTheDocument()
  })

  it('should display dots when numbers are clicked', () => {
    render(<PinPad onComplete={vi.fn()} />)

    const button1 = screen.getByText('1')
    fireEvent.click(button1)

    // Check if one dot is displayed
    const display = screen.getByText('•')
    expect(display).toBeInTheDocument()
  })

  it('should call onComplete when 4 digits are entered', () => {
    const onComplete = vi.fn()
    render(<PinPad onComplete={onComplete} />)

    // Click 4 numbers
    fireEvent.click(screen.getByText('1'))
    fireEvent.click(screen.getByText('2'))
    fireEvent.click(screen.getByText('3'))
    fireEvent.click(screen.getByText('4'))

    expect(onComplete).toHaveBeenCalledWith('1234')
  })

  it('should not accept more than 4 digits', () => {
    const onComplete = vi.fn()
    render(<PinPad onComplete={onComplete} />)

    // Try to click 5 numbers
    fireEvent.click(screen.getByText('1'))
    fireEvent.click(screen.getByText('2'))
    fireEvent.click(screen.getByText('3'))
    fireEvent.click(screen.getByText('4'))
    fireEvent.click(screen.getByText('5'))

    // Should only be called once with first 4 digits
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('1234')
  })

  it('should remove last digit when backspace is clicked', () => {
    render(<PinPad onComplete={vi.fn()} />)

    // Click 2 numbers
    fireEvent.click(screen.getByText('1'))
    fireEvent.click(screen.getByText('2'))

    // Click backspace
    const backspaceButton = screen.getByText('⌫')
    fireEvent.click(backspaceButton)

    // Should only show 1 dot now
    const dots = screen.getAllByText('•')
    expect(dots).toHaveLength(1)
  })

  it('should reset after completion', async () => {
    const onComplete = vi.fn()
    render(<PinPad onComplete={onComplete} autoReset={true} />)

    // Enter 4 digits
    fireEvent.click(screen.getByText('1'))
    fireEvent.click(screen.getByText('2'))
    fireEvent.click(screen.getByText('3'))
    fireEvent.click(screen.getByText('4'))

    expect(onComplete).toHaveBeenCalledWith('1234')

    // Wait for auto-reset (300ms timeout in component)
    await new Promise(resolve => setTimeout(resolve, 350))

    // Display should be empty after auto-reset
    expect(screen.queryByText('•')).not.toBeInTheDocument()
  })
})
