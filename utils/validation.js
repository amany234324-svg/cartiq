/**
 * Checks if a string is a valid email address (correct format: something@domain.com).
 * Input: email (string, optional) — the value to check.
 * Possible outputs:
 *   - { valid: true } — email is valid.
 *   - { valid: false, error: 'Email is required' } — nothing was passed or it's empty.
 *   - { valid: false, error: 'Invalid email address' } — string doesn't match a proper email format.
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  // local-part@domain
  // Local part (before @):
  //  - Up to 64 characters.
  //  - Can include letters (A–Z, a–z), digits (0–9), and certain special characters
  //  - Cannot start or end with a dot, and dots cannot appear consecutively.
  // Domain part (after @):
  //  - Must consist of one or more labels separated by dots (.).
  //  - Each label represents a subdomain or the top-level domain (TLD).
  //  - Allowed Characters:
  //    - Letters (A–Z, a–z)
  //    - Digits (0–9)
  //    - Hyphen (-) — but with restrictions.
  //  - Restrictions:
  //    - Labels cannot start or end with a hyphen.
  //    - Labels must be between 1 and 63 characters long.
  //    - The entire domain must not exceed 255 characters.
  //    - No spaces or special characters (like !, @, #, etc.).
  //    - Case-insensitive (e.g., Example.com = example.com).

  const validFormat =
    /^(?=.{1,64}@)([a-zA-Z0-9_%+-]+(\.[a-zA-Z0-9_%+-]+)*)@(?=.{1,63}\.)([a-zA-Z0-9]+(\-[a-zA-Z0-9]+)*)(\.(?=.{1,63}\.)([a-zA-Z0-9]+(\-[a-zA-Z0-9]+)*))*\.(?=.{2,63}$)([a-zA-Z0-9]+(\-[a-zA-Z0-9]+)*)$/i.test(
      email,
    );
  if (!validFormat) {
    return { valid: false, error: 'Invalid email address' };
  }

  return { valid: true };
}

/**
 * Checks if a password meets the rules: must be a string, 8–64 characters, and include at least one lowercase letter, one uppercase letter, one number, one special character (e.g. !, @, #), and no spaces.
 * Input: pass (any) — the value to check (usually a string).
 * Possible outputs:
 *   - { valid: true } — password is valid.
 *   - { valid: false, error: 'Password must be provided.' } — nothing was passed or it's empty.
 *   - { valid: false, error: 'Password must be a string.' } — value is not a string.
 *   - { valid: false, error: 'Password must be at least 8 characters long.' }
 *   - { valid: false, error: 'Password must be no more than 64 characters long.' }
 *   - { valid: false, error: 'Password must include at least one lowercase letter.' }
 *   - { valid: false, error: 'Password must include at least one uppercase letter.' }
 *   - { valid: false, error: 'Password must include at least one number.' }
 *   - { valid: false, error: 'Password must include at least one special character (e.g. !, @, #).' }
 *   - { valid: false, error: 'Password must not contain spaces.' }
 */
export function validatePassword(pass) {
  if (!pass) {
    return { valid: false, error: 'Password must be provided.' };
  }

  if (typeof pass !== 'string') {
    return { valid: false, error: 'Password must be a string.' };
  }

  if (pass.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters long.',
    };
  }

  if (pass.length > 64) {
    return {
      valid: false,
      error: 'Password must be no more than 64 characters long.',
    };
  }

  if (!/[a-z]/.test(pass)) {
    return {
      valid: false,
      error: 'Password must include at least one lowercase letter.',
    };
  }

  if (!/[A-Z]/.test(pass)) {
    return {
      valid: false,
      error: 'Password must include at least one uppercase letter.',
    };
  }

  if (!/[0-9]/.test(pass)) {
    return {
      valid: false,
      error: 'Password must include at least one number.',
    };
  }

  if (!/[^\w\s]/.test(pass)) {
    return {
      valid: false,
      error:
        'Password must include at least one special character (e.g. !, @, #).',
    };
  }

  if (/\s/.test(pass)) {
    return { valid: false, error: 'Password must not contain spaces.' };
  }

  return { valid: true };
}

/**
 * Checks product data before creating or updating a product. When creating, all of name, description, category, price, and stock are required. When updating, only the fields you pass are checked: name length (3–100), stock >= 0, price > 0.
 * Input: productData (object) — { name, description, category, price, stock } (all optional when updating). create (boolean, optional) — true = creating (default), false = updating.
 * Possible outputs:
 *   - { valid: true } — data is valid.
 *   - { valid: false, error: 'Product name is required' } (when creating)
 *   - { valid: false, error: 'Product description is required' } (when creating)
 *   - { valid: false, error: 'Product category is required' } (when creating)
 *   - { valid: false, error: 'Product price is required' } (when creating)
 *   - { valid: false, error: 'Product stock is required' } (when creating)
 *   - { valid: false, error: 'Too short product name' } — name has less than 3 characters.
 *   - { valid: false, error: 'Too long product name' } — name has more than 100 characters.
 *   - { valid: false, error: 'Product stock must be a positive number' } — stock is negative.
 *   - { valid: false, error: 'Product price must be a positive number' } — price is zero or negative.
 */
export function validateProductData(productData, create = true) {
  const { name, description, category, price, stock, image } = productData;
  if (create) {
    if (!name) {
      return { valid: false, error: 'Product name is required' };
    }
    if (!description) {
      return { valid: false, error: 'Product description is required' };
    }
    if (!category) {
      return { valid: false, error: 'Product category is required' };
    }
    if (!price) {
      return { valid: false, error: 'Product price is required' };
    }
    if (!stock) {
      return { valid: false, error: 'Product stock is required' };
    }
    if (!image) {
      return { valid: false, error: 'Product image is required' };
    }
  }

  if (name?.length < 3) {
    return { valid: false, error: 'Too short product name' };
  }
  if (name?.length > 100) {
    return { valid: false, error: 'Too long product name' };
  }
  if (stock && stock < 0) {
    return { valid: false, error: 'Product stock must be a positive number' };
  }
  if (price && price <= 0) {
    return { valid: false, error: 'Product price must be a positive number' };
  }

  return { valid: true };
}

/**
 * Checks shipping info for an order: fullName, address (at least 4 characters), city, postalCode (3–10 characters), and phone (Egyptian mobile: 01 followed by 0, 1, 2, or 5, then 8 digits).
 * Input: shippingInfo (object, optional) — { fullName, address, city, postalCode, phone }.
 * Possible outputs:
 *   - { valid: true } — all fields are present and valid.
 *   - { valid: false, error: 'Full Name is required' }
 *   - { valid: false, error: 'Shipping address is required' }
 *   - { valid: false, error: 'Shipping city is required' }
 *   - { valid: false, error: 'Shipping postalCode is required' }
 *   - { valid: false, error: 'Shipping phone is required' }
 *   - { valid: false, error: 'Too short shipping address' } — address has less than 4 characters.
 *   - { valid: false, error: 'Invalid postal code' } — postalCode not between 3 and 10 characters.
 *   - { valid: false, error: 'Invalid phone number' } — phone doesn't match Egyptian mobile format (e.g. 01xxxxxxxxx).
 */
export function validateShippingInfo(shippingInfo) {
  if (!shippingInfo?.fullName)
    return { valid: false, error: 'Full Name is required' };
  if (!shippingInfo?.address)
    return { valid: false, error: 'Shipping address is required' };
  if (!shippingInfo?.city)
    return { valid: false, error: 'Shipping city is required' };
  if (!shippingInfo?.postalCode)
    return { valid: false, error: 'Shipping postalCode is required' };
  if (!shippingInfo?.phone)
    return { valid: false, error: 'Shipping phone is required' };

  if (shippingInfo.address.length < 4)
    return { valid: false, error: 'Too short shipping address' };
  if (shippingInfo.postalCode.length < 3 || shippingInfo.postalCode.length > 10)
    return { valid: false, error: 'Invalid postal code' };
  if (!/^01[0125][0-9]{8}$/.test(shippingInfo.phone))
    return { valid: false, error: 'Invalid phone number' };

  return { valid: true };
}
