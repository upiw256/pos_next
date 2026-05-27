import { describe, it, expect } from 'vitest';
import { canAccess } from '@/proxy';

describe('RBAC (Role-Based Access Control) Tests', () => {
  describe('canAccess function', () => {
    
    describe('cashier role', () => {
      it('should allow access to /admin/cashier', () => {
        expect(canAccess('cashier', '/admin/cashier')).toBe(true);
      });
      
      it('should allow access to root /admin', () => {
        expect(canAccess('cashier', '/admin')).toBe(true);
      });
      
      it('should deny access to inventory module', () => {
        expect(canAccess('cashier', '/admin/inventory')).toBe(false);
      });
      
      it('should deny access to admin dashboard settings', () => {
        expect(canAccess('cashier', '/admin/settings')).toBe(false);
      });
    });

    describe('inventory_manager role', () => {
      it('should allow access to /admin/inventory', () => {
        expect(canAccess('inventory_manager', '/admin/inventory')).toBe(true);
      });

      it('should allow access to /admin/cashier (since level 2 >= 1)', () => {
        expect(canAccess('inventory_manager', '/admin/cashier')).toBe(true);
      });
      
      it('should allow access to /admin/purchases and products', () => {
        expect(canAccess('inventory_manager', '/admin/purchases')).toBe(true);
        expect(canAccess('inventory_manager', '/admin/products')).toBe(true);
      });
      
      it('should deny access to managerial modules', () => {
        expect(canAccess('inventory_manager', '/admin/reports')).toBe(false);
        expect(canAccess('inventory_manager', '/admin/sales')).toBe(false);
      });
    });

    describe('manager role', () => {
      it('should allow access to manager-level modules', () => {
        expect(canAccess('manager', '/admin/categories')).toBe(true);
        expect(canAccess('manager', '/admin/sales')).toBe(true);
        expect(canAccess('manager', '/admin/reports')).toBe(true);
        expect(canAccess('manager', '/admin/expenses')).toBe(true);
      });

      it('should allow access to lower-level modules like inventory', () => {
        expect(canAccess('manager', '/admin/inventory')).toBe(true);
        expect(canAccess('manager', '/admin/cashier')).toBe(true);
      });

      it('should deny access to super_admin modules', () => {
        expect(canAccess('manager', '/admin/users')).toBe(false);
        expect(canAccess('manager', '/admin/settings')).toBe(false);
      });
    });

    describe('super_admin role', () => {
      it('should allow access to superadmin modules', () => {
        expect(canAccess('super_admin', '/admin/users')).toBe(true);
        expect(canAccess('super_admin', '/admin/settings')).toBe(true);
      });
      
      it('should allow access to all other modules', () => {
        expect(canAccess('super_admin', '/admin/reports')).toBe(true);
        expect(canAccess('super_admin', '/admin/inventory')).toBe(true);
        expect(canAccess('super_admin', '/admin/cashier')).toBe(true);
      });
    });

    describe('invalid or no role', () => {
      it('should deny access to all admin modules except default base if level is effectively 0', () => {
        expect(canAccess('', '/admin/settings')).toBe(false);
        expect(canAccess('unknown_role', '/admin/cashier')).toBe(false);
        expect(canAccess(undefined as any, '/admin')).toBe(false);
      });
    });
    
  });
});
