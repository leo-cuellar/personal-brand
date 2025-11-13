"use client";

import { Icon } from "./Icon";

interface EditButtonProps {
    onClick?: () => void;
    className?: string;
}

export function EditButton({ onClick, className }: EditButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300 cursor-pointer ${className || ""}`}
            type="button"
        >
            <Icon name="edit" size={16} />
        </button>
    );
}

