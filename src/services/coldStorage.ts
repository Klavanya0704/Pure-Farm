import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface ColdStorageFacility {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  state: "Andhra Pradesh" | "Telangana" | string;
  latitude: number | null;
  longitude: number | null;
  distance: number | null;
  capacity: number; // Installed capacity in MT
  available_capacity: number | null; // null if live availability not published
  occupied_capacity?: number | null; // calculated when available_capacity is present
  utilization_percentage?: number | null; // calculated when available_capacity is present
  contact_number: string | null;
  status: "Operational" | "Maintenance" | "Full" | "Closed" | "Current status not published" | string;
  source: string;
  source_url: string | null;
  source_type: "verified_directory" | "verification_sample";
  verified_at?: string;
  created_at?: string;
  updated_at?: string;
  calculatedDistance?: number;
}

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function parseRawColdStorage(item: any): ColdStorageFacility {
  let cleanAddress = item.address || "";
  let state = "Andhra Pradesh";
  let district = "General";
  let city = "Main Area";
  let source = "Government Directory";
  let source_url: string | null = "https://nhb.gov.in";
  let source_type: "verified_directory" | "verification_sample" = "verified_directory";
  let statusDisplay = "Current status not published";

  const match = cleanAddress.match(
    /(.*?)\[State:\s*(.*?)\s*\|\s*District:\s*(.*?)\s*\|\s*City:\s*(.*?)\s*\|\s*Source:\s*(.*?)\s*\|\s*SourceURL:\s*(.*?)\s*\|\s*Type:\s*(.*?)(?:\s*\|\s*Status:\s*(.*?))?\]/
  );

  if (match) {
    cleanAddress = match[1].trim();
    state = match[2].trim();
    district = match[3].trim();
    city = match[4].trim();
    source = match[5].trim();
    source_url = match[6].trim();
    source_type = match[7].trim() as any;
    if (match[8]) {
      statusDisplay = match[8].trim();
    }
  } else {
    if (cleanAddress.toLowerCase().includes("telangana")) {
      state = "Telangana";
    } else {
      state = "Andhra Pradesh";
    }
    if (item.status && item.status.toLowerCase() !== "operational" && item.status.toLowerCase() !== "information unavailable") {
      statusDisplay = item.status;
    }
  }

  const capacityMT = Number(item.capacity || 0);

  const availCap =
    item.available_capacity !== null &&
    item.available_capacity !== undefined &&
    Number(item.available_capacity) >= 0
      ? Number(item.available_capacity)
      : null;

  let occupiedCap: number | null = null;
  let utilizationPct: number | null = null;

  if (availCap !== null && capacityMT > 0) {
    occupiedCap = Math.max(0, capacityMT - availCap);
    utilizationPct = Math.round((occupiedCap / capacityMT) * 100);
  }

  return {
    id: item.id || `cs-${Math.random().toString(36).substr(2, 9)}`,
    name: item.name,
    address: cleanAddress,
    district,
    city,
    state,
    latitude: item.latitude ? Number(item.latitude) : null,
    longitude: item.longitude ? Number(item.longitude) : null,
    distance: item.distance !== null && item.distance !== undefined ? Number(item.distance) : null,
    capacity: capacityMT,
    available_capacity: availCap,
    occupied_capacity: occupiedCap,
    utilization_percentage: utilizationPct,
    contact_number: item.contact_number && item.contact_number !== "Not available" ? item.contact_number : null,
    status: statusDisplay,
    source,
    source_url,
    source_type,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

export const DEFAULT_RAW_COLD_STORAGES = [
  // --- ANDHRA PRADESH ---
  {
    id: "cs-ap-1",
    name: "Amaralingeswara Cold Storage Pvt Ltd",
    address: "Macharla Road, Nadikudi Village, Dachepally Mandal, Guntur, Andhra Pradesh - 522221 [State: Andhra Pradesh | District: Guntur | City: Dachepally | Source: NHB Government Registry | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 16.6025,
    longitude: 79.9482,
    capacity: 6000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-2",
    name: "Kandaveedu Cold Storage Pvt Ltd",
    address: "Behind Mirchi Yard, Nallapadu Road, Guntur, Andhra Pradesh - 522004 [State: Andhra Pradesh | District: Guntur | City: Guntur | Source: NHB / AP Food Processing Society | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 16.3067,
    longitude: 80.4365,
    capacity: 5000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-3",
    name: "Marri Cold Storage",
    address: "APMC Market Yard Area, Nallapadu, Guntur, Andhra Pradesh - 522004 [State: Andhra Pradesh | District: Guntur | City: Guntur | Source: NHB Government Registry | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 16.2980,
    longitude: 80.4210,
    capacity: 23000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-4",
    name: "Tirumala Cold Storage Pvt Ltd",
    address: "Nallapadu Road, Guntur, Andhra Pradesh - 522005 [State: Andhra Pradesh | District: Guntur | City: Guntur | Source: NHB / Ministry of Agriculture | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 16.3012,
    longitude: 80.4285,
    capacity: 5500,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-5",
    name: "Himagiri Cold Storage Pvt Ltd",
    address: "Nallapadu Industrial Area, Guntur, Andhra Pradesh - 522005 [State: Andhra Pradesh | District: Guntur | City: Guntur | Source: NHB Government Directory | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 16.3045,
    longitude: 80.4310,
    capacity: 5000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-6",
    name: "Vijaya Saradhi Cold Storage Pvt Ltd",
    address: "Auto Nagar Main Road, Guntur, Andhra Pradesh - 522001 [State: Andhra Pradesh | District: Guntur | City: Guntur | Source: NHB / Ministry of Agriculture | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 16.3120,
    longitude: 80.4560,
    capacity: 6000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-7",
    name: "Paramount Cold Storage Private Limited",
    address: "D.No. 5-832, R.S. No. 22/1, Nawabpet, Penuganchiprolu, Krishna, Andhra Pradesh - 521190 [State: Andhra Pradesh | District: Krishna | City: Penuganchiprolu | Source: MoFPI Government Directory | SourceURL: https://www.mofpi.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 16.9125,
    longitude: 80.2640,
    capacity: 5000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-8",
    name: "Yelamanchili Cold Storage Private Limited",
    address: "Survey No. 116/3, Keesara Village, Kanchikacherla Mandal, Krishna, Andhra Pradesh - 521185 [State: Andhra Pradesh | District: Krishna | City: Kanchikacherla | Source: MoFPI Government Directory | SourceURL: https://www.mofpi.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 16.6630,
    longitude: 80.3950,
    capacity: 4500,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-9",
    name: "Gayatri Cold Storages",
    address: "6-62 Raythupet, Nandigama, Krishna, Andhra Pradesh - 521185 [State: Andhra Pradesh | District: Krishna | City: Nandigama | Source: NHB / AP Agriculture Directory | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 16.7820,
    longitude: 80.2890,
    capacity: 5000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-10",
    name: "Gsr Cold Storage",
    address: "Bye-Pass Road, Gollapudi, Vijayawada, Krishna, Andhra Pradesh - 520012 [State: Andhra Pradesh | District: Krishna | City: Vijayawada | Source: NHB / AP Food Processing Society | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 16.5380,
    longitude: 80.5890,
    capacity: 5000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-11",
    name: "Himalaya Cold Storage Pvt. Ltd.",
    address: "MBY Road, Punganur, Chittoor, Andhra Pradesh - 517247 [State: Andhra Pradesh | District: Chittoor | City: Punganur | Source: NHB Government Registry | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 13.3650,
    longitude: 78.5810,
    capacity: 5000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-12",
    name: "Krishna Cold Storage Pvt. Ltd.",
    address: "Industrial Estate Road, Punganur, Chittoor, Andhra Pradesh - 517247 [State: Andhra Pradesh | District: Chittoor | City: Punganur | Source: NHB / AP Food Processing Society | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 13.3680,
    longitude: 78.5840,
    capacity: 4800,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-13",
    name: "Madanapally Cold Storage Pvt. Ltd.",
    address: "CTM Road, Madanapalle, Andhra Pradesh - 517325 [State: Andhra Pradesh | District: Chittoor | City: Madanapalle | Source: NHB Government Registry | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 13.5570,
    longitude: 78.5030,
    capacity: 5200,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-14",
    name: "Himashikar Cold Storage Pvt. Ltd.",
    address: "Rahamathpur Village, Hindupur Road, Anantapur Region, Andhra Pradesh - 515201 [State: Andhra Pradesh | District: Anantapur | City: Hindupur | Source: NHB / MIDH Government Directory | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 13.8290,
    longitude: 77.4910,
    capacity: 3930,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-15",
    name: "Kaveri Cold Storage Pvt. Ltd.",
    address: "Industrial Area, Rahamathpur, Anantapur Region, Andhra Pradesh - 515201 [State: Andhra Pradesh | District: Anantapur | City: Hindupur | Source: NHB / MIDH Government Directory | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 13.8320,
    longitude: 77.4950,
    capacity: 4200,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-16",
    name: "Premier Cold Storage Pvt. Ltd.",
    address: "Penukonda Highway, Hindupur, Anantapur Region, Andhra Pradesh - 515201 [State: Andhra Pradesh | District: Anantapur | City: Hindupur | Source: NHB Government Registry | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 13.8350,
    longitude: 77.4980,
    capacity: 5500,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-17",
    name: "Sarwani Cold Storage Pvt. Ltd.",
    address: "NH-16 Bypass, Ongole, Prakasam, Andhra Pradesh - 523001 [State: Andhra Pradesh | District: Prakasam | City: Ongole | Source: NHB / MIDH Government Directory | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 15.5057,
    longitude: 80.0499,
    capacity: 10000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-18",
    name: "Kurnool Multi-Commodity Cold Storage",
    address: "APMC Market Yard Complex, Nandyal Road, Kurnool, Andhra Pradesh - 518002 [State: Andhra Pradesh | District: Kurnool | City: Kurnool | Source: NHB / AP Agriculture Dept | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 15.8281,
    longitude: 78.0373,
    capacity: 4000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-19",
    name: "Vizag Cold Storage (P) Ltd",
    address: "Autonagar Industrial Area, Gajuwaka, Visakhapatnam, Andhra Pradesh - 530026 [State: Andhra Pradesh | District: Visakhapatnam | City: Visakhapatnam | Source: MoFPI Government Directory | SourceURL: https://www.mofpi.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.6868,
    longitude: 83.2185,
    capacity: 3500,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-20",
    name: "Godavari Agro Fresh Storage",
    address: "Kadiyam NH-16 Highway, Rajahmundry Rural, East Godavari, Andhra Pradesh - 533126 [State: Andhra Pradesh | District: East Godavari | City: Rajahmundry | Source: NHB / AP Food Processing Society | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 16.9142,
    longitude: 81.8315,
    capacity: 5000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ap-21",
    name: "Delta Integrated Cold Chain & Logistics",
    address: "Industrial Estate Road, Eluru, West Godavari, Andhra Pradesh - 534002 [State: Andhra Pradesh | District: West Godavari | City: Eluru | Source: NHB Government Registry | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 16.7107,
    longitude: 81.0952,
    capacity: 2500,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },

  // --- TELANGANA ---
  {
    id: "cs-ts-1",
    name: "Global Cold Storage Pvt Ltd",
    address: "Armoor Road, Nizamabad, Telangana - 503003 [State: Telangana | District: Nizamabad | City: Nizamabad | Source: Telangana Govt / NHB Directory | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 18.6725,
    longitude: 78.0941,
    capacity: 11102,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-2",
    name: "ABHAYA WAREHOUSE PVT. LTD.",
    address: "Wyra Road, Khammam, Telangana - 507002 [State: Telangana | District: Khammam | City: Khammam | Source: Telangana State Food Processing Society | SourceURL: https://telangana.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.2473,
    longitude: 80.1514,
    capacity: 9539,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-3",
    name: "Smart Agro Food Park Cold Storage Unit",
    address: "Central Processing Centre, Smart Agro Food Park, Nandipet, Nizamabad, Telangana - 503212 [State: Telangana | District: Nizamabad | City: Nandipet | Source: MoFPI / TSIIC Telangana Govt | SourceURL: https://www.mofpi.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 18.8210,
    longitude: 78.0120,
    capacity: 5600,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-4",
    name: "Kyathams Sri Vidya Cold Storage Private Limited",
    address: "Pedda Golconda Village, Shamshabad Mandal, Rangareddy, Telangana - 501218 [State: Telangana | District: Rangareddy | City: Shamshabad | Source: NHB / Telangana Food Processing Society | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.2340,
    longitude: 78.4110,
    capacity: 6000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-5",
    name: "Sai Radhakrishna Cold Storage Pvt Ltd",
    address: "Nagarjuna Sagar Road, Ibrahimpatnam, Rangareddy, Telangana - 501506 [State: Telangana | District: Rangareddy | City: Ibrahimpatnam | Source: NHB Government Registry | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.1850,
    longitude: 78.6490,
    capacity: 5000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-6",
    name: "Hyndavi Cold Storage P Ltd",
    address: "Enumamula Market Yard Road, Warangal, Telangana - 506013 [State: Telangana | District: Warangal | City: Warangal | Source: Telangana Agriculture / NHB Directory | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.9689,
    longitude: 79.6205,
    capacity: 6000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-7",
    name: "Ambika Cold Storage Pvt Ltd",
    address: "Enumamula Agricultural Market Yard, Warangal, Telangana - 506013 [State: Telangana | District: Warangal | City: Warangal | Source: NHB Government Directory | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.9712,
    longitude: 79.6231,
    capacity: 4350,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-8",
    name: "Moksha Cold Storage Pvt Ltd",
    address: "Khammam Highway, Warangal, Telangana - 506006 [State: Telangana | District: Warangal | City: Warangal | Source: NHB Government Registry | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.9540,
    longitude: 79.6100,
    capacity: 6000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-9",
    name: "Mallishwara Cold Storage Pvt Ltd",
    address: "Mulugu Road, Warangal, Telangana - 506007 [State: Telangana | District: Warangal | City: Warangal | Source: NHB Government Registry | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.9810,
    longitude: 79.6010,
    capacity: 3708,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-10",
    name: "Vagdevi Cold Storage Pvt Ltd",
    address: "Hunter Road, Shyampet, Warangal, Telangana - 506001 [State: Telangana | District: Warangal | City: Warangal | Source: NHB / Telangana Food Processing | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.9620,
    longitude: 79.5890,
    capacity: 4000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-11",
    name: "Khammam Cold Storage (P) Ltd",
    address: "Trunk Road, Mirchi Yard Area, Khammam, Telangana - 507001 [State: Telangana | District: Khammam | City: Khammam | Source: Telangana Agriculture Dept / NHB | SourceURL: https://telangana.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.2510,
    longitude: 80.1420,
    capacity: 7500,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-12",
    name: "Raghavendra Sai Sree Cold Storage Pvt Ltd",
    address: "M.G. Road, Khammam, Telangana - 507003 [State: Telangana | District: Khammam | City: Khammam | Source: Telangana State Agros / NHB | SourceURL: https://telangana.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.2450,
    longitude: 80.1490,
    capacity: 5000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-13",
    name: "Sambhavi Cold Storage (P) Ltd",
    address: "Industrial Area, Wyra Road, Khammam, Telangana - 507002 [State: Telangana | District: Khammam | City: Khammam | Source: Telangana Food Processing Society | SourceURL: https://telangana.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.2490,
    longitude: 80.1550,
    capacity: 6500,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-14",
    name: "Nalgonda Farmer Cold Storage Hub",
    address: "Miryalaguda Road, Nalgonda, Telangana - 508001 [State: Telangana | District: Nalgonda | City: Nalgonda | Source: Telangana Govt Horticulture Directory | SourceURL: https://telangana.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.0577,
    longitude: 79.2684,
    capacity: 5000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-15",
    name: "Karimnagar Agro Refrigeration Depot",
    address: "Jagtial Road, Karimnagar, Telangana - 505001 [State: Telangana | District: Karimnagar | City: Karimnagar | Source: NHB / Telangana Agros | SourceURL: https://nhb.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 18.4386,
    longitude: 79.1288,
    capacity: 4500,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-16",
    name: "Medak Cold Preservation Logistics",
    address: "Mumbai Highway (NH-65), Zaheerabad, Sangareddy, Telangana - 502220 [State: Telangana | District: Medak | City: Zaheerabad | Source: MoFPI / Telangana Food Processing | SourceURL: https://www.mofpi.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 17.6811,
    longitude: 77.6083,
    capacity: 10000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },
  {
    id: "cs-ts-17",
    name: "Mahabubnagar Commercial Cold Storage",
    address: "Jadcherla Highway, Mahabubnagar, Telangana - 509001 [State: Telangana | District: Mahabubnagar | City: Mahabubnagar | Source: Telangana Horticulture Dept | SourceURL: https://telangana.gov.in | Type: verified_directory | Status: Current status not published]",
    latitude: 16.7488,
    longitude: 78.0035,
    capacity: 4000,
    available_capacity: -1,
    contact_number: "Not available",
    status: "operational"
  },

  // --- SAMPLE VERIFICATION RECORDS ---
  {
    id: "cs-sample-1",
    name: "Eluru Cold Storage",
    address: "Eluru, Andhra Pradesh - 534002 [State: Andhra Pradesh | District: West Godavari | City: Eluru | Source: Internal System Sample | SourceURL: https://purefarm.org | Type: verification_sample | Status: Operational]",
    latitude: 16.7107,
    longitude: 81.0952,
    capacity: 1000,
    available_capacity: 650,
    contact_number: "+91 98765 43210",
    status: "operational"
  },
  {
    id: "cs-sample-2",
    name: "Guntur Agri Cold Storage",
    address: "Guntur, Andhra Pradesh - 522004 [State: Andhra Pradesh | District: Guntur | City: Guntur | Source: Internal System Sample | SourceURL: https://purefarm.org | Type: verification_sample | Status: Operational]",
    latitude: 16.3067,
    longitude: 80.4365,
    capacity: 1500,
    available_capacity: 420,
    contact_number: "+91 98765 43211",
    status: "operational"
  },
  {
    id: "cs-sample-3",
    name: "Duggirala Cold Storage",
    address: "Duggirala, Guntur, Andhra Pradesh - 522330 [State: Andhra Pradesh | District: Guntur | City: Duggirala | Source: Internal System Sample | SourceURL: https://purefarm.org | Type: verification_sample | Status: Full]",
    latitude: 16.3285,
    longitude: 80.6242,
    capacity: 2000,
    available_capacity: 0,
    contact_number: "+91 98765 43212",
    status: "full"
  }
];

export async function getColdStorageFacilities(options?: {
  search?: string;
  stateFilter?: string; // "all" | "Andhra Pradesh" | "Telangana"
  districtFilter?: string; // "all" | district name
  capacityRange?: string; // "all" | "under_1k" | "1k_5k" | "5k_10k" | "above_10k" | "small" | "medium" | "large"
  statusFilter?: string; // "all" | "Operational" | "Full" | "Maintenance" | "not_published"
  availabilityFilter?: string; // "all" | "available" | "full" | "unknown" | "published" | "not_published"
  sourceTypeFilter?: "all" | "verified_directory" | "verification_sample";
  userLat?: number | null;
  userLng?: number | null;
  sortOrder?: "nearest" | "name_asc" | "name_desc" | "capacity_high" | "capacity_low" | "remaining_high" | "remaining_low" | "utilization_high" | "utilization_low";
}): Promise<ColdStorageFacility[]> {
  let facilities: ColdStorageFacility[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("cold_storage")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching cold storage facilities from Supabase:", error.message);
        throw error;
      }

      if (data && data.length > 0) {
        facilities = data.map((item) => parseRawColdStorage(item));
      }
    } catch (err) {
      console.error("Error fetching cold storage facilities from Supabase:", err);
      facilities = [];
    }
  }

  if (facilities.length === 0) {
    facilities = DEFAULT_RAW_COLD_STORAGES.map((item) => parseRawColdStorage(item));
  }

  // Calculate distance if user lat/lng is available
  if (options?.userLat && options?.userLng) {
    facilities = facilities.map((facility) => {
      if (facility.latitude && facility.longitude) {
        const dist = calculateHaversineDistance(
          options.userLat!,
          options.userLng!,
          facility.latitude,
          facility.longitude,
        );
        return { ...facility, calculatedDistance: dist };
      }
      return facility;
    });
  }

  // Filter by Source Type: default to 'all' so farmers can see available/full sample data alongside verified directory items
  const targetSourceType = options?.sourceTypeFilter || "all";
  if (targetSourceType !== "all") {
    facilities = facilities.filter((f) => f.source_type === targetSourceType);
  }

  // Filter by State
  if (options?.stateFilter && options.stateFilter !== "all") {
    const sf = options.stateFilter.toLowerCase();
    facilities = facilities.filter((f) => f.state.toLowerCase() === sf);
  }

  // Filter by District
  if (options?.districtFilter && options.districtFilter !== "all") {
    const df = options.districtFilter.toLowerCase();
    facilities = facilities.filter((f) => f.district.toLowerCase() === df);
  }

  // Filter by Capacity Range
  if (options?.capacityRange && options.capacityRange !== "all") {
    facilities = facilities.filter((f) => {
      if (options.capacityRange === "under_1k") return f.capacity < 1000;
      if (options.capacityRange === "1k_5k") return f.capacity >= 1000 && f.capacity < 5000;
      if (options.capacityRange === "5k_10k") return f.capacity >= 5000 && f.capacity <= 10000;
      if (options.capacityRange === "above_10k") return f.capacity > 10000;
      if (options.capacityRange === "small") return f.capacity < 5000;
      if (options.capacityRange === "medium") return f.capacity >= 5000 && f.capacity <= 10000;
      if (options.capacityRange === "large") return f.capacity > 10000;
      return true;
    });
  }

  // Filter by Availability Status
  if (options?.availabilityFilter && options.availabilityFilter !== "all") {
    facilities = facilities.filter((f) => {
      const avail = f.available_capacity;
      if (options.availabilityFilter === "available") {
        return avail !== null && avail !== undefined && avail > 0;
      }
      if (options.availabilityFilter === "full") {
        return avail !== null && avail !== undefined && avail === 0;
      }
      if (options.availabilityFilter === "unknown" || options.availabilityFilter === "not_published") {
        return avail === null || avail === undefined;
      }
      if (options.availabilityFilter === "published") {
        return avail !== null && avail !== undefined;
      }
      return true;
    });
  }

  // Filter by Operational Status
  if (options?.statusFilter && options.statusFilter !== "all") {
    facilities = facilities.filter((f) => {
      const st = f.status.toLowerCase();
      if (options.statusFilter === "not_published") {
        return st.includes("not published") || st.includes("unavailable");
      }
      return st.includes(options.statusFilter!.toLowerCase());
    });
  }

  // Search across facility name, district, city/town, address, state
  if (options?.search && options.search.trim()) {
    const q = options.search.trim().toLowerCase();
    facilities = facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) ||
        f.state.toLowerCase().includes(q),
    );
  }

  // Sorting
  facilities.sort((a, b) => {
    if (options?.sortOrder === "remaining_high") {
      const rA = a.available_capacity ?? -1;
      const rB = b.available_capacity ?? -1;
      if (rA !== rB) return rB - rA;
      return b.capacity - a.capacity;
    }
    if (options?.sortOrder === "remaining_low") {
      const rA = a.available_capacity ?? 999999;
      const rB = b.available_capacity ?? 999999;
      if (rA !== rB) return rA - rB;
      return b.capacity - a.capacity;
    }
    if (options?.sortOrder === "utilization_high") {
      const uA = a.utilization_percentage ?? -1;
      const uB = b.utilization_percentage ?? -1;
      if (uA !== uB) return uB - uA;
      return b.capacity - a.capacity;
    }
    if (options?.sortOrder === "utilization_low") {
      const uA = a.utilization_percentage ?? 999;
      const uB = b.utilization_percentage ?? 999;
      if (uA !== uB) return uA - uB;
      return b.capacity - a.capacity;
    }
    if (options?.sortOrder === "name_asc") {
      return a.name.localeCompare(b.name);
    }
    if (options?.sortOrder === "name_desc") {
      return b.name.localeCompare(a.name);
    }
    if (options?.sortOrder === "capacity_high") {
      return b.capacity - a.capacity;
    }
    if (options?.sortOrder === "capacity_low") {
      return a.capacity - b.capacity;
    }
    // Default or "nearest": sort by calculatedDistance if available, otherwise by capacity
    const distA = a.calculatedDistance ?? (options?.userLat && options?.userLng ? 99999 : 0);
    const distB = b.calculatedDistance ?? (options?.userLat && options?.userLng ? 99999 : 0);
    if (distA !== distB) {
      return distA - distB;
    }
    return b.capacity - a.capacity;
  });

  return facilities;
}

export async function updateFacilityCapacity(
  facilityId: string,
  availableCapacityMT: number,
  status?: string,
): Promise<ColdStorageFacility | null> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase connection is required to update facility capacity.");
  }

  const { data, error } = await supabase
    .from("cold_storage")
    .update({
      available_capacity: availableCapacityMT,
      status: status || "operational",
      updated_at: new Date().toISOString(),
    })
    .eq("id", facilityId)
    .select();

  if (error) {
    console.error("Error updating facility capacity in Supabase:", error);
    throw error;
  }

  return data && data.length > 0 ? parseRawColdStorage(data[0]) : null;
}
