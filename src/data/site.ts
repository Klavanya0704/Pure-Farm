export const SITE = {
  name: "PureFarm",
  tagline: "Digital Agriculture Platform",
  phone: "+91 83400 25913",
  whatsapp: "918340025913",
  email: "support@purefarm.in",
  address: "PureFarm Agri Services, Amritsar, Punjab 143001, India",
};

export function waLink(message: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const FARMER = {
  name: "Ravi Kumar",
  role: "Farmer",
  location: "Amritsar, Punjab",
  landSize: "12 acres",
};
