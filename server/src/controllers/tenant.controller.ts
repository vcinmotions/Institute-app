// controllers/tenantController.ts
import { Request, Response } from "express";
import { createTenant } from "../utils/createTenant";
// import { centralPrisma } from "../prisma-client/central-client";
import { getCentralPrisma } from "../prisma-client/central-client";

import { createTenantOnServer } from "../utils/tenants";

// At the very entry of your app (e.g. index.ts or app.ts)

// Load root env
//dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Load prisma/institute env
//dotenv.config({ path: path.resolve(__dirname, '../../prisma/institute/.env') });

export async function createTenantController(req: Request, res: Response) {
  const {
    name,
    instituteName,
    email,
    password,
    contact,
    country,
    state,
    city,
    zipCode,
    certificateName,
    fullAddress,
  } = req.body;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  console.log("Uploaded Files IN cOMPANY cONTROLLER: ", {
    files,
  });

  const logo = files?.logo?.[0]?.path || null;
  const stamp = files?.stamp?.[0]?.path || null;
  const sign = files?.sign?.[0]?.path || null;

  console.log("Uploaded Files IN cOMPANY cONTROLLER: ", {
    logo,
    sign,
    stamp,
  });

  if (
    !name ||
    !instituteName ||
    !email ||
    !password ||
    !contact ||
    !country ||
    !state ||
    !city ||
    !zipCode ||
    !fullAddress
  ) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const centralPrisma = getCentralPrisma();

    const existingTenant = await centralPrisma.tenant.findUnique({
      where: {
        email,
      },
    });

    if (existingTenant) {
      return res.status(409).json({
        error:
          "Company already exist with this username. Use different username.",
        message:
          "Company already exist with this username. Use different username.",
      });
    }

    const existingInstutiteName = await centralPrisma.tenant.findUnique({
      where: {
        instituteName
      }
    })

    if (existingInstutiteName) {
      return res.status(409).json({
        error:
          "Company already exist with this Institute name. Use different Institute name.",
        message:
          "Company already exist with this Institute name. Use different Institute name.",
      });
    }
    const { dbName, dbUrl } = await createTenant(
      name,
      instituteName,
      email,
      password,
      contact,
      country,
      state,
      city,
      zipCode,
      fullAddress,
      logo ?? "", // logo is required
      stamp ?? "", // convert null → ""
      sign ?? "",
      certificateName ?? "" // or certificate ?? ""
    );
    return res.status(201).json({
      message: `Tenant "${instituteName}" created successfully.`,
      database: dbName,
      url: dbUrl,
      instituteName: instituteName,
    });
  } catch (err: any) {
    if (err.message.includes("A tenant with email")) {
      return res.status(400).json({
        error: "Email already in use. Please use a different email address.",
      });
    }

    console.error("❌ Error creating tenant:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// export async function createDatabaseBackupController(req: Request, res: Response) {
//   const { name, instituteName, email, password, contact, country, state, city, zipCode, position} = req.body;

//   if (!name || !instituteName || !email || !password || !contact || !country || !state || !city || !zipCode || !position) {
//     return res.status(400).json({ error: 'Missing required fields.' });
//   }

//   try {
//     const { dbName, dbUrl } = await createTenant(name, instituteName, email, password, contact, country, state, city, zipCode, position);
//     return res.status(201).json({
//       message: `Tenant "${instituteName}" backup created successfully.`,
//       database: dbName,
//       url: dbUrl,
//       instituteName: instituteName,
//     });
//   } catch (err: any) {
//     if (err.message.includes('A tenant with email')) {
//       return res.status(400).json({
//         error: 'Email already in use. Please use a different email address.',
//       });
//     }

//     console.error('❌ Error creating tenant:', err);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

export async function getTenantController(req: Request, res: Response) {
  try {
    const centralPrisma = getCentralPrisma();

    //const tenantPrisma = getTenantPrisma(dbUrl);
    const getTenant = await centralPrisma.tenant.findMany();
    console.log("Get All Tenant from Master Admin:", getTenant);

    return res
      .status(201)
      .json({ message: "All Tenants Fetched successfully", getTenant });
  } catch (err: any) {
    if (err.message.includes("A tenant with email")) {
      return res.status(400).json({
        error: "Email already in use. Please use a different email address.",
      });
    }

    console.error("❌ Error creating tenant:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function POST(req: Request, res: Response) {
  try {
    const result = await createTenantOnServer(req.body);
    return res.json({ ok: true, result });
  } catch (err: any) {
    console.error("create tenant failed:", err?.stderr ?? err?.message ?? err);
    return res.json({ ok: false, error: err?.message ?? "failed" });
  }
}
