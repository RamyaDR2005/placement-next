/**
 * Authorization helpers for secure session and role management
 */

import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export type UserRole = "STUDENT" | "ADMIN"

/**
 * Get the current user or return unauthorized response
 */
export async function requireAuth() {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: NextResponse.json(
                { error: "Unauthorized - Please sign in" },
                { status: 401 }
            ),
            session: null
        }
    }

    return {
        error: null,
        session
    }
}

/**
 * Check if the current user has the required role
 */
export async function requireRole(requiredRole: UserRole | UserRole[]) {
    const { error, session } = await requireAuth()

    if (error) {
        return { error, session: null }
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

    if (!session || !roles.includes(session.user.role as UserRole)) {
        return {
            error: NextResponse.json(
                { error: "Forbidden - Insufficient permissions" },
                { status: 403 }
            ),
            session: null
        }
    }

    return {
        error: null,
        session
    }
}

/**
 * Check if the current user is an admin
 */
export async function requireAdmin() {
    return await requireRole(["ADMIN"])
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
        return ''
    }
    return input.replace(/\0/g, '').trim()
}

/**
 * Log security events for monitoring
 */
export function logSecurityEvent(
    event: string,
    details: Record<string, unknown>
) {
    const timestamp = new Date().toISOString()
    console.log(`[SECURITY] ${timestamp} - ${event}`, JSON.stringify(details))
}
