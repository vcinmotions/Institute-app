/**
 * Ensure no duplicate email/contact exists in the system
 */
export function ensureUniqueEnquiry(
  emailExists?: boolean,
  contactExists?: boolean
) {
  if (emailExists) {
    throw new Error("Email already exists in Enquiries. Use different Email!");
  }

  if (contactExists) {
    throw new Error(
      "Contact already exists in Enquiries. Use different Contact details!"
    );
  }
}
