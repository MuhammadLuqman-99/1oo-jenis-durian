# Data Validation Guide

## Overview

Your Durian Farm Management System now has comprehensive **data validation** using Zod schemas. This prevents users from entering invalid data like negative stock, future harvest dates, or garbage values.

---

## What's Implemented

### Validation Schemas (`lib/validationSchemas.ts`)

Comprehensive validation for all data types:

- **Tree Management**: Variety names, planting dates, heights, health status
- **Health Records**: Dates, symptoms, treatments, inspector names
- **Inventory**: Stock quantities, costs, expiry dates, suppliers
- **E-Commerce**: Products, orders, reviews, customer info
- **User Management**: Names, emails, phone numbers, roles
- **Activities & Tasks**: Descriptions, dates, priorities, assignments
- **Financial**: Expenses, revenue, payment methods

### Form Validation Hook (`hooks/useFormValidation.ts`)

Enhanced with:
- Real-time validation on blur
- Submit validation
- Field-level validation
- Loading and submitting states
- Error management
- Touch tracking

### Validated Components (`components/shared/`)

Pre-built components with validation UI:
- `ValidatedInput` - Text inputs with error display
- `ValidatedTextarea` - Multi-line inputs with character count
- `ValidatedSelect` - Dropdowns with validation

---

## How to Use Validation

### Step 1: Import the Schema

```typescript
import { InventoryItemSchema, validateData } from '@/lib/validationSchemas';
import { useFormValidation } from '@/hooks/useFormValidation';
```

### Step 2: Initialize Form with Validation

```typescript
const {
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleSubmit,
  getFieldError,
  isSubmitting,
} = useFormValidation(
  {
    name: '',
    currentStock: 0,
    unitCost: 0,
    expiryDate: '',
  },
  InventoryItemSchema // Pass the schema here
);
```

### Step 3: Use Validated Components

```typescript
import ValidatedInput from '@/components/shared/ValidatedInput';
import ValidatedSelect from '@/components/shared/ValidatedSelect';

<ValidatedInput
  label="Item Name"
  name="name"
  value={values.name}
  onChange={(e) => handleChange('name', e.target.value)}
  onBlur={() => handleBlur('name')}
  error={getFieldError('name')}
  touched={touched.name}
  required
  helperText="Enter a descriptive name for the item"
/>

<ValidatedInput
  label="Stock Quantity"
  name="currentStock"
  type="number"
  min="0"
  value={values.currentStock}
  onChange={(e) => handleChange('currentStock', parseFloat(e.target.value))}
  onBlur={() => handleBlur('currentStock')}
  error={getFieldError('currentStock')}
  touched={touched.currentStock}
  required
/>

<ValidatedSelect
  label="Category"
  name="category"
  value={values.category}
  onChange={(e) => handleChange('category', e.target.value)}
  onBlur={() => handleBlur('category')}
  error={getFieldError('category')}
  touched={touched.category}
  required
  options={[
    { value: 'fertilizer', label: 'Fertilizer' },
    { value: 'pesticide', label: 'Pesticide' },
    { value: 'tool', label: 'Tool' },
  ]}
/>
```

### Step 4: Handle Form Submission

```typescript
<form onSubmit={handleSubmit(async (data) => {
  try {
    // Data is already validated here!
    await addInventoryItem(data);
    showSuccess('Item added successfully');
  } catch (error) {
    showError('Failed to add item');
  }
})}>
  {/* Form fields */}

  <button
    type="submit"
    disabled={isSubmitting}
    className="btn-primary"
  >
    {isSubmitting ? 'Saving...' : 'Save Item'}
  </button>
</form>
```

---

## Validation Examples

### Example 1: Preventing Negative Stock

**Before** (No Validation):
```typescript
currentStock: -100 // ✅ Accepted (BAD!)
```

**After** (With Validation):
```typescript
currentStock: -100 // ❌ Error: "Stock cannot be negative"
```

**Schema:**
```typescript
currentStock: z.number()
  .min(0, "Stock cannot be negative")
  .max(1000000, "Stock quantity seems unrealistic")
```

### Example 2: Validating Dates

**Before** (No Validation):
```typescript
harvestDate: '2050-12-31' // ✅ Accepted (BAD!)
```

**After** (With Validation):
```typescript
harvestDate: '2050-12-31' // ❌ Error: "Harvest date cannot be in the future"
```

**Schema:**
```typescript
lastHarvestDate: z.string()
  .refine((date) => {
    const harvest = new Date(date);
    const now = new Date();
    return harvest <= now;
  }, "Last harvest date cannot be in the future")
```

### Example 3: Validating Text Input

**Before** (No Validation):
```typescript
variety: 'banana' // ✅ Accepted in durian tree form (BAD!)
variety: '!!!###' // ✅ Accepted (BAD!)
```

**After** (With Validation):
```typescript
variety: 'banana' // Still accepted (it's valid text)
variety: '!!!###' // ❌ Error: "Only letters, numbers, spaces, and hyphens allowed"
```

**Schema:**
```typescript
variety: z.string()
  .min(1, "Variety is required")
  .max(50, "Variety name too long")
  .regex(/^[a-zA-Z0-9\s-]+$/, "Only letters, numbers, spaces, and hyphens allowed")
```

### Example 4: Malaysian Phone Number

**Before** (No Validation):
```typescript
phone: '123' // ✅ Accepted (BAD!)
```

**After** (With Validation):
```typescript
phone: '012-3456789' // ✅ Valid
phone: '+60123456789' // ✅ Valid
phone: '123' // ❌ Error: "Invalid Malaysian phone number"
```

**Schema:**
```typescript
customerPhone: z.string()
  .regex(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/, "Invalid Malaysian phone number")
```

### Example 5: Price Validation

**Before** (No Validation):
```typescript
price: 0 // ✅ Accepted (BAD!)
price: -50 // ✅ Accepted (BAD!)
```

**After** (With Validation):
```typescript
price: 15.50 // ✅ Valid
price: 0 // ❌ Error: "Price must be greater than 0"
price: -50 // ❌ Error: "Price must be greater than 0"
```

**Schema:**
```typescript
price: z.number()
  .min(0.01, "Price must be greater than 0")
  .max(100000, "Price seems unrealistic")
```

---

## All Available Schemas

| Schema | Use Case | Key Validations |
|--------|----------|-----------------|
| `TreeSchema` | Adding/editing trees | Variety name, planting date, height, age |
| `HealthRecordSchema` | Health inspections | Date range, symptoms, photos limit (5) |
| `InventoryItemSchema` | Inventory management | Stock >= 0, expiry date, unit cost > 0 |
| `StockMovementSchema` | Stock adjustments | Quantity > 0, date within last month |
| `ProductSchema` | E-commerce products | Price > 0, stock >= 0, images (1-10) |
| `OrderSchema` | Customer orders | Email, phone, Malaysian address, items |
| `ReviewSchema` | Product reviews | Rating (1-5), comment length (10-1000) |
| `UserProfileSchema` | User accounts | Name, email, phone, role |
| `LoginSchema` | Authentication | Email format, password length |
| `RegisterSchema` | New accounts | Password strength, confirmation match |
| `ActivitySchema` | Farm activities | Date range, duration, cost |
| `TaskSchema` | Task scheduling | Due date, priority, status |
| `ExpenseSchema` | Financial tracking | Amount > 0, payment method |
| `RevenueSchema` | Income tracking | Amount > 0, source, date |

---

## Real-World Scenarios

### Scenario 1: Adding Inventory Item

**User tries to add fertilizer with:**
- Name: "NPK 15-15-15" ✅
- Stock: -5 ❌
- Unit Cost: 0 ❌
- Expiry: "2020-01-01" ❌

**Validation prevents submission and shows:**
1. "Stock cannot be negative" - at stock field
2. "Cost must be greater than 0" - at cost field
3. "Expiry date must be in the future" - at expiry field

**User corrects to:**
- Stock: 50 ✅
- Unit Cost: 25.00 ✅
- Expiry: "2025-12-31" ✅

**Form submits successfully!**

### Scenario 2: Creating Customer Order

**User enters:**
- Email: "invalid-email" ❌
- Phone: "123" ❌
- State: "California" ❌
- Postal Code: "ABC123" ❌

**Validation shows:**
1. "Invalid email format"
2. "Invalid Malaysian phone number (e.g., 012-3456789)"
3. "Invalid Malaysian state" (dropdown only shows valid states)
4. "Postal code must be 5 digits"

### Scenario 3: Recording Tree Health

**User tries to:**
- Add 10 photos ❌ (max 5)
- Set inspection date to next year ❌
- Leave inspector name empty ❌

**Validation prevents:**
1. More than 5 photos from being uploaded
2. Future dates from being selected
3. Form submission without inspector name

---

## Validation Error Messages

### User-Friendly Messages

All error messages are clear and actionable:

❌ **Bad**: "Invalid input"
✅ **Good**: "Stock cannot be negative"

❌ **Bad**: "Error"
✅ **Good**: "Expiry date must be in the future and within 20 years"

❌ **Bad**: "Regex failed"
✅ **Good**: "Only letters, numbers, spaces, and hyphens allowed"

### Contextual Help

Each field can show:
- **Error message** (red, with icon) - when validation fails
- **Helper text** (gray) - guidance on what to enter
- **Character count** - for text areas with limits

---

## Best Practices

### 1. Validate on Blur
```typescript
onBlur={() => handleBlur('fieldName')}
```
Shows errors after user leaves the field, not while typing.

### 2. Clear Errors on Change
The hook automatically clears errors when user starts typing.

### 3. Show Required Fields
```typescript
<ValidatedInput required label="Field Name" />
```
Adds red asterisk (*) to label.

### 4. Disable Submit While Validating
```typescript
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</button>
```

### 5. Provide Helper Text
```typescript
<ValidatedInput
  helperText="Enter quantity in kilograms"
  label="Weight"
/>
```

---

## Testing Validation

### Manual Testing Checklist

#### Inventory Form
- [ ] Try entering -100 for stock → Should show error
- [ ] Try entering 0 for unit cost → Should show error
- [ ] Try setting expiry date to yesterday → Should show error
- [ ] Try entering 9999999999 for stock → Should show "unrealistic" error
- [ ] Enter valid data → Should submit successfully

#### Tree Form
- [ ] Try setting planted date to 2050 → Should show error
- [ ] Try entering 150 for height → Should show error
- [ ] Try setting age to -5 → Should show error
- [ ] Select invalid health status → Dropdown prevents selection
- [ ] Enter valid data → Should submit successfully

#### Order Form
- [ ] Try "not-an-email" in email field → Should show error
- [ ] Try "123" in phone field → Should show error
- [ ] Try "99999" as postal code → Invalid state selection prevented
- [ ] Enter valid Malaysian address → Should submit successfully

---

## Customizing Validation

### Adding New Validation Rules

```typescript
// In lib/validationSchemas.ts

export const CustomSchema = z.object({
  customField: z.string()
    .min(5, "Must be at least 5 characters")
    .max(100, "Too long")
    .regex(/^[A-Z]/, "Must start with uppercase letter")
    .refine((val) => !val.includes('banned'), "Contains banned word"),
});
```

### Complex Validation

```typescript
export const OrderSchema = z.object({
  quantity: z.number().min(1),
  price: z.number().min(0),
}).refine((data) => data.quantity * data.price < 100000, {
  message: "Total order value too high",
  path: ["quantity"], // Shows error on quantity field
});
```

---

## Migration Guide

### Updating Existing Forms

**Before:**
```typescript
const [name, setName] = useState('');
const [stock, setStock] = useState(0);

<input value={name} onChange={(e) => setName(e.target.value)} />
<input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
```

**After:**
```typescript
const form = useFormValidation(
  { name: '', stock: 0 },
  InventoryItemSchema
);

<ValidatedInput
  name="name"
  value={form.values.name}
  onChange={(e) => form.handleChange('name', e.target.value)}
  onBlur={() => form.handleBlur('name')}
  error={form.getFieldError('name')}
  touched={form.touched.name}
/>
<ValidatedInput
  type="number"
  name="stock"
  value={form.values.stock}
  onChange={(e) => form.handleChange('stock', parseFloat(e.target.value))}
  onBlur={() => form.handleBlur('stock')}
  error={form.getFieldError('stock')}
  touched={form.touched.stock}
/>
```

---

## FAQ

**Q: Can I have custom validation per form?**
A: Yes! Pass a custom schema to `useFormValidation` or call `validate(customSchema)`.

**Q: What happens if validation fails on submit?**
A: The form won't submit, and all errors will be shown. The form will scroll to the first error.

**Q: Can I validate without using the hook?**
A: Yes! Use `validateData(schema, data)` for one-time validation.

**Q: How do I validate nested objects?**
A: Zod supports nested schemas. The error path will be like "address.street".

**Q: Can I add async validation (e.g., check if email exists)?**
A: Yes! Use `.refine()` with an async function in your schema.

---

## Summary

### Problem Solved
✅ No more negative stock values
✅ No more future harvest dates
✅ No more invalid email addresses
✅ No more garbage data in forms
✅ No more unrealistic values
✅ Better user experience with clear error messages

### Implementation Status
✅ Comprehensive validation schemas
✅ Enhanced form validation hook
✅ Reusable validated input components
✅ Real-time validation feedback
✅ Submit-time validation
✅ User-friendly error messages

### Next Steps
1. Update existing forms to use validation components
2. Test all forms with invalid data
3. Add custom validation rules as needed
4. Monitor user feedback on validation messages

---

**Version**: 1.0
**Date**: 2025-01-22
**Status**: ✅ Complete and Ready to Use
