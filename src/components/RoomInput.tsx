import { useEffect, useRef, useState } from 'react'

type RoomInputProps = {
  value: string
  rooms: string[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function RoomInput({ value, rooms, onChange, placeholder = 'Room', className = '' }: RoomInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filterText, setFilterText] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const query = filterText ?? value
  const filtered = rooms.filter(
    (room) => room.toLowerCase().includes(query.toLowerCase()) && room !== value,
  )

  const showDropdown = isOpen && filtered.length > 0

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setFilterText(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectRoom = (room: string) => {
    onChange(room)
    setFilterText(null)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleInputChange = (text: string) => {
    onChange(text)
    setFilterText(text)
    setIsOpen(true)
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
      setFilterText(null)
      inputRef.current?.blur()
    }
  }

  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false)
      setFilterText(null)
    } else {
      setFilterText('')
      setIsOpen(true)
      inputRef.current?.focus()
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex">
        <input
          ref={inputRef}
          className="input input-bordered input-sm w-full rounded-r-none"
          placeholder={placeholder}
          value={value}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <button
          type="button"
          className="btn btn-bordered btn-sm rounded-l-none border border-l-0 border-base-300 px-1.5"
          tabIndex={-1}
          onClick={toggleDropdown}
          aria-label="Show room suggestions"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {showDropdown && (
        <ul className="menu menu-sm absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-box border border-base-300 bg-base-100 p-1 shadow-lg">
          {filtered.map((room) => (
            <li key={room}>
              <button type="button" onClick={() => selectRoom(room)}>
                {room}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RoomInput
