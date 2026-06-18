// services/enquiry.service.ts

import { Enquiry } from "../domain/enquiry/enquiry";
import { ensureUniqueEnquiry } from "../domain/enquiry/enquiryRules";
import { buildEnquiryWhere } from "../filters/enquiry.filter";
import { buildEnquiryOrderBy } from "../filters/enquiry.sort";
import { parseDate, parseDateISO } from "../helpers/date";
import { normalizeEmail, normalizePhone, normalizeToLowercase, titleCase } from "../utils/Normalize";
import { normalizeEnquiryInput } from "../utils/normalizer/enquiryNormalizer";

export async function getEnquiries({
  prisma,
  clientAdminId,
  query,
}: any) {
  const skip = (query.page - 1) * query.limit;

  const where = buildEnquiryWhere({
    clientAdminId,
    search: query.search,
    leadStatus: query.leadStatus,
    courseId: query.courseId,
    createdDate: query.createdDate,
  });

  const orderBy = buildEnquiryOrderBy(
    query.sortField,
    query.sortOrder
  );

  const [data, total] = await prisma.$transaction([
    prisma.enquiry.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      include: {
        enquiryCourse: { include: { course: true } },
      },
    }),
    prisma.enquiry.count({ where }),
  ]);

  const convertedCount = await prisma.enquiry.count({
      where: {
        ...where,
        isConverted: true,
        NOT: { studentId: null }, // ensures studentId exists
      },
    });

    const notConvertedCount = await prisma.enquiry.count({
      where: {
        ...where,
        OR: [{ isConverted: false }, { studentId: null }],
      },
    });

  console.log("DATA IN ENQUIRY SERVICE;", data);

  return {
    data,
    total,
    notConvertedCount,
    convertedCount,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function createEnquiryService({
  prisma,
  clientAdminId,
  data,
}: {
  prisma: any;
  clientAdminId: string;
  data: any;
}) {

  // ✅ Normalize FIRST (backend is source of truth)
  // const normalizedData = {
  //   ...data,
  //   name: data.name ? titleCase(data.name) : null,
  //   email: data.email ? normalizeEmail(data.email) : null,
  //   contact: data.contact ? normalizePhone(data.contact) : null,
  //   alternateContact: data.alternateContact
  //     ? normalizePhone(data.alternateContact)
  //     : null,
  //   location: data.location
  //     ? normalizeToLowercase(data.location)
  //     : null,
  // };

  const normalizedData = normalizeEnquiryInput(data);

  const { name, contact, email, dob, courseId, enquiryDate } = normalizedData;
  
  // const { name, contact, email, dob, courseId } = data;

  // 1️⃣ Check for duplicates only if values exist
  if (email) {
    const existingEmail = await prisma.enquiry.findFirst({
      where: { email, clientAdminId },
    });
    ensureUniqueEnquiry(!!existingEmail, false);
  }

  if (contact) {
    const existingContact = await prisma.enquiry.findFirst({
      where: { contact, clientAdminId },
    });
    ensureUniqueEnquiry(false, !!existingContact);
  }

  const parsedDob = parseDate(dob);
  const parsedEnquirydate = parseDate(enquiryDate);

const age = parsedDob ? Enquiry.calculateAge(parsedDob) : null;

  // 2️⃣ Calculate age safely
  // const age =
  //   dob && !isNaN(new Date(dob).getTime())
  //     ? Enquiry.calculateAge(new Date(dob))
  //     : null;

  // 3️⃣ Get next SR No
  const last = await prisma.enquiry.findFirst({
    where: { clientAdminId },
    orderBy: { srNo: "desc" },
    select: { srNo: true },
  });
  const nextSrNo = (last?.srNo ?? 0) + 1;

  // ✅ Conditionally fetch Source ID if a source was provided
  let sourceId = null;
  if (normalizedData.source) {
    const sourceRecord = await prisma.sourceType.findUnique({
      where: { slug: normalizedData.source },
    });

    if (!sourceRecord) {
      throw new Error("Provided Source Type not found!");
    }
    sourceId = sourceRecord.id;
  }

  // 4️⃣ Create enquiry
  const enquiry = await prisma.enquiry.create({
    data: {
      srNo: nextSrNo,
      name,
      contact,
      email,
      age: age ?? null,
      dob: parsedDob ? new Date(parsedDob) : null,
      enquiryDate: parsedEnquirydate ? new Date(parsedEnquirydate) : null,
      sourceId: sourceId,
      alternateContact: normalizedData.alternateContact || null,
      location: normalizedData.location || null,
      city: normalizedData.city || null,
      gender: normalizedData.gender || null,
      referedBy: normalizedData.referedBy || null,
      takenBy: normalizedData.takenBy || null,
      clientAdminId,
    },
  });

  // 5️⃣ Link courses
  if (Array.isArray(courseId) && courseId.length > 0) {
    await prisma.enquiryCourse.createMany({
      data: courseId.map((id: number | string) => ({
        enquiryId: enquiry.id,
        courseId: Number(id),
        clientAdminId,
      })),
    });
  }

  return enquiry;
}

export async function editEnquiryService({
  prisma,
  clientAdminId,
  data,
}: {
  prisma: any;
  clientAdminId: string;
  data: any;
}) {

   // ✅ Normalize FIRST (backend is source of truth)
  const normalizedData = {
    ...data,
    name: data.name ? titleCase(data.name) : null,
    email: data.email ? normalizeEmail(data.email) : null,
    contact: data.contact ? normalizePhone(data.contact) : null,
    alternateContact: data.alternateContact
      ? normalizePhone(data.alternateContact)
      : null,
    location: data.location
      ? normalizeToLowercase(data.location)
      : null,
  };

  const { id, name, contact, email, dob, courseId, enquiryDate } = normalizedData;
  //const { id, name, contact, email, dob, courseId } = data;

  console.log("GET ENIT DATA:", normalizedData);
  console.log("GET ENIT DATA:", data);

  // 1️⃣ Check for duplicates only if values exist
  if (email) {
    const existingEmail = await prisma.enquiry.findFirst({
      where: {
        email,
        clientAdminId,
        NOT: { id }, // 👈 exclude current enquiry
      },
    });

    ensureUniqueEnquiry(!!existingEmail, false);
  }

  if (contact) {
    const existingContact = await prisma.enquiry.findFirst({
      where: {
        contact,
        clientAdminId,
        NOT: { id }, // 👈 exclude current enquiry
      },
    });

    ensureUniqueEnquiry(false, !!existingContact);
  }

  // 1️⃣ Check for duplicates in domain rule
  const existingEnquiry = await prisma.enquiry.findUnique({
    where: {
      id: id
    }
  })

  if(!existingEnquiry) {
    throw new Error("Enquiry do not found!");
  }

   // 2️⃣ Domain rule: cannot edit WON enquiry
  if (existingEnquiry.leadStatus === "WON") {
    throw new Error("Enquiry already converted to admission");
  }

  // 2️⃣ Calculate age via domain
  const age = Enquiry.calculateAge(dob ? new Date(dob) : null);

  // ✅ Conditionally fetch Source ID if a source was provided
  let sourceId = null;
  if (normalizedData.source) {
    const sourceRecord = await prisma.sourceType.findUnique({
      where: { slug: normalizedData.source },
    });

    if (!sourceRecord) {
      throw new Error("Provided Source Type not found!");
    }
    sourceId = sourceRecord.id;
  }

  // 4️⃣ Create enquiry
  const enquiry = await prisma.enquiry.update({
    where: { id },
    data: {
      name,
      contact,
      email,
      age: age,
      dob: parseDateISO(dob),
      enquiryDate: parseDateISO(enquiryDate),
      sourceId: sourceId,
      alternateContact: normalizedData.alternateContact || null,
      location: normalizedData.location || null,
      city: normalizedData.city || null,
      gender: normalizedData.gender || null,
      referedBy: normalizedData.referedBy || null,
      takenBy: normalizedData.takenBy || null,
      clientAdminId,
    },
  });

  // 5️⃣ Link courses
  if (Array.isArray(courseId) && courseId.length > 0) {
    // 1️⃣ Delete old existing mappings
      await prisma.enquiryCourse.deleteMany({
        where: { enquiryId: id },
      });

       // 2️⃣ Create new mappings
      // const linkData = courseId.map((course) => ({
      //   enquiryId: id, // FIX: enquiryId should be ENQUIRY ID (not course!)
      //   courseId: Number(course),
      //   clientAdminId,
      // }));

      // await prisma.enquiryCourse.createMany({
      //   data: linkData,
      // });

      if (courseId.length > 0) {
      await prisma.enquiryCourse.createMany({
        data: courseId.map((course) => ({
          enquiryId: id,
          courseId: Number(course),
          clientAdminId,
        })),
      });
    }
  }

  return enquiry;
}

export async function getEnquiryByIdService({
  prisma,
  enquiryId,
  clientAdminId,
}: {
  prisma: any;
  enquiryId: string;
  clientAdminId: string;
}) {
  const enquiry = await prisma.enquiry.findFirst({
    where: {
      id: enquiryId,
      clientAdminId, // 🔒 ownership rule
    },
    include: {
      enquiryCourse: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!enquiry) {
    throw new Error("Enquiry not found");
  }

  return enquiry;
}

export async function convertEnquiryService({
  prisma,
  enquiryId,
  clientAdminId,
}: {
  prisma: any;
  enquiryId: string;
  clientAdminId: string;
}) {

  const enquiry = await prisma.enquiry.update({
    where: { id: enquiryId, clientAdminId },
    data: { isConverted: true },
  });

  if (!enquiry) {
    throw new Error("Enquiry not found");
  }

  return enquiry;
}
export async function markEnquiryLostService({
  prisma,
  enquiryId,
  clientAdminId,
  remark,
}: {
  prisma: any;
  enquiryId: string;
  clientAdminId: string;
  remark: string;
}) {
  // 1️⃣ Fetch enquiry
  const rawEnquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } });
  if (!rawEnquiry) throw new Error("Enquiry not found");

  const enquiry = new Enquiry(rawEnquiry);

  // 2️⃣ Check ownership
  if (!enquiry.canBeViewedBy(clientAdminId)) {
    throw new Error("Unauthorized to update this enquiry");
  }

  // 3️⃣ Mark as LOST in domain
  enquiry.markLost();

  // 4️⃣ Persist status update
  await prisma.enquiry.update({
    where: { id: enquiryId },
    data: { leadStatus: "LOST" },
  });

  // 5️⃣ Complete old follow-ups
  await prisma.followUp.updateMany({
    where: { enquiryId },
    data: { followUpStatus: "COMPLETED", doneAt: new Date() },
  });

  // 6️⃣ Create final follow-up
  const finalFollowUp = await prisma.followUp.create({
    data: {
      enquiry: { connect: { id: enquiryId } },
      remark,
      followUpStatus: "MISSED",
      doneAt: new Date(),
    },
  });

  return { enquiry, finalFollowUp };
}

export async function markEnquiryHoldService({
  prisma,
  enquiryId,
  clientAdminId,
  remark,
}: {
  prisma: any;
  enquiryId: string;
  clientAdminId: string;
  remark: string;
}) {
  // 1️⃣ Fetch enquiry
  const rawEnquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } });
  if (!rawEnquiry) throw new Error("Enquiry not found");

  const enquiry = new Enquiry(rawEnquiry);

  // 2️⃣ Check ownership
  if (!enquiry.canBeViewedBy(clientAdminId)) {
    throw new Error("Unauthorized to update this enquiry");
  }

  // 3️⃣ Mark as HOLD in domain
  enquiry.markHold(); // automatically enforces rules

  // ✅ 1. Update the enquiry’s lead status to WON (or COLD if you prefer)
    await prisma.enquiry.update({
      where: { id: enquiryId },
      data: {
        leadStatus: "HOLD", // You can also use "COLD" if that fits your workflow
      },
    });

    // ✅ 2. Mark all previous follow-ups for this enquiry as COMPLETED
    await prisma.followUp.updateMany({
      where: { enquiryId },
      data: { followUpStatus: "COMPLETED", doneAt: new Date() },
    });

    // ✅ 3. Create one final completed follow-up with the user remark
    const finalFollowUp = await prisma.followUp.create({
      data: {
        enquiry: { connect: { id: enquiryId } },
        remark,
        doneAt: new Date(),
        followUpStatus: "MISSED",
      },
    });

  return { enquiry, finalFollowUp };
}
