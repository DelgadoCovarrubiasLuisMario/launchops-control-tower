import type { UserRole } from './types';

export function canMutateOps(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'engineer';
}

export function canViewAudit(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'engineer';
}
