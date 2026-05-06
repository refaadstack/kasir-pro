import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PinPad } from '@/components/ui/PinPad'

describe('PinPad Component', () => {
  it('should render PIN display with correct number of slots', () => {
    render(<PinPad onComplete={vi.fn()} length={4} />)
    
    // Harus ada 4 slot untuk PIN
    const slots = screen.getAllByRole('generic').filter(el => 
      el.className.includes('border-2')
    )
    expect(slots.length).toBeGreaterThanOrEqual(4)
  })

  it('should display dots when digits are entered', () => {
    render(<PinPad onComplete={vi.fn()} length={4} />)
    
    // Klik angka 1
    const button1 = screen.getByRole('button', { name: '1' })
    fireEvent.click(button1)
    
    // Harus ada satu dot
    expect(screen.getByText('•')).toBeInTheDocument()
  })

  it('should call onComplete when PIN length is reached', () => {
    const onComplete = vi.fn()
    render(<PinPad onComplete={onComplete} length={4} />)
    
    // Klik 4 angka
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    
    // onComplete harus dipanggil dengan PIN yang benar
    expect(onComplete).toHaveBeenCalledWith('1234')
  })

  it('should clear PIN when Clear button is clicked', () => {
    render(<PinPad onComplete={vi.fn()} length={4} />)
    
    // Masukkan beberapa digit
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    
    // Klik Clear
    const clearButton = screen.getByRole('button', { name: 'Clear' })
    fireEvent.click(clearButton)
    
    // Tidak ada dot yang ditampilkan
    expect(screen.queryByText('•')).not.toBeInTheDocument()
  })

  it('should remove last digit when backspace is clicked', () => {
    render(<PinPad onComplete={vi.fn()} length={4} />)
    
    // Masukkan 3 digit
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    
    // Harus ada 3 dots
    expect(screen.getAllByText('•')).toHaveLength(3)
    
    // Klik backspace
    const backspaceButton = screen.getByRole('button', { name: '⌫' })
    fireEvent.click(backspaceButton)
    
    // Harus tersisa 2 dots
    expect(screen.getAllByText('•')).toHaveLength(2)
  })

  it('should not accept more digits than length', () => {
    const onComplete = vi.fn()
    render(<PinPad onComplete={onComplete} length={4} />)
    
    // Coba masukkan 5 digit
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    
    // onComplete hanya dipanggil sekali dengan 4 digit
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('1234')
  })

  it('should auto-reset after completion when autoReset is true', async () => {
    const onComplete = vi.fn()
    render(<PinPad onComplete={onComplete} length={4} autoReset={true} />)
    
    // Masukkan 4 digit
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    
    // Tunggu auto-reset (300ms)
    await new Promise(resolve => setTimeout(resolve, 350))
    
    // PIN harus ter-reset
    expect(screen.queryByText('•')).not.toBeInTheDocument()
  })
})
