import { Request, Response } from "express";
import { titleCase } from "../utils/Normalize";
import { stationaryQuerySchema } from "../validators/stationary.query";
import { getStationaries } from "../services/stationary.service";

// export async function addStationeryItemController(
//   req: Request,
//   res: Response
// ) {
//   const { name, quantityAvailable } = req.body;

//   console.log("GET STATIONERY DATA in REQ.BODY:", req.body);

//   if (!name || quantityAvailable === undefined) {
//     return res.status(400).json({
//       error: "name and quantityAvailable are required",
//     });
//   }

//   if (Number(quantityAvailable) < 0) {
//     return res.status(400).json({
//       error: "quantity Available cannot be negative ❌",
//     });
//   }

//   try {
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     if (!tenantPrisma || !user || typeof user === "string") {
//       return res.status(401).json({ error: "Unauthorized request" });
//     }

//     const normalizedItemName = titleCase(name);

//     console.log("STATIONERY ITEM DATA PASSED:");

//     // ✅ Step 1: Check if item already exists
//     const existingItem = await tenantPrisma.stationeryItem.findFirst({
//       where: {
//         name: normalizedItemName,
//         clientAdminId: user.clientAdminId,
//       },
//     });

//     if (existingItem) {
//       return res.status(409).json({
//         error: "Stationery item already exists ❌",
//       });
//     }

//     // ✅ Step 2: Create Stationery Item
//     const item = await tenantPrisma.stationeryItem.create({
//       data: {
//         name: normalizedItemName,
//         quantityAvailable: Number(quantityAvailable),
//         clientAdminId: user.clientAdminId,
//       },
//     });

//     console.log("STATIONERY ITEM CREATED:", item);

//     return res.status(201).json({
//       message: "Stationery item created successfully ✅",
//       item,
//     });
//   } catch (err: any) {
//     console.error("Error creating stationery item:", err);

//     return res.status(500).json({
//       error: "Internal server error",
//     });
//   }
// }

export async function addStationeryItemController(
  req: Request,
  res: Response
) {
  const { name, totalQuantity } = req.body;

  console.log("ADD STATIONERY DATA in REQ.BODY:", req.body);

  // ✅ Validation
  if (!name || totalQuantity === undefined) {
    return res.status(400).json({
      error: "name and totalQuantity are required",
    });
  }

  const parsedTotalQuantity = Number(totalQuantity);

  if (isNaN(parsedTotalQuantity) || parsedTotalQuantity < 0) {
    return res.status(400).json({
      error: "totalQuantity must be a valid non-negative number ❌",
    });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const normalizedItemName = titleCase(name);

    // ✅ Step 1: Check if item already exists
    const existingItem = await tenantPrisma.stationeryItem.findFirst({
      where: {
        name: normalizedItemName,
        clientAdminId: user.clientAdminId,
      },
    });

    if (existingItem) {
      return res.status(409).json({
        error: "Stationery item already exists ❌",
      });
    }

    // ✅ Step 2: Create Stationery Item
    const item = await tenantPrisma.stationeryItem.create({
      data: {
        name: normalizedItemName,
        totalQuantity: parsedTotalQuantity,
        quantityAvailable: parsedTotalQuantity, // 👈 initially equal
        clientAdminId: user.clientAdminId,
      },
    });

    console.log("STATIONERY ITEM CREATED:", item);

    return res.status(201).json({
      message: "Stationery item created successfully ✅",
      item,
    });
  } catch (err: any) {
    console.error("Error creating stationery item:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function editStationeryItemController(
  req: Request,
  res: Response
) {
  const { id, name, quantityAvailable } = req.body;

  console.log("EDIT STATIONERY DATA:", req.body);

  if (!id) {
    return res.status(400).json({
      error: "id is required",
    });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    // ✅ Step 1: Check if item exists
    const existingItem = await tenantPrisma.stationeryItem.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        error: "Stationery item not found ❌",
      });
    }

    let normalizedItemName: string | undefined;

    if (name) {
      normalizedItemName = titleCase(name);

      // ✅ Step 2: Prevent duplicate name (excluding current item)
      const duplicateItem = await tenantPrisma.stationeryItem.findFirst({
        where: {
          name: normalizedItemName,
          NOT: {
            id: Number(id),
          },
        },
      });

      if (duplicateItem) {
        return res.status(409).json({
          error: "Another stationery item with this name already exists ❌",
        });
      }
    }

    if (
      quantityAvailable !== undefined &&
      Number(quantityAvailable) < 0
    ) {
      return res.status(400).json({
        error: "quantityAvailable cannot be negative ❌",
      });
    }

    // ✅ Step 3: Update Item
    const stationary = await tenantPrisma.stationeryItem.update({
      where: {
        id: Number(id),
      },
      data: {
        name: normalizedItemName ?? existingItem.name,
        quantityAvailable:
          quantityAvailable !== undefined
            ? Number(quantityAvailable)
            : existingItem.quantityAvailable,
      },
    });

    console.log("STATIONERY ITEM UPDATED:", stationary);

    return res.status(200).json({
      message: "Stationery item updated successfully ✅",
      stationary,
    });
  } catch (err: any) {
    console.error("Error updating stationery item:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function getStationaryController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = stationaryQuerySchema.parse(req.query);

    const result = await getStationaries({
      prisma,
      clientAdminId: user.clientAdminId,
      query,
    });


    return res.status(200).json({
      message: "Stationary fetched successfully",
      stationary: result.data,
      total: result.total,
      totalPages: result.totalPages,
      page: query.page,
      limit: query.limit,
    });

  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}