import type { RequestHandler } from '@sveltejs/kit';
import db from '@/db';
import { desc, eq } from 'drizzle-orm';
import projects from '@/db/schema/projectsSchema/projects';
import { json, redirect } from '@sveltejs/kit';
import users from '@/db/schema/usersSchema/users';
import {
	emailVerificationCodesTable,
	expensesTable,
	inflowsTable,
	oAuthTable,
	passwordResetTokensTable,
	projectsTable,
	sessionsTable
} from '@/db/schema';
import { deleteSessionTokenCookie, invalidateSession } from '@/lib/server/authUtils';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	const userId = locals.user.id;

	try {
		const recentProjects = await db
			.select()
			.from(projects)
			.where(eq(projects.userId, userId))
			.limit(3)
			.orderBy(desc(projects.updatedAt));
		return json({ recentProjects }, { status: 200 });
	} catch (error) {
		console.error('Error fetching projects:', error);
		return json({ error: 'An error occurred while fetching projects.' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ locals, cookies }) => {
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	const userId = locals.user.id;
	if (userId) {
		const session = locals.session;
		if (session) {
			invalidateSession(session.id);
			deleteSessionTokenCookie(cookies);
		}
		try {
			// Start a transaction
			await db.transaction(async (trx) => {
				// Delete related sessions
				await trx.delete(sessionsTable).where(eq(sessionsTable.userId, userId));

				// Delete related password reset tokens
				await trx
					.delete(passwordResetTokensTable)
					.where(eq(passwordResetTokensTable.userId, userId));

				// Delete related OAuth entries
				await trx.delete(oAuthTable).where(eq(oAuthTable.userId, userId));

				// Delete related email verification codes
				await trx
					.delete(emailVerificationCodesTable)
					.where(eq(emailVerificationCodesTable.userId, userId));

				// Delete related expenses
				await trx.delete(expensesTable).where(eq(expensesTable.userId, userId));

				// Delete related inflows
				await trx.delete(inflowsTable).where(eq(inflowsTable.userId, userId));

				// Delete related projects (cascade should handle related expenses and inflows)
				await trx.delete(projectsTable).where(eq(projectsTable.userId, userId));

				// Delete the user
				await trx.delete(users).where(eq(users.id, userId));
			});

			return json({ message: 'Account deleted successfully.' }, { status: 200 });
		} catch (error) {
			console.error('Error deleting user:', error);
			return json({ error: 'An error occurred while deleting the user.' }, { status: 500 });
		}
	}
	return json({ message: 'No User ID provided' }, { status: 400 });
};
