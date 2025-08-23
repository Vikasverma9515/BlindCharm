import { cn } from "@/lib/utils"

interface SettingsItemProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  onClick?: () => void
  danger?: boolean
  children?: React.ReactNode
}

export function SettingsItem({
  icon,
  title,
  subtitle,
  onClick,
  danger,
  children,
}: SettingsItemProps) {
  const Wrapper = onClick ? "button" : "div"

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "flex items-center justify-between w-full p-4 rounded-xl transition hover:bg-gray-50 dark:hover:bg-gray-800",
        danger &&
          "border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20"
      )}
    >
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800",
            danger && "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          )}
        >
          {icon}
        </div>
        <div className="text-left">
          <p
            className={cn(
              "text-sm font-medium",
              danger ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"
            )}
          >
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>

      {/* 👉 if children passed, render them on the right side */}
      {children}
    </Wrapper>
  )
}
