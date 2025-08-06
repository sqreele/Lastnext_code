# Property Selection Components

This document describes the property selection components created for the maintenance job management system.

## Overview

The property selection system consists of several reusable components that allow users to select and switch between properties when creating maintenance jobs. These components are designed to work with the Zustand property store and provide a consistent user experience across the application.

## Components

### 1. PropertySelector

A form-based property selection component that can be used in forms and dialogs.

**Location:** `app/components/ui/PropertySelector.tsx`

**Props:**
- `value?: string` - The currently selected property ID
- `onValueChange: (value: string) => void` - Callback when property selection changes
- `placeholder?: string` - Placeholder text (default: "Select a property")
- `showLabel?: boolean` - Whether to show the label (default: true)
- `label?: string` - Label text (default: "Property")
- `className?: string` - Additional CSS classes
- `disabled?: boolean` - Whether the selector is disabled

**Usage:**
```tsx
import PropertySelector from '@/app/components/ui/PropertySelector';

<PropertySelector
  value={selectedProperty}
  onValueChange={setSelectedProperty}
  placeholder="Choose a property"
  label="Property *"
/>
```

### 2. PropertyHeader

A header component that displays the current property with a dropdown to switch between properties.

**Location:** `app/components/ui/PropertyHeader.tsx`

**Props:**
- `className?: string` - Additional CSS classes
- `showPropertyCount?: boolean` - Whether to show the property count badge (default: true)

**Usage:**
```tsx
import PropertyHeader from '@/app/components/ui/PropertyHeader';

<PropertyHeader showPropertyCount={true} />
```

### 3. PropertySwitcher

A compact property switcher component with multiple variants for different use cases.

**Location:** `app/components/ui/PropertySwitcher.tsx`

**Props:**
- `variant?: 'default' | 'compact' | 'minimal'` - Visual variant (default: 'default')
- `className?: string` - Additional CSS classes
- `showLabel?: boolean` - Whether to show the property name (default: true)

**Variants:**
- `default` - Full property name with count badge
- `compact` - Truncated property name
- `minimal` - Icon only

**Usage:**
```tsx
import PropertySwitcher from '@/app/components/ui/PropertySwitcher';

// Default variant
<PropertySwitcher variant="default" />

// Compact variant for navigation
<PropertySwitcher variant="compact" />

// Minimal variant for tight spaces
<PropertySwitcher variant="minimal" />
```

## Property Store

The components use the Zustand property store for state management.

**Location:** `app/lib/stores/propertyStore.ts`

**Key Methods:**
- `selectedProperty: string | null` - Currently selected property ID
- `userProperties: Property[]` - Array of user's properties
- `setSelectedProperty: (propertyId: string | null) => void` - Set selected property
- `setUserProperties: (properties: Property[]) => void` - Set user properties
- `clearProperties: () => void` - Clear all properties
- `selectFirstProperty: () => void` - Auto-select first property

## Updated Create Job Page

The main create job page has been updated to provide a better user experience:

**Location:** `app/dashboard/createJob/page.tsx`

**Features:**
- Automatic property selection when only one property is available
- Clear property selection interface when multiple properties exist
- Proper error handling for users with no properties
- Integration with the property store
- Responsive design with proper loading states

## Example Page

A comprehensive example page demonstrates all components:

**Location:** `app/dashboard/createJob/example.tsx`

**Features:**
- Demo of all property selection components
- Interactive property switching
- Maintenance job form integration
- Property information display
- Various UI states (no properties, property selection required, etc.)

## Usage Patterns

### 1. Form Integration

Use `PropertySelector` in forms where property selection is required:

```tsx
<PropertySelector
  value={selectedProperty}
  onValueChange={setSelectedProperty}
  label="Property *"
  placeholder="Select a property"
/>
```

### 2. Navigation Header

Use `PropertySwitcher` in navigation headers for quick property switching:

```tsx
<div className="flex items-center gap-4">
  <PropertySwitcher variant="compact" />
  <nav>...</nav>
</div>
```

### 3. Dashboard Layout

Use `PropertyHeader` in dashboard layouts to show current property:

```tsx
<header className="flex items-center justify-between">
  <PropertyHeader />
  <UserMenu />
</header>
```

## Error States

All components handle various error states gracefully:

1. **No Properties Available**
   - Shows appropriate message
   - Disables interaction
   - Provides guidance to contact administrator

2. **Single Property**
   - Auto-selects the property
   - Shows property name without dropdown
   - Simplifies the interface

3. **Multiple Properties**
   - Shows dropdown with all properties
   - Highlights currently selected property
   - Allows easy switching

## Styling

Components use Tailwind CSS classes and follow the design system:

- Consistent spacing and typography
- Proper color schemes for different states
- Responsive design patterns
- Accessibility features (proper labels, ARIA attributes)

## Integration with CreateJobForm

The `CreateJobForm` component has been updated to:

- Accept a `propertyId` prop
- Use the property store for state management
- Provide better validation
- Show appropriate error messages

## Best Practices

1. **Always check for property availability** before showing forms
2. **Auto-select single properties** to reduce user friction
3. **Provide clear feedback** when property selection is required
4. **Use appropriate variants** based on available space
5. **Handle loading states** properly
6. **Validate property selection** before form submission

## Future Enhancements

Potential improvements for the property selection system:

1. **Property search/filtering** for users with many properties
2. **Property favorites** for quick access
3. **Property grouping** by type or location
4. **Recent properties** for quick switching
5. **Property permissions** validation
6. **Offline property caching** for better performance