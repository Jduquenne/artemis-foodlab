import { LayoutList, UtensilsCrossed } from 'lucide-react';
import { ShoppingLayout } from '../../../../core/domain/shopping';
import { ShoppingSegmented } from './ShoppingSegmented';

export interface ShoppingLayoutToggleProps {
    layout: ShoppingLayout;
    onChange: (layout: ShoppingLayout) => void;
}

const LAYOUTS = [
    { id: 'aisles', label: 'Rayons', icon: LayoutList },
    { id: 'meals', label: 'Repas', icon: UtensilsCrossed },
] as const;

export const ShoppingLayoutToggle = ({ layout, onChange }: ShoppingLayoutToggleProps) => (
    <ShoppingSegmented options={LAYOUTS} value={layout} onChange={onChange} ariaLabel="Classement" compactLabels />
);
