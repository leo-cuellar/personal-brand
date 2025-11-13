"use client";

import { FaLinkedin } from "react-icons/fa";
import { ComponentProps } from "react";

// Type for any react-icons component
type IconComponent = typeof FaLinkedin;

// Map of icon names to their components
const iconMap = {
    linkedin: FaLinkedin,
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps extends Omit<ComponentProps<IconComponent>, "children" | "color"> {
    name: IconName;
    color?: string;
}

export function Icon({ name, color, ...props }: IconProps) {
    const IconComponent = iconMap[name];

    if (!IconComponent) {
        return null;
    }

    const style = color ? { color } : undefined;

    return <IconComponent style={style} {...props} />;
}

