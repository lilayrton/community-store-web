"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 hover:bg-blue-600 dark:hover:bg-zinc-800 rounded transition-colors flex items-center justify-between w-full text-blue-100 dark:text-zinc-300 hover:text-white"
        >
            <div className="flex items-center gap-2">
                {theme === "dark" ? (
                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                )}
                <span>{theme === "dark" ? "Modo Oscuro" : "Modo Claro"}</span>
            </div>
        </button>
    )
}
