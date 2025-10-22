/**
 * Barrel export for all shared UI components
 * Import components using: import { Button, Card, Badge } from '@/components/shared';
 */

// Basic UI Components
export { default as Button } from './Button';
export { default as Modal } from './Modal';

// Form Components
export { default as FormInput } from './FormInput';
export { default as FormSelect } from './FormSelect';
export { default as FormTextarea } from './FormTextarea';

// Layout Components
export { default as Card } from './Card';
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

// Feedback Components
export { default as Alert } from './Alert';
export { AlertList } from './Alert';
export { default as Badge } from './Badge';
export { StatusBadge } from './Badge';
export { default as Loading } from './Loading';
export {
  LoadingOverlay,
  Skeleton,
  SkeletonCard,
  SkeletonTreeCard,
  SkeletonTableRow,
  SkeletonHealthRecord,
  SkeletonStatsCard,
  SkeletonDashboard
} from './Loading';
export { default as EmptyState } from './EmptyState';
export { NoData, NoResults } from './EmptyState';
export { default as Tooltip } from './Tooltip';
export { InfoTooltip } from './Tooltip';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ErrorFallback } from './ErrorFallback';
export { InlineError, ErrorMessage } from './ErrorFallback';

// Interactive Components
export { default as Dropdown } from './Dropdown';
export { SelectDropdown } from './Dropdown';
export { default as Tabs } from './Tabs';
export { ControlledTabs } from './Tabs';
export { default as Accordion } from './Accordion';
export { SimpleAccordion } from './Accordion';

// Navigation Components
export { default as Breadcrumb } from './Breadcrumb';
export { SimpleBreadcrumb } from './Breadcrumb';
export { default as Pagination } from './Pagination';
export { SimplePagination } from './Pagination';

// Data Display Components
export { default as Table } from './Table';
export { SimpleTable } from './Table';
export type { Column } from './Table';

// Input Components
export { default as SearchInput } from './SearchInput';
export { SearchBar } from './SearchInput';

// Mobile Components
export { default as MobileTable } from './MobileTable';
export { ResponsiveTable } from './MobileTable';
export { default as MobileForm } from './MobileForm';
export { MobileFormSection, MobileFormGroup, MobileFormField } from './MobileForm';
export { default as MobileNav } from './MobileNav';
export { BottomNav } from './MobileNav';

// Toast Components
export { default as CustomToast } from './Toast';
export { showCustomSuccess, showCustomError, showCustomWarning, showCustomInfo } from './Toast';
