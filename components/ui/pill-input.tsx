import * as React from "react"
import { X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface PillInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "onKeyDown"> {
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

        const addPill = () => {
            const newValue = inputValue.trim().replace(/,$/, '')
            if (newValue && !value.includes(newValue)) {
                onChange([...value, newValue])
            }
            setInputValue("")
        }

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if ((e.key === 'Enter' || e.key === 'Tab' || e.key === ',') && inputValue.trim()) {
                e.preventDefault()
                addPill()
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
        role="presentation"
        className={cn(
            "flex min-h-12 w-full flex-wrap items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm shadow-xs transition-[color,box-shadow] cursor-text",
            "focus-within:border-primary",
            className
        )}
                onClick={() => inputRef.current?.focus()}
                onKeyDown={() => inputRef.current?.focus()}
            >
                {value.map((pill, index) => (
                    <div
                        key={pill}
                        className="px-3 py-1 bg-primary text-primary-foreground border border-primary/20 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 animate-in zoom-in duration-300 shadow-sm"
                    >
                        {pill}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                removePill(index)
                            }}
                            className="hover:text-destructive-foreground/80 transition-colors shrink-0 p-1 -m-1"
                        >
                            <X className="h-3.5 w-3.5" />
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
                    onBlur={() => {
                        if (inputValue.trim()) addPill()
                    }}
                    enterKeyHint="done"
                    autoCapitalize="sentences"
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent border-0 ring-0 focus:ring-0 outline-none text-sm font-black min-w-[120px] py-1 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground"
                />
                {inputValue.trim() && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            addPill()
                            inputRef.current?.focus()
                        }}
                        className="h-8 w-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center hover:bg-primary/30 active:scale-90 transition-all animate-in fade-in zoom-in duration-300"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                )}
            </div>
        )
    }
)

PillInput.displayName = "PillInput"

export { PillInput }
