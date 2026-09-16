export type Language = 'en' | 'te';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & App Shell
    "PureFarm": "PureFarm",
    "Connect - Grow - Prosper": "Connect - Grow - Prosper",
    "Management": "Management",
    "Main Navigation": "Main Navigation",
    "Account & Activity": "Account & Activity",
    "Account & Shopping": "Account & Shopping",
    "Career": "Career",
    "More Information": "More Information",

    // Roles
    "Farmer": "Farmer",
    "Buyer": "Buyer",
    "Student": "Student",
    "Seller": "Seller",
    "Admin": "Admin",
    "Guest": "Guest",

    // Nav Items
    "Home": "Home",
    "Marketplace": "Marketplace",
    "Market Prices": "Market Prices",
    "Cold Storage": "Cold Storage",
    "Schemes": "Schemes",
    "Crop Insurance": "Crop Insurance",
    "Weather": "Weather",
    "Learn": "Learn",
    "Courses": "Courses",
    "Internships": "Internships",
    "Crop Calendar": "Crop Calendar",
    "Notifications": "Notifications",
    "My Products (Sell)": "My Products (Sell)",
    "My Orders": "My Orders",
    "My Cart": "My Cart",
    "Browse Catalog": "Browse Catalog",
    "My Courses": "My Courses",
    "My Applications": "My Applications",
    "Certificates": "Certificates",
    "Admin Console": "Admin Console",
    "Admin Overview": "Admin Overview",
    "Manage Products": "Manage Products",
    "All Orders": "All Orders",
    "About Us": "About Us",
    "Support": "Support",
    "Contact Us": "Contact Us",

    // Callout
    "Sell Your Produce": "Sell Your Produce",
    "Register as a Farmer to sell your harvest directly.": "Register as a Farmer to sell your harvest directly.",
    "Farmer Registration": "Farmer Registration",

    // Header Controls
    "Search for products, crops, tools, seeds...": "Search for products, crops, tools, seeds...",
    "Search...": "Search...",
    "Sign In": "Sign In",
    "Register": "Register",
    "Logout": "Logout",
    "Language": "Language",

    // Dashboards
    "Farmer Dashboard": "Farmer Dashboard",
    "Buyer Dashboard": "Buyer Dashboard",
    "Student Dashboard": "Student Dashboard",
    "Welcome": "Welcome",
    "Digital Agriculture Platform": "Digital Agriculture Platform",
    "Compare mandi prices, cold storage, schemes, weather, and sell your produce directly.": "Compare mandi prices, cold storage, schemes, weather, and sell your produce directly.",
    "Browse fresh produce directly from verified local farmers.": "Browse fresh produce directly from verified local farmers.",
    "Access agricultural courses, internships, and skill training.": "Access agricultural courses, internships, and skill training.",

    // Dashboard Cards / Quick Actions
    "Quick Actions": "Quick Actions",
    "Sell Harvest": "Sell Harvest",
    "Check Mandi Rates": "Check Mandi Rates",
    "Find Cold Storage": "Find Cold Storage",
    "Apply Schemes": "Apply Schemes",
    "Check Weather": "Check Weather",
    "Crop Protection": "Crop Protection",
    "Recent Orders": "Recent Orders",
    "Active Listed Products": "Active Listed Products",
    "Total Earnings": "Total Earnings",
    "My Applications Status": "My Applications Status",
    "Enrolled Courses": "Enrolled Courses",

    // Marketplace & Shopping
    "All Products": "All Products",
    "Filter by Category": "Filter by Category",
    "Price": "Price",
    "Quantity": "Quantity",
    "In Stock": "In Stock",
    "Out of Stock": "Out of Stock",
    "Add to Cart": "Add to Cart",
    "Buy Now": "Buy Now",
    "View Details": "View Details",
    "Category": "Category",
    "Supplier": "Supplier",
    "Farmer / Seller": "Farmer / Seller",

    // Cart & Checkout
    "Shopping Cart": "Shopping Cart",
    "Your Cart is Empty": "Your Cart is Empty",
    "Item Total": "Item Total",
    "Delivery Fee": "Delivery Fee",
    "Total Amount": "Total Amount",
    "Proceed to Checkout": "Proceed to Checkout",
    "Checkout": "Checkout",
    "Place Order": "Place Order",
    "Order Successful": "Order Successful",
    "Thank you for your order.": "Thank you for your order.",
    "Order ID": "Order ID",
    "Delivery Address": "Delivery Address",

    // Orders Page
    "Status": "Status",
    "Pending": "Pending",
    "Delivered": "Delivered",
    "Cancelled": "Cancelled",
    "Order Date": "Order Date",

    // Mandi Prices
    "Live Mandi Prices": "Live Mandi Prices",
    "Commodity": "Commodity",
    "Mandi / Market": "Mandi / Market",
    "Min Price": "Min Price",
    "Max Price": "Max Price",
    "Modal Price": "Modal Price",
    "Arrivals": "Arrivals",
    "State": "State",

    // Cold Storage
    "Cold Storage Facilities": "Cold Storage Facilities",
    "Search Storage Facilities": "Search Storage Facilities",
    "Capacity": "Capacity",
    "Available Space": "Available Space",
    "Rent Rate": "Rent Rate",
    "Contact Storage": "Contact Storage",

    // Government Schemes
    "Government Schemes": "Government Schemes",
    "Find farmer support programmes, eligibility, and official application links.": "Find farmer support programmes, eligibility, and official application links.",
    "Issuer": "Issuer",
    "Eligibility": "Eligibility",
    "Deadline": "Deadline",
    "Open Enrollment": "Open Enrollment",

    // Crop Insurance
    "Compare crop, weather, and allied farming insurance options. Click any card to open official scheme website.": "Compare crop, weather, and allied farming insurance options. Click any card to open official scheme website.",
    "Pradhan Mantri Fasal Bima Yojana": "Pradhan Mantri Fasal Bima Yojana",
    "Weather Based Crop Insurance": "Weather Based Crop Insurance",
    "Livestock Insurance Support": "Livestock Insurance Support",

    // Weather
    "Weather Forecast & Advisory": "Weather Forecast & Advisory",
    "Current Weather": "Current Weather",
    "Humidity": "Humidity",
    "Wind Speed": "Wind Speed",
    "Temperature": "Temperature",
    "Rainfall": "Rainfall",
    "Farming Advisory": "Farming Advisory",

    // Crop Calendar
    "Seasonal Crop Calendar": "Seasonal Crop Calendar",
    "Sowing": "Sowing",
    "Harvesting": "Harvesting",

    // Education & Internships
    "Agricultural Courses": "Agricultural Courses",
    "Learn modern farming techniques, agribusiness, and tech.": "Learn modern farming techniques, agribusiness, and tech.",
    "Enroll Now": "Enroll Now",
    "Enrolled": "Enrolled",
    "Duration": "Duration",
    "Instructor": "Instructor",
    "Level": "Level",
    "Internship Opportunities": "Internship Opportunities",
    "Apply Now": "Apply Now",
    "Applied": "Applied",
    "Stipend": "Stipend",
    "Company / Organization": "Company / Organization",
    "Certificates Earned": "Certificates Earned",
    "Download Certificate": "Download Certificate",
    "Issue Date": "Issue Date",

    // Auth
    "Sign in to your account": "Sign in to your account",
    "Email Address": "Email Address",
    "Password": "Password",
    "Full Name": "Full Name",
    "Phone Number": "Phone Number",
    "Select Role": "Select Role",
    "Don't have an account? Register": "Don't have an account? Register",
    "Already have an account? Sign In": "Already have an account? Sign In",

    // Common Buttons & Messages
    "Save": "Save",
    "Cancel": "Cancel",
    "Submit": "Submit",
    "Back": "Back",
    "Next": "Next",
    "Previous": "Previous",
    "Confirm": "Confirm",
    "Loading...": "Loading...",
    "Checking authorization...": "Checking authorization..."
  },

  te: {
    // Navigation & App Shell
    "PureFarm": "PureFarm",
    "Connect - Grow - Prosper": "కనెక్ట్ - పెంచండి - అభివృద్ధి చెందండి",
    "Management": "నిర్వహణ",
    "Main Navigation": "ముఖ్య విభాగం",
    "Account & Activity": "ఖాతా మరియు కార్యకలాపాలు",
    "Account & Shopping": "ఖాతా మరియు షాపింగ్",
    "Career": "కెరీర్",
    "More Information": "మరింత సమాచారం",

    // Roles
    "Farmer": "రైతు",
    "Buyer": "కొనుగోలుదారు",
    "Student": "విద్యార్థి",
    "Seller": "అమ్మకందారు",
    "Admin": "అడ్మిన్",
    "Guest": "అతిథి",

    // Nav Items
    "Home": "హోమ్",
    "Marketplace": "మార్కెట్ప్లేస్",
    "Market Prices": "మార్కెట్ ధరలు",
    "Cold Storage": "కోల్డ్ స్టోరేజ్",
    "Schemes": "ప్రభుత్వ పథకాలు",
    "Crop Insurance": "పంట బీమా",
    "Weather": "వాతావరణం",
    "Learn": "నేర్చుకోండి",
    "Courses": "కోర్సులు",
    "Internships": "ఇంటర్న్షిప్లు",
    "Crop Calendar": "పంట క్యాలెండర్",
    "Notifications": "నోటిఫికేషన్లు",
    "My Products (Sell)": "నా ఉత్పత్తులు (అమ్మకం)",
    "My Orders": "నా ఆర్డర్లు",
    "My Cart": "నా కార్ట్",
    "Browse Catalog": "ఉత్పత్తుల జాబితా చూడండి",
    "My Courses": "నా కోర్సులు",
    "My Applications": "నా అప్లికేషన్లు",
    "Certificates": "సర్టిఫికెట్లు",
    "Admin Console": "అడ్మిన్ కన్సోల్",
    "Admin Overview": "అడ్మిన్ అవలోకనం",
    "Manage Products": "ఉత్పత్తుల నిర్వహణ",
    "All Orders": "అన్ని ఆర్డర్లు",
    "About Us": "మా గురించి",
    "Support": "సహాయం",
    "Contact Us": "మమ్మల్ని సంప్రదించండి",

    // Callout
    "Sell Your Produce": "మీ పంటను అమ్మండి",
    "Register as a Farmer to sell your harvest directly.": "మీ పంటను నేరుగా విక్రయించడానికి రైతుగా నమోదు చేసుకోండి.",
    "Farmer Registration": "రైతు నమోదు",

    // Header Controls
    "Search for products, crops, tools, seeds...": "ఉత్పత్తులు, పంటలు, పరికరాలు, విత్తనాల కోసం శోధించండి...",
    "Search...": "శోధించండి...",
    "Sign In": "లాగిన్",
    "Register": "నమోదు చేసుకోండి",
    "Logout": "లాగ్ అవుట్",
    "Language": "భాష",

    // Dashboards
    "Farmer Dashboard": "రైతు డాష్బోర్డ్",
    "Buyer Dashboard": "కొనుగోలుదారు డాష్బోర్డ్",
    "Student Dashboard": "విద్యార్థి డాష్బోర్డ్",
    "Welcome": "స్వాగతం",
    "Digital Agriculture Platform": "డిజిటల్ వ్యవసాయ వేదిక",
    "Compare mandi prices, cold storage, schemes, weather, and sell your produce directly.": "మండీ ధరలు, కోల్డ్ స్టోరేజ్, పథకాలు, వాతావరణాన్ని పరిశీలించండి మరియు మీ ఉత్పత్తులను నేరుగా అమ్మండి.",
    "Browse fresh produce directly from verified local farmers.": "స్థానిక రైతుల నుండి నేరుగా తాజా వ్యవసాయ ఉత్పత్తులను కొనండి.",
    "Access agricultural courses, internships, and skill training.": "వ్యవసాయ కోర్సులు, ఇంటర్న్‌షిప్‌లు మరియు నైపుణ్య శిక్షణ పొందండి.",

    // Dashboard Cards / Quick Actions
    "Quick Actions": "శీఘ్ర చర్యలు",
    "Sell Harvest": "పంట అమ్మకం",
    "Check Mandi Rates": "మండీ ధరలు చూడండి",
    "Find Cold Storage": "కోల్డ్ స్టోరేజ్ వెతకండి",
    "Apply Schemes": "పథకాలకు దరఖాస్తు చేయండి",
    "Check Weather": "వాతావరణం చూడండి",
    "Crop Protection": "పంట సంరక్షణ",
    "Recent Orders": "ఇటీవలి ఆర్డర్లు",
    "Active Listed Products": "అందుబాటులో ఉన్న ఉత్పత్తులు",
    "Total Earnings": "మొత్తం ఆదాయం",
    "My Applications Status": "నా దరఖాస్తుల స్థితి",
    "Enrolled Courses": "చేరిన కోర్సులు",

    // Marketplace & Shopping
    "All Products": "అన్ని ఉత్పత్తులు",
    "Filter by Category": "వర్గం ద్వారా వడపోత",
    "Price": "ధర",
    "Quantity": "పరిమాణం",
    "In Stock": "స్టాక్ అందుబాటులో ఉంది",
    "Out of Stock": "స్టాక్ లేదు",
    "Add to Cart": "కార్ట్కు జోడించండి",
    "Buy Now": "ఇప్పుడే కొనండి",
    "View Details": "వివరాలు చూడండి",
    "Category": "వర్గం",
    "Supplier": "సరఫరాదారు",
    "Farmer / Seller": "రైతు / అమ్మకందారు",

    // Cart & Checkout
    "Shopping Cart": "షాపింగ్ కార్ట్",
    "Your Cart is Empty": "మీ కార్ట్ ఖాళీగా ఉంది",
    "Item Total": "ఉత్పత్తుల మొత్తం",
    "Delivery Fee": "డెలివరీ రుసుము",
    "Total Amount": "మొత్తం సొమ్ము",
    "Proceed to Checkout": "చెకౌట్కు వెళ్లండి",
    "Checkout": "చెకౌట్",
    "Place Order": "ఆర్డర్ చేయండి",
    "Order Successful": "ఆర్డర్ విజయవంతమైంది",
    "Thank you for your order.": "మీ ఆర్డర్‌కు ధన్యవాదాలు.",
    "Order ID": "ఆర్డర్ ఐడి",
    "Delivery Address": "డెలివరీ చిరునామా",

    // Orders Page
    "Status": "స్థితి",
    "Pending": "పెండింగ్",
    "Delivered": "రవాణా పూర్తయింది",
    "Cancelled": "రద్దయింది",
    "Order Date": "ఆర్డర్ తేదీ",

    // Mandi Prices
    "Live Mandi Prices": "లైవ్ మండీ ధరలు",
    "Commodity": "పంట / సరుకు",
    "Mandi / Market": "మండీ / మార్కెట్",
    "Min Price": "కనీస ధర",
    "Max Price": "గరిష్ట ధర",
    "Modal Price": "సగటు ధర",
    "Arrivals": "వచ్చిన పరిమాణం",
    "State": "రాష్ట్రం",

    // Cold Storage
    "Cold Storage Facilities": "కోల్డ్ స్టోరేజ్ కేంద్రాలు",
    "Search Storage Facilities": "కోల్డ్ స్టోరేజ్ కేంద్రాలను శోధించండి",
    "Capacity": "సామర్థ్యం",
    "Available Space": "ఖాళీ స్థలం",
    "Rent Rate": "అద్దె ధర",
    "Contact Storage": "సంప్రదించండి",

    // Government Schemes
    "Government Schemes": "ప్రభుత్వ పథకాలు",
    "Find farmer support programmes, eligibility, and official application links.": "రైతు సంక్షేమ పథకాలు, అర్హతలు మరియు అధికారిక అప్లికేషన్ లింక్‌లను కనుగొనండి.",
    "Issuer": "మంజూరు చేసిన శాఖ",
    "Eligibility": "అర్హత",
    "Deadline": "గడువు తేదీ",
    "Open Enrollment": "ఎప్పుడైనా దరఖాస్తు చేయవచ్చు",

    // Crop Insurance
    "Compare crop, weather, and allied farming insurance options. Click any card to open official scheme website.": "పంట బీమా, వాతావరణ బీమా మరియు పశుసంపద బీమా పథకాలను పరిశీలించి దరఖాస్తు చేయండి.",
    "Pradhan Mantri Fasal Bima Yojana": "ప్రధాన్ మంత్రి ఫసల్ బీమా యోజన",
    "Weather Based Crop Insurance": "వాతావరణ ఆధారిత పంట బీమా",
    "Livestock Insurance Support": "పశుసంపద బీమా మద్దతు",

    // Weather
    "Weather Forecast & Advisory": "వాతావరణ సమాచారం & సూచనలు",
    "Current Weather": "ప్రస్తుత వాతావరణం",
    "Humidity": "తేమ",
    "Wind Speed": "గాలి వేగం",
    "Temperature": "ఉష్ణోగ్రత",
    "Rainfall": "వర్షపాతం",
    "Farming Advisory": "వ్యవసాయ సూచనలు",

    // Crop Calendar
    "Seasonal Crop Calendar": "కాలాల వారీ పంటల క్యాలెండర్",
    "Sowing": "విత్తనాలు విత్తే కాలం",
    "Harvesting": "పంట కోత కాలం",

    // Education & Internships
    "Agricultural Courses": "వ్యవసాయ కోర్సులు",
    "Learn modern farming techniques, agribusiness, and tech.": "ఆధునిక సాగు పద్ధతులు, వ్యవసాయ వ్యాపారం మరియు సాంకేతికత నేర్చుకోండి.",
    "Enroll Now": "ఇప్పుడే చేరండి",
    "Enrolled": "చేరారు",
    "Duration": "వ్యవధి",
    "Instructor": "బోధకులు",
    "Level": "స్థాయి",
    "Internship Opportunities": "ఇంటర్న్‌షిప్ అవకాశాలు",
    "Apply Now": "ఇప్పుడే దరఖాస్తు చేయండి",
    "Applied": "దరఖాస్తు చేసారు",
    "Stipend": "స్టైపెండ్",
    "Company / Organization": "సంస్థ",
    "Certificates Earned": "సాధించిన సర్టిఫికెట్లు",
    "Download Certificate": "సర్టిఫికెట్ డౌన్‌లోడ్ చేసుకోండి",
    "Issue Date": "జారీ చేసిన తేదీ",

    // Auth
    "Sign in to your account": "మీ ఖాతాలోకి లాగిన్ అవ్వండి",
    "Email Address": "ఇమెయిల్ చిరునామా",
    "Password": "పాస్వర్డ్",
    "Full Name": "పూర్తి పేరు",
    "Phone Number": "ఫోన్ నంబర్",
    "Select Role": "పాత్రను ఎంచుకోండి",
    "Don't have an account? Register": "ఖాతా లేదా? నమోదు చేసుకోండి",
    "Already have an account? Sign In": "ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి",

    // Common Buttons & Messages
    "Save": "సేవ్ చేయండి",
    "Cancel": "రద్దు చేయండి",
    "Submit": "సమర్పించండి",
    "Back": "వెనుకకు",
    "Next": "తదుపరి",
    "Previous": "మునుపటి",
    "Confirm": "నిర్ధారించండి",
    "Loading...": "లోడ్ అవుతోంది...",
    "Checking authorization...": "అధికారాన్ని తనిఖీ చేస్తోంది..."
  },
};
