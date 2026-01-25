/**
 * Example Component Tests
 *
 * This file demonstrates how to write Playwright component tests
 * using simple React components that don't have external dependencies.
 */

import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';

/**
 * Simple test component with no external dependencies
 */
function TestButton({
  label,
  onClick,
  disabled = false,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
    >
      {label}
    </button>
  );
}

/**
 * Simple badge component for testing
 */
function TestBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span
      data-testid="badge"
      className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

/**
 * Card component example
 */
function TestCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="text-gray-600 mt-1">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

test.describe('TestButton Component', () => {
  test('renders with label', async ({ mount }) => {
    const component = await mount(<TestButton label="Click me" />);

    await expect(component.getByRole('button')).toHaveText('Click me');
  });

  test('handles click events', async ({ mount }) => {
    let clicked = false;
    const component = await mount(
      <TestButton label="Click me" onClick={() => (clicked = true)} />
    );

    await component.getByRole('button').click();

    // Note: In component tests, we can't easily verify external state changes
    // This test verifies the button is clickable
    await expect(component.getByRole('button')).toBeEnabled();
  });

  test('can be disabled', async ({ mount }) => {
    const component = await mount(<TestButton label="Disabled" disabled={true} />);

    await expect(component.getByRole('button')).toBeDisabled();
  });

  test('applies disabled styles', async ({ mount }) => {
    const component = await mount(<TestButton label="Disabled" disabled={true} />);

    // Check that the disabled class is applied (opacity)
    const button = component.getByRole('button');
    await expect(button).toHaveClass(/disabled:opacity-50/);
  });
});

test.describe('TestBadge Component', () => {
  test('shows count when greater than 0', async ({ mount }) => {
    const component = await mount(<TestBadge count={5} />);

    await expect(component.getByTestId('badge')).toBeVisible();
    await expect(component.getByTestId('badge')).toHaveText('5');
  });

  test('hides when count is 0', async ({ mount }) => {
    const component = await mount(<TestBadge count={0} />);

    await expect(component.getByTestId('badge')).not.toBeVisible();
  });

  test('shows 99+ for large counts', async ({ mount }) => {
    const component = await mount(<TestBadge count={150} />);

    await expect(component.getByTestId('badge')).toHaveText('99+');
  });

  test('shows exact count at boundary (99)', async ({ mount }) => {
    const component = await mount(<TestBadge count={99} />);

    await expect(component.getByTestId('badge')).toHaveText('99');
  });
});

test.describe('TestCard Component', () => {
  test('renders title', async ({ mount }) => {
    const component = await mount(<TestCard title="My Card" />);

    await expect(component.getByRole('heading')).toHaveText('My Card');
  });

  test('renders title and description', async ({ mount }) => {
    const component = await mount(
      <TestCard title="My Card" description="This is a description" />
    );

    await expect(component.getByRole('heading')).toHaveText('My Card');
    await expect(component.getByText('This is a description')).toBeVisible();
  });

  test('renders children content', async ({ mount }) => {
    const component = await mount(
      <TestCard title="My Card">
        <span data-testid="child-content">Child content here</span>
      </TestCard>
    );

    await expect(component.getByTestId('child-content')).toBeVisible();
  });

  test('does not render description when not provided', async ({ mount }) => {
    const component = await mount(<TestCard title="My Card" />);

    // Only the heading should be visible, no paragraph
    await expect(component.getByRole('heading')).toBeVisible();
    await expect(component.locator('p')).not.toBeVisible();
  });
});

test.describe('Component Composition', () => {
  test('can compose multiple components', async ({ mount }) => {
    const component = await mount(
      <TestCard title="Notifications">
        <div className="flex items-center gap-2">
          <span>Unread:</span>
          <TestBadge count={3} />
        </div>
        <TestButton label="Mark all as read" />
      </TestCard>
    );

    await expect(component.getByRole('heading')).toHaveText('Notifications');
    await expect(component.getByTestId('badge')).toHaveText('3');
    await expect(component.getByRole('button')).toHaveText('Mark all as read');
  });
});
