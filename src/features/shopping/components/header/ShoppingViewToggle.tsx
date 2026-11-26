import { ShoppingView } from '../../../../core/domain/shopping';
import { ShoppingSegmented } from './ShoppingSegmented';

export interface ShoppingViewToggleProps {
    view: ShoppingView;
    onChange: (view: ShoppingView) => void;
}

const VIEWS = [
    { id: 'all', label: 'Tout' },
    { id: 'toBuy', label: 'À acheter' },
] as const;

export const ShoppingViewToggle = ({ view, onChange }: ShoppingViewToggleProps) => (
    <ShoppingSegmented options={VIEWS} value={view} onChange={onChange} ariaLabel="Lignes affichées" grow />
);
