import { z } from 'zod';

// ============================================
// TREE MANAGEMENT VALIDATION
// ============================================

export const TreeSchema = z.object({
  variety: z.string()
    .min(1, "Variety is required")
    .max(50, "Variety name too long")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Only letters, numbers, spaces, and hyphens allowed"),

  location: z.string()
    .min(1, "Location is required")
    .max(100, "Location description too long"),

  plantedDate: z.string()
    .refine((date) => {
      const planted = new Date(date);
      const now = new Date();
      const minDate = new Date('1900-01-01');
      return planted <= now && planted >= minDate;
    }, "Planted date must be in the past and after 1900"),

  age: z.number()
    .min(0, "Age cannot be negative")
    .max(200, "Age seems unrealistic"),

  height: z.number()
    .min(0, "Height cannot be negative")
    .max(100, "Height must be less than 100 meters"),

  healthStatus: z.enum(['healthy', 'sick', 'recovering', 'dead'], {
    errorMap: () => ({ message: "Invalid health status" })
  }),

  lastHarvestDate: z.string().optional()
    .refine((date) => {
      if (!date) return true;
      const harvest = new Date(date);
      const now = new Date();
      return harvest <= now;
    }, "Last harvest date cannot be in the future"),

  estimatedYield: z.number()
    .min(0, "Yield cannot be negative")
    .max(10000, "Yield seems unrealistic"),

  notes: z.string()
    .max(1000, "Notes too long (max 1000 characters)")
    .optional(),
});

export const HealthRecordSchema = z.object({
  treeId: z.string()
    .min(1, "Tree ID is required"),

  date: z.string()
    .refine((date) => {
      const recordDate = new Date(date);
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return recordDate <= now && recordDate >= oneYearAgo;
    }, "Date must be within the last year and not in the future"),

  healthStatus: z.enum(['healthy', 'sick', 'recovering', 'dead']),

  symptoms: z.array(z.string())
    .max(20, "Too many symptoms selected"),

  treatment: z.string()
    .max(500, "Treatment description too long")
    .optional(),

  notes: z.string()
    .max(1000, "Notes too long")
    .optional(),

  inspectedBy: z.string()
    .min(1, "Inspector name is required")
    .max(100, "Inspector name too long"),

  photos: z.array(z.string())
    .max(5, "Maximum 5 photos allowed"),
});

// ============================================
// INVENTORY MANAGEMENT VALIDATION
// ============================================

export const InventoryItemSchema = z.object({
  name: z.string()
    .min(1, "Item name is required")
    .max(100, "Item name too long")
    .regex(/^[a-zA-Z0-9\s-().,]+$/, "Invalid characters in item name"),

  category: z.enum(['fertilizer', 'pesticide', 'tool', 'equipment', 'supply', 'other'], {
    errorMap: () => ({ message: "Invalid category" })
  }),

  currentStock: z.number()
    .min(0, "Stock cannot be negative")
    .max(1000000, "Stock quantity seems unrealistic"),

  unit: z.string()
    .min(1, "Unit is required")
    .max(20, "Unit name too long"),

  minStock: z.number()
    .min(0, "Minimum stock cannot be negative")
    .max(1000000, "Minimum stock seems unrealistic"),

  unitCost: z.number()
    .min(0.01, "Cost must be greater than 0")
    .max(1000000, "Cost seems unrealistic"),

  supplier: z.string()
    .max(100, "Supplier name too long")
    .optional(),

  expiryDate: z.string().optional()
    .refine((date) => {
      if (!date) return true;
      const expiry = new Date(date);
      const now = new Date();
      const maxDate = new Date();
      maxDate.setFullYear(now.getFullYear() + 20);
      return expiry > now && expiry < maxDate;
    }, "Expiry date must be in the future and within 20 years"),

  location: z.string()
    .max(100, "Location description too long")
    .optional(),

  notes: z.string()
    .max(500, "Notes too long")
    .optional(),
}).refine((data) => data.minStock <= data.currentStock * 2, {
  message: "Minimum stock seems too high compared to current stock",
  path: ["minStock"],
});

export const StockMovementSchema = z.object({
  itemId: z.string()
    .min(1, "Item ID is required"),

  type: z.enum(['in', 'out', 'adjustment'], {
    errorMap: () => ({ message: "Invalid movement type" })
  }),

  quantity: z.number()
    .min(0.01, "Quantity must be greater than 0")
    .max(100000, "Quantity seems unrealistic"),

  reason: z.string()
    .min(1, "Reason is required")
    .max(200, "Reason too long"),

  date: z.string()
    .refine((date) => {
      const moveDate = new Date(date);
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return moveDate <= now && moveDate >= oneMonthAgo;
    }, "Date must be within the last month and not in the future"),

  performedBy: z.string()
    .min(1, "Performer name is required")
    .max(100, "Performer name too long"),

  notes: z.string()
    .max(500, "Notes too long")
    .optional(),
});

// ============================================
// E-COMMERCE VALIDATION
// ============================================

export const ProductSchema = z.object({
  name: z.string()
    .min(1, "Product name is required")
    .max(100, "Product name too long"),

  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description too long"),

  category: z.enum(['fresh', 'frozen', 'processed', 'merchandise'], {
    errorMap: () => ({ message: "Invalid category" })
  }),

  price: z.number()
    .min(0.01, "Price must be greater than 0")
    .max(100000, "Price seems unrealistic"),

  stock: z.number()
    .min(0, "Stock cannot be negative")
    .max(100000, "Stock quantity seems unrealistic"),

  weight: z.number()
    .min(0.01, "Weight must be greater than 0")
    .max(100, "Weight seems unrealistic (in kg)"),

  images: z.array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),

  isPublished: z.boolean(),

  variant: z.string()
    .max(50, "Variant name too long")
    .optional(),

  sku: z.string()
    .max(50, "SKU too long")
    .optional(),
});

export const OrderSchema = z.object({
  customerName: z.string()
    .min(1, "Customer name is required")
    .max(100, "Customer name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in name"),

  customerEmail: z.string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(100, "Email too long"),

  customerPhone: z.string()
    .regex(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/, "Invalid Malaysian phone number (e.g., 012-3456789 or +60123456789)"),

  shippingAddress: z.object({
    street: z.string()
      .min(1, "Street address is required")
      .max(200, "Street address too long"),

    city: z.string()
      .min(1, "City is required")
      .max(100, "City name too long"),

    state: z.enum([
      'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
      'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah',
      'Sarawak', 'Selangor', 'Terengganu', 'W.P. Kuala Lumpur',
      'W.P. Labuan', 'W.P. Putrajaya'
    ], {
      errorMap: () => ({ message: "Invalid Malaysian state" })
    }),

    postalCode: z.string()
      .regex(/^[0-9]{5}$/, "Postal code must be 5 digits"),
  }),

  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number()
      .min(1, "Quantity must be at least 1")
      .max(1000, "Quantity seems unrealistic"),
    price: z.number().min(0.01),
  }))
    .min(1, "Order must have at least one item")
    .max(50, "Too many items in one order"),

  shippingMethod: z.enum(['standard', 'express', 'pickup']),

  discountCode: z.string()
    .max(20, "Discount code too long")
    .optional(),
});

export const ReviewSchema = z.object({
  productId: z.string()
    .min(1, "Product ID is required"),

  rating: z.number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),

  comment: z.string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review too long"),

  customerName: z.string()
    .min(1, "Name is required")
    .max(100, "Name too long"),

  verified: z.boolean(),
});

// ============================================
// USER MANAGEMENT VALIDATION
// ============================================

export const UserProfileSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in name"),

  email: z.string()
    .email("Invalid email format")
    .max(100, "Email too long"),

  phone: z.string()
    .regex(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/, "Invalid Malaysian phone number")
    .optional(),

  role: z.enum(['admin', 'manager', 'worker', 'viewer'], {
    errorMap: () => ({ message: "Invalid role" })
  }),

  avatar: z.string()
    .url("Invalid avatar URL")
    .optional(),
});

export const LoginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),

  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password too long"),
});

export const RegisterSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in name"),

  email: z.string()
    .email("Invalid email format")
    .max(100, "Email too long"),

  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, "Password must contain uppercase, lowercase, and number"),

  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ============================================
// ACTIVITY & TASK VALIDATION
// ============================================

export const ActivitySchema = z.object({
  treeId: z.string()
    .min(1, "Tree ID is required"),

  type: z.enum([
    'watering', 'fertilizing', 'pruning', 'harvesting',
    'pest_control', 'inspection', 'maintenance', 'other'
  ]),

  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description too long"),

  date: z.string()
    .refine((date) => {
      const activityDate = new Date(date);
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return activityDate <= now && activityDate >= oneYearAgo;
    }, "Date must be within the last year and not in the future"),

  duration: z.number()
    .min(0, "Duration cannot be negative")
    .max(1440, "Duration cannot exceed 24 hours (1440 minutes)")
    .optional(),

  cost: z.number()
    .min(0, "Cost cannot be negative")
    .max(1000000, "Cost seems unrealistic")
    .optional(),

  performedBy: z.string()
    .min(1, "Performer name is required")
    .max(100, "Performer name too long"),

  notes: z.string()
    .max(1000, "Notes too long")
    .optional(),
});

export const TaskSchema = z.object({
  title: z.string()
    .min(1, "Task title is required")
    .max(200, "Task title too long"),

  description: z.string()
    .max(1000, "Description too long")
    .optional(),

  assignedTo: z.string()
    .min(1, "Assignee is required"),

  dueDate: z.string()
    .refine((date) => {
      const due = new Date(date);
      const now = new Date();
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(now.getFullYear() + 2);
      return due >= now && due <= twoYearsFromNow;
    }, "Due date must be in the future and within 2 years"),

  priority: z.enum(['low', 'medium', 'high', 'urgent']),

  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']),

  category: z.enum([
    'watering', 'fertilizing', 'pruning', 'harvesting',
    'maintenance', 'inspection', 'other'
  ]),
});

// ============================================
// FINANCIAL VALIDATION
// ============================================

export const ExpenseSchema = z.object({
  category: z.enum([
    'labor', 'materials', 'equipment', 'utilities',
    'maintenance', 'transport', 'marketing', 'other'
  ]),

  amount: z.number()
    .min(0.01, "Amount must be greater than 0")
    .max(1000000, "Amount seems unrealistic"),

  description: z.string()
    .min(1, "Description is required")
    .max(200, "Description too long"),

  date: z.string()
    .refine((date) => {
      const expenseDate = new Date(date);
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return expenseDate <= now && expenseDate >= oneYearAgo;
    }, "Date must be within the last year and not in the future"),

  paymentMethod: z.enum(['cash', 'bank_transfer', 'credit_card', 'e-wallet']),

  receipt: z.string()
    .url("Invalid receipt URL")
    .optional(),

  notes: z.string()
    .max(500, "Notes too long")
    .optional(),
});

export const RevenueSchema = z.object({
  source: z.enum(['durian_sales', 'product_sales', 'other']),

  amount: z.number()
    .min(0.01, "Amount must be greater than 0")
    .max(10000000, "Amount seems unrealistic"),

  description: z.string()
    .min(1, "Description is required")
    .max(200, "Description too long"),

  date: z.string()
    .refine((date) => {
      const revenueDate = new Date(date);
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return revenueDate <= now && revenueDate >= oneYearAgo;
    }, "Date must be within the last year and not in the future"),

  orderId: z.string()
    .optional(),

  notes: z.string()
    .max(500, "Notes too long")
    .optional(),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

export type ValidationResult = {
  success: boolean;
  errors?: Record<string, string>;
  data?: any;
};

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: { general: 'Validation failed' },
    };
  }
}

// Export type inference for TypeScript
export type TreeInput = z.infer<typeof TreeSchema>;
export type HealthRecordInput = z.infer<typeof HealthRecordSchema>;
export type InventoryItemInput = z.infer<typeof InventoryItemSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type OrderInput = z.infer<typeof OrderSchema>;
export type UserProfileInput = z.infer<typeof UserProfileSchema>;
export type ActivityInput = z.infer<typeof ActivitySchema>;
export type TaskInput = z.infer<typeof TaskSchema>;
export type ExpenseInput = z.infer<typeof ExpenseSchema>;
export type RevenueInput = z.infer<typeof RevenueSchema>;
