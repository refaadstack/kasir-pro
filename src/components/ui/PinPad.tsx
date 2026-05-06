'use client'

import { useState } from 'react'
import { Button } from './button'

type PinPadProps = {
  onComplete: (pin: string) => void
  length?: number
  autoReset?: boolean
}

export function PinPad({ onComplete, length = 4, autoReset = true }: PinPadProps) {
  const [pin, setPin] = useState('')

  const handleDigit = (digit: string) => {
    if (pin.length < length) {
      const newPin = pin + digit
      setPin(newPin)
      
      if (newPin.length === length) {
        onComplete(newPin)
        if (autoReset) {
          setTimeout(() => setPin(''), 300)
        }
      }
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
  }

  const handleClear = () => {
    setPin('')
  }

  return (
    <div className="space-y-4">
      {/* PIN Display */}
      <div className="flex justify-center gap-2">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold"
          >
            {pin[i] ? '•' : ''}
          </div>
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            type="button"
            variant="outline"
            className="h-14 text-xl font-semibold"
            onClick={() => handleDigit(num.toString())}
            disabled={pin.length >= length}
          >
            {num}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          className="h-14"
          onClick={handleClear}
          disabled={pin.length === 0}
        >
          Clear
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-14 text-xl font-semibold"
          onClick={() => handleDigit('0')}
          disabled={pin.length >= length}
        >
          0
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-14"
          onClick={handleBackspace}
          disabled={pin.length === 0}
        >
          ⌫
        </Button>
      </div>
    </div>
  )
}
