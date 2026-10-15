export const SITE = {
  name: "PureFarm",
  tagline: "Digital Agriculture Platform",
  logo: "/images/pure-farm-logo.png",
  phone: "+91 83400 25913",
  whatsapp: "918340025913",
  email: "support@purefarm.in",
  address: "Department of MBA, Einstein Block, Sasi Institute of Technology and Engineering, Tadepalligudem, West Godavari District, Andhra Pradesh, India.",
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
