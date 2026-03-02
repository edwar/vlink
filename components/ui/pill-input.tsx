import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PillInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "onKeyDown"> {
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
}

const PillInput = React.forwardRef<HTMLInputElement, PillInputProps>(
    ({ className, value, onChange, placeholder, ...props }, ref) => {
        const [inputValue, setInputValue] = React.useState("")
        const inputRef = React.useRef<HTMLInputElement>(null)

        // Merge refs
        React.useImperativeHandle(ref, () => inputRef.current!)

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if ((e.key === 'Enter' || e.key === 'Tab' || e.key === ',') && inputValue.trim()) {
                e.preventDefault()
                const newValue = inputValue.trim().replace(/,$/, '')
                if (newValue && !value.includes(newValue)) {
                    onChange([...value, newValue])
                }
                setInputValue("")
            } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
                e.preventDefault()
                onChange(value.slice(0, -1))
            }
        }

        const removePill = (indexToRemove: number) => {
            onChange(value.filter((_, index) => index !== indexToRemove))
        }

        return (
            <div
                className={cn(
                    "min-h-16 w-full rounded-2xl border-2 border-primary/5 bg-background/50 px-6 py-3 flex flex-wrap gap-2 items-center cursor-text transition-all",
                    "focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5",
                    className
                )}
                onClick={() => inputRef.current?.focus()}
            >
                {value.map((pill, index) => (
                    <div
                        key={index}
                        className="px-3 py-1 bg-primary text-primary-foreground border border-primary/20 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 animate-in zoom-in duration-300 shadow-sm"
                    >
                        {pill}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                removePill(index)
                            }}
                            className="hover:text-destructive-foreground/80 transition-colors shrink-0"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
                <input
                    {...props}
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent border-0 ring-0 focus:ring-0 outline-none text-xl md:text-sm font-black min-w-[120px] py-1 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground"
                />
            </div>
        )
    }
)

PillInput.displayName = "PillInput"

export { PillInput }
