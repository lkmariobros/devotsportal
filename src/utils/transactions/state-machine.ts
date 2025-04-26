// Define the transaction statuses
export type TransactionStatus = 
  | 'Draft' 
  | 'Pending' 
  | 'Submitted' 
  | 'Under Review' 
  | 'Approved' 
  | 'Rejected' 
  | 'Completed' 
  | 'Cancelled';

// Create a Zod enum for validation
export const TransactionStatusEnum = z.enum([
  'Draft',
  'Pending',
  'Submitted',
  'Under Review',
  'Approved',
  'Rejected',
  'Completed',
  'Cancelled'
]);

// Define user roles
export type UserRole = 'agent' | 'admin';

// Define allowed status transitions
const statusTransitions: Record<TransactionStatus, TransactionStatus[]> = {
  'Draft': ['Pending', 'Cancelled'],
  'Pending': ['Submitted', 'Draft', 'Cancelled'],
  'Submitted': ['Under Review', 'Rejected', 'Cancelled'],
  'Under Review': ['Approved', 'Rejected', 'Submitted'],
  'Approved': ['Completed', 'Under Review'],
  'Rejected': ['Submitted', 'Cancelled'],
  'Completed': [],
  'Cancelled': []
};

// Define which roles can perform which transitions
const rolePermissions: Record<TransactionStatus, Record<TransactionStatus, UserRole[]>> = {
  'Draft': {
    'Pending': ['agent'],
    'Cancelled': ['agent', 'admin'],
    'Draft': [],
    'Submitted': [],
    'Under Review': [],
    'Approved': [],
    'Rejected': [],
    'Completed': []
  },
  'Pending': {
    'Submitted': ['agent'],
    'Draft': ['agent'],
    'Cancelled': ['agent', 'admin'],
    'Pending': [],
    'Under Review': [],
    'Approved': [],
    'Rejected': [],
    'Completed': []
  },
  'Submitted': {
    'Under Review': ['admin'],
    'Rejected': ['admin'],
    'Cancelled': ['agent', 'admin'],
    'Draft': [],
    'Pending': [],
    'Submitted': [],
    'Approved': [],
    'Completed': []
  },
  'Under Review': {
    'Approved': ['admin'],
    'Rejected': ['admin'],
    'Submitted': ['admin'],
    'Draft': [],
    'Pending': [],
    'Under Review': [],
    'Cancelled': [],
    'Completed': []
  },
  'Approved': {
    'Completed': ['admin'],
    'Under Review': ['admin'],
    'Draft': [],
    'Pending': [],
    'Submitted': [],
    'Approved': [],
    'Rejected': [],
    'Cancelled': []
  },
  'Rejected': {
    'Submitted': ['agent'],
    'Cancelled': ['agent'],
    'Draft': [],
    'Pending': [],
    'Under Review': [],
    'Approved': [],
    'Rejected': [],
    'Completed': []
  },
  'Completed': {
    'Draft': [],
    'Pending': [],
    'Submitted': [],
    'Under Review': [],
    'Approved': [],
    'Rejected': [],
    'Cancelled': [],
    'Completed': []
  },
  'Cancelled': {
    'Draft': [],
    'Pending': [],
    'Submitted': [],
    'Under Review': [],
    'Approved': [],
    'Rejected': [],
    'Cancelled': [],
    'Completed': []
  }
};

// Check if a transition is allowed
export function canTransition(
  currentStatus: TransactionStatus,
  newStatus: TransactionStatus,
  role: UserRole
): boolean {
  // Check if the transition is valid
  if (!statusTransitions[currentStatus].includes(newStatus)) {
    return false;
  }
  
  // Check if the user role has permission for this transition
  return rolePermissions[currentStatus][newStatus].includes(role);
}

// Get available next statuses for a given status and role
export function getAvailableStatuses(
  currentStatus: TransactionStatus,
  role: UserRole
): TransactionStatus[] {
  return statusTransitions[currentStatus].filter(status => 
    rolePermissions[currentStatus][status].includes(role)
  );
}

// Import z from zod at the top of the file
import { z } from 'zod';