"use client";

import { IconButton } from "./IconButton";

interface EditButtonProps {
    onClick?: () => void;
    className?: string;
}

export function EditButton({ onClick, className }: EditButtonProps) {
    return (
        <IconButton
            icon="edit"
            onClick={onClick}
            className={className}
        />
    );
}

