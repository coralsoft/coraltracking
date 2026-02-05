import { cn } from '@/lib/utils';

interface TagChipProps {
    label: string;
    selected?: boolean;
    onClick?: () => void;
    color?: string | null;
    className?: string;
    /** When true, chip is not clickable (display only). */
    static?: boolean;
}

export const TAG_COLOR_OPTIONS = [
    { key: 'blue', label: 'Azul', hex: '#3b82f6' },
    { key: 'red', label: 'Rojo', hex: '#ef4444' },
    { key: 'green', label: 'Verde', hex: '#22c55e' },
    { key: 'amber', label: 'Ámbar', hex: '#f59e0b' },
    { key: 'violet', label: 'Violeta', hex: '#8b5cf6' },
    { key: 'cyan', label: 'Cian', hex: '#06b6d4' },
] as const;

type ColorKey = (typeof TAG_COLOR_OPTIONS)[number]['key'];

function colorToKey(color: string | null | undefined): ColorKey {
    if (!color) return 'blue';
    const lower = color.toLowerCase();
    if (lower.includes('red')) return 'red';
    if (lower.includes('green') || lower.includes('emerald')) return 'green';
    if (lower.includes('amber') || lower.includes('yellow')) return 'amber';
    if (lower.includes('violet') || lower.includes('purple')) return 'violet';
    if (lower.includes('cyan')) return 'cyan';
    return 'blue';
}

export function TagChip({ label, selected = false, onClick, color, className, static: isStatic }: TagChipProps) {
    const colorKey = colorToKey(color);
    const isClickable = !isStatic && onClick != null;

    const handleClose = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
    };

    const handleClick = () => {
        if (!isClickable) return;
        onClick?.();
    };

    return (
        <span
            role={isClickable ? 'checkbox' : undefined}
            aria-checked={isClickable ? selected : undefined}
            aria-label={isClickable ? `${label}${selected ? ', seleccionado' : ''}` : undefined}
            onClick={isClickable ? handleClick : undefined}
            className={cn(
                'tag-chip',
                isClickable && 'tag-chip--clickable',
                isClickable && !selected && 'tag-chip--unselected',
                (selected || isStatic) && `tag-chip--${colorKey}`,
                className,
            )}
        >
            <span className="select-none">{label}</span>
            {isClickable && selected && (
                <button
                    type="button"
                    className="tag-chip-close"
                    onClick={handleClose}
                    aria-label={`Quitar ${label}`}
                    title={`Quitar ${label}`}
                >
                    ×
                </button>
            )}
        </span>
    );
}
