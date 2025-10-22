'use client';

/**
 * Showcase component demonstrating all shared UI components
 * Use this as a reference for component usage
 */

import { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  StatusBadge,
  Alert,
  Loading,
  LoadingOverlay,
  Skeleton,
  SkeletonCard,
  EmptyState,
  NoData,
  NoResults,
  Tooltip,
  InfoTooltip,
  Dropdown,
  SelectDropdown,
  Tabs,
  Modal,
} from '@/components/shared';
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Settings,
  Users,
  BarChart,
  Calendar,
} from 'lucide-react';

export default function ComponentsShowcase() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Shared Components Showcase
        </h1>
        <p className="text-gray-600">
          A comprehensive showcase of all available UI components
        </p>
      </div>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Buttons</h2>
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" icon={Plus}>
                Primary
              </Button>
              <Button variant="secondary" icon={Edit}>
                Secondary
              </Button>
              <Button variant="success" icon={Download}>
                Success
              </Button>
              <Button variant="danger" icon={Trash2}>
                Danger
              </Button>
              <Button variant="ghost" icon={Settings}>
                Ghost
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button isLoading>Loading...</Button>
              <Button disabled>Disabled</Button>
              <Button fullWidth>Full Width</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Cards</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>This is a default card with shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Card content goes here.</p>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Bordered Card</CardTitle>
              <CardDescription>This card has a border instead of shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Card content goes here.</p>
            </CardContent>
          </Card>

          <Card variant="elevated" hoverable>
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Hover over this card to see the effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Card content goes here.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Badges</h2>
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="neutral">Neutral</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status="Sihat" />
              <StatusBadge status="Sederhana" />
              <StatusBadge status="Sakit" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Alerts */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Alerts</h2>
        <div className="space-y-3">
          <Alert variant="info" title="Information">
            This is an informational alert message.
          </Alert>
          <Alert variant="success" title="Success">
            Your changes have been saved successfully!
          </Alert>
          <Alert variant="warning" title="Warning">
            Please review the data before proceeding.
          </Alert>
          <Alert variant="danger" title="Error" onClose={() => {}}>
            An error occurred while processing your request.
          </Alert>
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Loading States</h2>
        <Card>
          <CardContent className="space-y-6">
            <div className="flex gap-6 items-center">
              <Loading variant="spinner" size="sm" />
              <Loading variant="spinner" size="md" />
              <Loading variant="spinner" size="lg" />
            </div>

            <div className="flex gap-6 items-center">
              <Loading variant="dots" size="md" />
              <Loading variant="pulse" size="md" />
            </div>

            <Loading text="Loading data..." />

            <div>
              <Button onClick={() => setLoading(!loading)}>
                Toggle Loading Overlay
              </Button>
              <LoadingOverlay loading={loading}>
                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                  Content under overlay
                </div>
              </LoadingOverlay>
            </div>

            <div className="space-y-2">
              <Skeleton width="w-full" height="h-4" />
              <Skeleton width="w-3/4" height="h-4" />
              <Skeleton width="w-1/2" height="h-4" />
            </div>

            <SkeletonCard lines={4} />
          </CardContent>
        </Card>
      </section>

      {/* Empty States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Empty States</h2>
        <Card>
          <CardContent>
            <EmptyState
              title="No items found"
              description="Get started by creating your first item."
              action={{
                label: 'Create Item',
                onClick: () => alert('Create clicked'),
                icon: Plus,
              }}
            />
          </CardContent>
        </Card>
      </section>

      {/* Tooltips */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Tooltips</h2>
        <Card>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Tooltip content="Tooltip on top" position="top">
                <Button>Top</Button>
              </Tooltip>
              <Tooltip content="Tooltip on bottom" position="bottom">
                <Button>Bottom</Button>
              </Tooltip>
              <Tooltip content="Tooltip on left" position="left">
                <Button>Left</Button>
              </Tooltip>
              <Tooltip content="Tooltip on right" position="right">
                <Button>Right</Button>
              </Tooltip>
            </div>

            <div>
              <InfoTooltip content="This is additional information" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Dropdowns */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Dropdowns</h2>
        <Card>
          <CardContent className="space-y-4">
            <Dropdown
              trigger={<Button icon={Settings}>Actions</Button>}
              items={[
                { label: 'Edit', value: 'edit', icon: Edit },
                { label: 'Delete', value: 'delete', icon: Trash2 },
                { label: 'Download', value: 'download', icon: Download },
              ]}
            />

            <SelectDropdown
              value={selectedValue}
              onChange={setSelectedValue}
              options={[
                { label: 'Option 1', value: '1' },
                { label: 'Option 2', value: '2' },
                { label: 'Option 3', value: '3' },
              ]}
              placeholder="Select an option"
            />
          </CardContent>
        </Card>
      </section>

      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Tabs</h2>
        <Tabs
          variant="default"
          tabs={[
            {
              id: 'users',
              label: 'Users',
              icon: Users,
              content: <div className="p-4">Users content</div>,
            },
            {
              id: 'analytics',
              label: 'Analytics',
              icon: BarChart,
              content: <div className="p-4">Analytics content</div>,
            },
            {
              id: 'schedule',
              label: 'Schedule',
              icon: Calendar,
              content: <div className="p-4">Schedule content</div>,
            },
          ]}
        />

        <Tabs
          variant="pills"
          tabs={[
            {
              id: 'tab1',
              label: 'Tab 1',
              content: <div className="p-4">Tab 1 content</div>,
            },
            {
              id: 'tab2',
              label: 'Tab 2',
              content: <div className="p-4">Tab 2 content</div>,
            },
          ]}
        />
      </section>

      {/* Modal */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Modal</h2>
        <Card>
          <CardContent>
            <Button onClick={() => setShowModal(true)}>Open Modal</Button>
            <Modal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title="Example Modal"
            >
              <div className="p-6 space-y-4">
                <p>This is a modal dialog with customizable content.</p>
                <Button onClick={() => setShowModal(false)}>Close</Button>
              </div>
            </Modal>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
