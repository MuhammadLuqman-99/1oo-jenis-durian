'use client';

/**
 * Example component demonstrating usage of custom hooks
 * This file shows best practices for using the hooks library
 */

import { useState } from 'react';
import {
  useForm,
  useLocalStorage,
  useDebounce,
  useAsync,
  useToggle,
  useIsMobile,
} from '@/hooks';
import { z } from 'zod';
import { getAllTrees } from '@/lib/firebaseService';
import Button from '@/components/shared/Button';
import FormInput from '@/components/shared/FormInput';
import Modal from '@/components/shared/Modal';

// Example 1: useForm hook
const ExampleFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ExampleFormData = z.infer<typeof ExampleFormSchema>;

function FormExample() {
  const { values, errors, handleChange, handleSubmit, reset } = useForm<ExampleFormData>({
    initialValues: {
      name: '',
      email: '',
      message: '',
    },
    onSubmit: async (values) => {
      console.log('Form submitted:', values);
      // Handle form submission
    },
  });

  return (
    <form onSubmit={(e) => handleSubmit(e, ExampleFormSchema)} className="space-y-4">
      <FormInput
        label="Name"
        value={values.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
      />
      <FormInput
        label="Email"
        type="email"
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        required
      />
      <FormInput
        label="Message"
        value={values.message}
        onChange={(e) => handleChange('message', e.target.value)}
        error={errors.message}
        required
      />
      <div className="flex gap-2">
        <Button type="submit" variant="primary">
          Submit
        </Button>
        <Button type="button" variant="secondary" onClick={reset}>
          Reset
        </Button>
      </div>
    </form>
  );
}

// Example 2: useLocalStorage hook
function LocalStorageExample() {
  const [preference, setPreference, removePreference] = useLocalStorage('userPreference', 'light');

  return (
    <div className="space-y-2">
      <p>Current preference: {preference}</p>
      <div className="flex gap-2">
        <Button onClick={() => setPreference('light')} variant="secondary">
          Light Mode
        </Button>
        <Button onClick={() => setPreference('dark')} variant="secondary">
          Dark Mode
        </Button>
        <Button onClick={removePreference} variant="danger">
          Clear
        </Button>
      </div>
    </div>
  );
}

// Example 3: useDebounce hook
function SearchExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // This effect will only run when debouncedSearchTerm changes
  // which is 500ms after the user stops typing
  return (
    <div className="space-y-2">
      <FormInput
        label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Type to search..."
      />
      <p className="text-sm text-gray-600">
        Searching for: {debouncedSearchTerm || '(empty)'}
      </p>
    </div>
  );
}

// Example 4: useAsync hook
function AsyncExample() {
  const { data, error, loading, execute } = useAsync(getAllTrees, {
    onSuccess: (data) => {
      console.log('Trees loaded:', data);
    },
    onError: (error) => {
      console.error('Failed to load trees:', error);
    },
  });

  return (
    <div className="space-y-4">
      <Button onClick={execute} disabled={loading} variant="primary">
        {loading ? 'Loading...' : 'Load Trees'}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          Error: {error}
        </div>
      )}

      {data && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
          Loaded {data.length} trees
        </div>
      )}
    </div>
  );
}

// Example 5: useToggle hook
function ToggleExample() {
  const [isOpen, { toggle, setTrue, setFalse }] = useToggle(false);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={toggle} variant="primary">
          Toggle
        </Button>
        <Button onClick={setTrue} variant="success">
          Open
        </Button>
        <Button onClick={setFalse} variant="danger">
          Close
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={setFalse} title="Example Modal">
        <div className="p-6">
          <p>This modal was opened using the useToggle hook!</p>
        </div>
      </Modal>
    </div>
  );
}

// Example 6: useMediaQuery hook
function ResponsiveExample() {
  const isMobile = useIsMobile();

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <p className="text-lg font-semibold">
        Current device: {isMobile ? 'Mobile' : 'Desktop/Tablet'}
      </p>
      <p className="text-sm text-gray-600 mt-2">
        Resize your browser window to see this change!
      </p>
    </div>
  );
}

// Main component showcasing all examples
export default function HooksExample() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Custom Hooks Examples</h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">1. useForm Hook</h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <FormExample />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">2. useLocalStorage Hook</h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <LocalStorageExample />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">3. useDebounce Hook</h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <SearchExample />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">4. useAsync Hook</h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <AsyncExample />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">5. useToggle Hook</h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ToggleExample />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">6. useMediaQuery Hook</h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ResponsiveExample />
        </div>
      </section>
    </div>
  );
}
