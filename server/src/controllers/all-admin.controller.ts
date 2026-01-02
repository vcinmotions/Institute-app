// src/controllers/dashboardController.ts
import { Request, Response } from 'express';

export async function getAllClientAdmins(req: Request, res: Response) {
  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === 'string') {
      return res.status(401).json({ error: 'Unauthorized request' });
    }

    // Check if user is ADMIN
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only Admins can fetch user list' });
    }

    // Fetch all clientAdmins in the tenant
    const clientAdmins = await tenantPrisma.clientAdmin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        //role: true,
        createdAt: true,
      },
      orderBy: {
        //role: 'asc', // Optional: Group by role
      },
    });

    return res.status(200).json({ users: clientAdmins });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
