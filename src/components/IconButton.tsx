"use client";

import { Icon } from "./Icon";
import { IconName } from "./Icon";

interface IconButtonProps {
    icon: IconName;
    onClick?: () => void;
    iconColor?: string;
    backgroundColor?: string;
    hoverBackgroundColor?: string;
    size?: number;
    className?: string;
}

export function IconButton({
    icon,
    onClick,
    iconColor = "#6b7280",
    backgroundColor = "#e5e7eb",
    hoverBackgroundColor = "#d1d5db",
    size = 16,
    className,
}: IconButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors cursor-pointer ${className || ""}`}
            style={{
                backgroundColor,
                color: iconColor,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = hoverBackgroundColor;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = backgroundColor;
            }}
            type="button"
        >
            <Icon name={icon} size={size} color={iconColor} />
        </button>
    );
}

