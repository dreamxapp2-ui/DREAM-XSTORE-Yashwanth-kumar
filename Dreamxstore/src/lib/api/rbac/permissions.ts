// RBAC Permission Definitions

import { UserRole, Permission, type RolePermissions } from './types';

/**
 * Define permissions for each role
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Has all permissions
    ...Object.values(Permission),
  ],
  
  [UserRole.BRAND_MANAGER]: [
    // Can manage brands and products
    Permission.VIEW_BRANDS,
    Permission.EDIT_BRANDS,
    Permission.APPROVE_BRANDS,
    Permission.VIEW_PRODUCTS,
    Permission.APPROVE_PRODUCTS,
    Permission.FEATURE_PRODUCTS,
    Permission.MANAGE_CATEGORIES,
    Permission.VIEW_USERS,
    Permission.VIEW_ANALYTICS,
  ],
  
  [UserRole.ORDER_MANAGER]: [
    // Can manage orders only
    Permission.VIEW_ORDERS,
    Permission.EDIT_ORDERS,
    Permission.CANCEL_ORDERS,
    Permission.PROCESS_REFUNDS,
    Permission.VIEW_USERS,
    Permission.VIEW_ANALYTICS,
  ],
  
  [UserRole.SUPPORT_STAFF]: [
    // Can view and help customers
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    Permission.VIEW_ORDERS,
    Permission.VIEW_BRANDS,
    Permission.VIEW_PRODUCTS,
  ],
  
  [UserRole.BRAND_OWNER]: [
    // Can manage their own brand and products
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCTS,
    Permission.EDIT_PRODUCTS,
    Permission.DELETE_PRODUCTS,
    Permission.VIEW_ORDERS,
    Permission.VIEW_REVENUE,
    Permission.VIEW_TRANSACTIONS,
  ],
  
  [UserRole.CUSTOMER]: [
    // No admin permissions
  ],
};

/**
 * Get permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get role metadata
 */
export const ROLE_METADATA: Record<UserRole, RolePermissions> = {
  [UserRole.SUPER_ADMIN]: {
    role: UserRole.SUPER_ADMIN,
    permissions: ROLE_PERMISSIONS[UserRole.SUPER_ADMIN],
    description: 'Full access to all features, settings, and sensitive data.',
  },
  [UserRole.BRAND_MANAGER]: {
    role: UserRole.BRAND_MANAGER,
    permissions: ROLE_PERMISSIONS[UserRole.BRAND_MANAGER],
    description: 'Can approve/reject brands and products, manage categories.',
  },
  [UserRole.ORDER_MANAGER]: {
    role: UserRole.ORDER_MANAGER,
    permissions: ROLE_PERMISSIONS[UserRole.ORDER_MANAGER],
    description: 'Can view and update orders, process refunds.',
  },
  [UserRole.SUPPORT_STAFF]: {
    role: UserRole.SUPPORT_STAFF,
    permissions: ROLE_PERMISSIONS[UserRole.SUPPORT_STAFF],
    description: 'Can view data and help customers, but cannot delete or access finances.',
  },
  [UserRole.BRAND_OWNER]: {
    role: UserRole.BRAND_OWNER,
    permissions: ROLE_PERMISSIONS[UserRole.BRAND_OWNER],
    description: 'Can manage their own brand, products, and view their sales.',
  },
  [UserRole.CUSTOMER]: {
    role: UserRole.CUSTOMER,
    permissions: ROLE_PERMISSIONS[UserRole.CUSTOMER],
    description: 'Regular customer account with no admin access.',
  },
};

/**
 * Check if user is admin (has any admin role)
 */
export function isAdmin(role: UserRole): boolean {
  return role !== UserRole.CUSTOMER;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === UserRole.SUPER_ADMIN;
}
