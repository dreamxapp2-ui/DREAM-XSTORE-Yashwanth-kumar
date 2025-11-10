// RBAC (Role-Based Access Control) Types

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  BRAND_MANAGER = 'brand_manager',
  ORDER_MANAGER = 'order_manager',
  SUPPORT_STAFF = 'support_staff',
  CUSTOMER = 'customer',
  BRAND_OWNER = 'brand_owner',
}

export enum Permission {
  // User Management
  VIEW_USERS = 'view_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  BAN_USERS = 'ban_users',
  
  // Brand Management
  VIEW_BRANDS = 'view_brands',
  CREATE_BRANDS = 'create_brands',
  EDIT_BRANDS = 'edit_brands',
  DELETE_BRANDS = 'delete_brands',
  APPROVE_BRANDS = 'approve_brands',
  
  // Product Management
  VIEW_PRODUCTS = 'view_products',
  CREATE_PRODUCTS = 'create_products',
  EDIT_PRODUCTS = 'edit_products',
  DELETE_PRODUCTS = 'delete_products',
  APPROVE_PRODUCTS = 'approve_products',
  FEATURE_PRODUCTS = 'feature_products',
  MANAGE_CATEGORIES = 'manage_categories',
  
  // Order Management
  VIEW_ORDERS = 'view_orders',
  EDIT_ORDERS = 'edit_orders',
  CANCEL_ORDERS = 'cancel_orders',
  PROCESS_REFUNDS = 'process_refunds',
  
  // Finance
  VIEW_REVENUE = 'view_revenue',
  VIEW_TRANSACTIONS = 'view_transactions',
  MANAGE_PAYOUTS = 'manage_payouts',
  MANAGE_COMMISSIONS = 'manage_commissions',
  
  // Content Management
  MANAGE_BANNERS = 'manage_banners',
  MANAGE_COUPONS = 'manage_coupons',
  MANAGE_PROMOTIONS = 'manage_promotions',
  
  // Settings
  VIEW_SETTINGS = 'view_settings',
  EDIT_SETTINGS = 'edit_settings',
  
  // Analytics
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_REPORTS = 'export_reports',
  
  // Audit Logs
  VIEW_AUDIT_LOGS = 'view_audit_logs',
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  twoFactorEnabled?: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}
