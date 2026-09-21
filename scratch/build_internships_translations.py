import json
import re

internship_map = {
    "Agriculture Internship Hub": "వ్యవసాయ ఇంటర్న్షిప్ కేంద్రం",
    "Explore internships in agriculture, agritech, farming, horticulture, livestock, food processing, and rural development.": "వ్యవసాయం, అగ్రిటెక్, వ్యవసాయ నిర్వహణ, ఉద్యానవనం, పశుసంవర్ధక, ఆహార ప్రాసెసింగ్ మరియు గ్రామీణాభివృద్ధిలో ఇంటర్న్షిప్ అవకాశాలను అన్వేషించండి.",

    "All Internships": "అన్ని ఇంటర్న్షిప్లు",
    "Field Work": "ఫీల్డ్ వర్క్",
    "Research": "పరిశోధన",
    "Agritech": "అగ్రిటెక్",
    "Horticulture": "ఉద్యానవనం",
    "Livestock": "పశుసంవర్ధక",
    "Food Processing": "ఆహార ప్రాసెసింగ్",
    "Organic Farming": "సేంద్రీయ వ్యవసాయం",

    "AgriTech Field Operations Intern": "అగ్రిటెక్ ఫీల్డ్ ఆపరేషన్స్ ఇంటర్న్",
    "PureFarm Agri Services": "ప్యూర్ ఫామ్ అగ్రి సర్వీసెస్",
    "Rajahmundry, Andhra Pradesh": "రాజమండ్రి, ఆంధ్రప్రదేశ్",
    "Field Internship": "ఫీల్డ్ ఇంటర్న్షిప్",
    "Assist farmers with digital agriculture tools, crop monitoring, field data collection, and farm advisory activities.": "డిజిటల్ వ్యవసాయ సాధనాలు, పంటల పర్యవేక్షణ, క్షేత్ర డేటా సేకరణ మరియు వ్యవసాయ సలహా కార్యక్రమాల్లో రైతులకు సహాయం చేయండి.",
    "Crop Monitoring": "పంటల పర్యవేక్షణ",
    "Field Data Collection": "క్షేత్ర డేటా సేకరణ",
    "Farm Management": "వ్యవసాయ నిర్వహణ",

    "Crop Management Intern": "పంటల నిర్వహణ ఇంటర్న్",
    "GreenField Agri Research": "గ్రీన్ ఫీల్డ్ అగ్రి రీసెర్చ్",
    "Guntur, Andhra Pradesh": "గుంటూరు, ఆంధ్రప్రదేశ్",
    "Field + Research": "ఫీల్డ్ + రీసెర్చ్",
    "Support crop monitoring, crop growth observations, seasonal planning, and farm experiment activities.": "పంటల పర్యవేక్షణ, పంట పెరుగుదల పరిశీలన, కాలానుగుణ ప్రణాళిక మరియు వ్యవసాయ ప్రయోగ కార్యక్రమాల్లో సహాయం చేయండి.",
    "Agriculture Research": "వ్యవసాయ పరిశోధన",
    "Data Collection": "డేటా సేకరణ",

    "Soil & Fertilizer Management Intern": "నేల & ఎరువుల నిర్వహణ ఇంటర్న్",
    "AgriSoil Research Centre": "అగ్రిసాయిల్ రీసెర్చ్ సెంటర్",
    "Vijayawada, Andhra Pradesh": "విజయవాడ, ఆంధ్రప్రదేశ్",
    "Research Internship": "పరిశోధన ఇంటర్న్షిప్",
    "Learn soil testing, nutrient analysis, fertilizer recommendations, and soil health management.": "నేల పరీక్షలు, పోషకాల విశ్లేషణ, ఎరువుల సిఫార్సులు మరియు నేల ఆరోగ్య నిర్వహణ గురించి నేర్చుకోండి.",
    "Soil Testing": "నేల పరీక్షలు",
    "Nutrient Management": "పోషకాల నిర్వహణ",
    "Fertilizer Management": "ఎరువుల నిర్వహణ",

    "Smart Farming & Drone Intern": "స్మార్ట్ ఫార్మింగ్ & డ్రోన్ టెక్నాలజీ ఇంటర్న్",
    "AgriTech Innovations": "అగ్రిటెక్ ఇన్నోవేషన్స్",
    "Hyderabad, Telangana": "హైదరాబాద్, తెలంగాణ",
    "Agritech Internship": "అగ్రిటెక్ ఇంటర్న్షిప్",
    "Work with drones, remote sensing, crop monitoring, farm mapping, and precision agriculture technologies.": "డ్రోన్లు, రిమోట్ సెన్సింగ్, పంటల పర్యవేక్షణ, వ్యవసాయ మ్యాపింగ్ మరియు ఖచ్చితమైన వ్యవసాయ సాంకేతికతలతో పని చేయండి.",
    "Drone Technology": "డ్రోన్ టెక్నాలజీ",
    "Remote Sensing": "రిమోట్ సెన్సింగ్",
    "Precision Agriculture": "ఖచ్చితమైన వ్యవసాయం",

    "Horticulture Internship": "ఉద్యానవన వ్యవసాయ ఇంటర్న్షిప్",
    "GreenGrow Horticulture": "గ్రీన్ గ్రో హార్టికల్చర్",
    "Eluru, Andhra Pradesh": "ఏలూరు, ఆంధ్రప్రదేశ్",
    "Gain practical experience in vegetable cultivation, fruit crops, nursery management, and protected cultivation.": "కూరగాయల సాగు, పండ్ల పంటలు, నర్సరీ నిర్వహణ మరియు రక్షిత సాగులో ప్రాక్టికల్ అనుభవాన్ని పొందండి.",
    "Vegetable Cultivation": "కూరగాయల సాగు",
    "Nursery Management": "నర్సరీ నిర్వహణ",

    "Livestock & Dairy Management Intern": "పశుసంవర్ధక & డెయిరీ నిర్వహణ ఇంటర్న్",
    "Rural Livestock Development Centre": "రూరల్ లైవ్‌స్టాక్ డెవలప్‌మెంట్ సెంటర్",
    "Bhimavaram, Andhra Pradesh": "భీమవరం, ఆంధ్రప్రదేశ్",
    "Learn livestock care, dairy management, animal nutrition, farm hygiene, and basic livestock record keeping.": "పశువుల సంరక్షణ, డెయిరీ నిర్వహణ, పశువుల పోషణ, ఫార్మ్ పరిశుభ్రత మరియు పశుసంవర్ధక రికార్డుల నిర్వహణ గురించి నేర్చుకోండి.",
    "Livestock Management": "పశుసంవర్ధక నిర్వహణ",
    "Dairy Management": "డెయిరీ నిర్వహణ",
    "Animal Nutrition": "పశువుల పోషణ",

    "Food Processing & Post-Harvest Intern": "ఆహార ప్రాసెసింగ్ & కోత అనంతర నిర్వహణ ఇంటర్న్",
    "AgriFood Processing Unit": "అగ్రిఫుడ్ ప్రాసెసింగ్ యూనిట్",
    "Learn post-harvest handling, grading, packaging, storage, food processing, and value addition.": "కోత అనంతర నిర్వహణ, నాణ్యత వర్గీకరణ, ప్యాకేజింగ్, నిల్వ, ఆహార ప్రాసెసింగ్ మరియు విలువ ఆధారిత ఉత్పత్తుల గురించి నేర్చుకోండి.",
    "Post-Harvest Management": "కోత అనంతర నిర్వహణ",
    "Food Processing": "ఆహార ప్రాసెసింగ్",
    "Packaging": "ప్యాకేజింగ్",
    "Industry Internship": "పరిశ్రమ ఇంటర్న్షిప్",

    "Organic Farming Intern": "సేంద్రీయ వ్యవసాయ ఇంటర్న్",
    "Sustainable Farm Initiative": "సస్టైనబుల్ ఫార్మ్ ఇనిషియేటివ్",
    "West Godavari, Andhra Pradesh": "పశ్చిమ గోదావరి, ఆంధ్రప్రదేశ్",
    "Gain practical experience in organic cultivation, composting, natural inputs, crop rotation, and sustainable farming.": "సేంద్రీయ సాగు, కంపోస్టింగ్, సహజ వనరులు, పంట మార్పిడి మరియు సుస్థిర వ్యవసాయంలో ప్రాక్టికల్ అనుభవాన్ని పొందండి.",
    "Composting": "కంపోస్టింగ్",
    "Sustainable Agriculture": "సుస్థిర వ్యవసాయం",

    "Agricultural Extension Intern": "వ్యవసాయ విస్తరణ సేవల ఇంటర్న్",
    "Rural Farmer Support Foundation": "రూరల్ ఫార్మర్ సపోర్ట్ ఫౌండేషన్",
    "Work with farming communities and support farmer awareness programs, training sessions, and agricultural information sharing.": "రైతు సమాజాలతో కలిసి పనిచేసి, రైతుల అవగాహన కార్యక్రమాలు, శిక్షణా కార్యక్రమాలు మరియు వ్యవసాయ సమాచారాన్ని అందించడంలో సహాయం చేయండి.",
    "Farmer Training": "రైతు శిక్షణ",
    "Communication": "కమ్యూనికేషన్",
    "Agricultural Extension": "వ్యవసాయ విస్తరణ",
    "Community Internship": "కమ్యూనిటీ ఇంటర్న్షిప్",

    "Apply Now": "ఇప్పుడే దరఖాస్తు చేయండి",
    "Application Submitted ✓": "దరఖాస్తు సమర్పించబడింది ✓",
    "Back to Internships": "ఇంటర్న్షిప్లకు తిరిగి వెళ్ళండి",
    "Internship Details": "ఇంటర్న్షిప్ వివరాలు",
    "Overview & Role Description": "అవలోకనం & పాత్ర వివరణ",
    "Key Responsibilities": "ముఖ్యమైన బాధ్యతలు",
    "Required Skills": "కావలసిన నైపుణ్యాలు",
    "Eligibility & Requirements": "అర్హత & అవసరాలు",
    "Duration": "వ్యవధి",
    "Stipend": "స్టైపెండ్",
    "Location": "ప్రాంతం",
    "Posted": "పోస్ట్ చేయబడింది",
    "Deadline": "చివరి తేదీ",
    "Submit Application": "దరఖాస్తును సమర్పించండి",
    "Internship Not Found": "ఇంటర్న్షిప్ కనుగొనబడలేదు",
    "The requested internship could not be found.": "అభ్యర్థించిన ఇంటర్న్షిప్ కనుగొనబడలేదు.",
    "Full Name": "పూర్తి పేరు",
    "Mobile Number": "మొబైల్ నంబర్",
    "Brief Introduction / Cover Note": "పరిచయం / కవర్ నోట్",
    "Submit My Application": "నా దరఖాస్తును సమర్పించండి",
    "Application Form": "దరఖాస్తు పత్రం",
    "Your application has been submitted successfully!": "మీ దరఖాస్తు విజయవంతంగా సమర్పించబడింది!",
    "Search internships...": "ఇంటర్న్షిప్లను శోధించండి...",
    "Students or graduates in Agriculture, Agritech, Diploma, or related field.": "వ్యవసాయం, అగ్రిటెక్ లేదా అనుబంధ రంగాలలో డిప్లొమా/డిగ్రీ విద్యార్థులు.",
    "B.Sc or M.Sc Agriculture students.": "B.Sc లేదా M.Sc వ్యవసాయ విద్యార్థులు.",
    "Degree in Chemistry, Agriculture, or Environmental Science.": "కెమిస్ట్రీ, వ్యవసాయం లేదా పర్యావరణ శాస్త్రంలో డిగ్రీ.",
    "Engineering, Agritech, or Agriculture students interested in drone technology.": "డ్రోన్ టెక్నాలజీపై ఆసక్తి ఉన్న ఇంజనీరింగ్ లేదా అగ్రిటెక్ విద్యార్థులు.",
    "Students in Horticulture or Agriculture diplomas/degrees.": "హార్టికల్చర్ లేదా అగ్రికల్చర్ డిప్లొమా/డిగ్రీ విద్యార్థులు.",
    "Veterinary Science, Dairy Technology, or Animal Husbandry students.": "వెటర్నరీ సైన్స్, డెయిరీ టెక్నాలజీ లేదా పశుసంవర్ధక విద్యార్థులు.",
    "Food Technology, Agri Business, or Food Engineering students.": "ఫుడ్ టెక్నాలజీ, అగ్రి బిజినెస్ లేదా ఫుడ్ ఇంజనీరింగ్ విద్యార్థులు.",
    "Interest in organic agriculture, permaculture, or natural farming.": "సేంద్రీయ వ్యవసాయం లేదా ప్రకృతి సాగుపై ఆసక్తి ఉన్నవారు.",
    "Students in Rural Development, Social Work, or Agriculture.": "గ్రామీణాభివృద్ధి, సోషల్ వర్క్ లేదా వ్యవసాయ విద్యార్థులు.",

    # Responsibilities
    "Conduct daily field visits to registered farms in Rajahmundry region": "రాజమండ్రి ప్రాంతంలోని నమోదిత వ్యవసాయ క్షేత్రాలను ప్రతిరోజూ సందర్శించడం",
    "Assist farmers in using PureFarm mobile apps and digital tools": "ప్యూర్ ఫామ్ మొబైల్ యాప్‌లు మరియు డిజిటల్ టూల్స్‌ను ఉపయోగించడంలో రైతులకు సహాయం చేయడం",
    "Collect crop health data, soil advisory updates, and harvest readiness logs": "పంట ఆరోగ్య డేటాను సేకరించడం, నేల సలహాలు మరియు కోత సమాచారాన్ని నమోదు చేయడం",

    "Track crop growth stages, tillering, and leaf phenology in field plots": "పంట పెరుగుదల దశలు, పిలకలు తొడిగే దశ మరియు ఆకుల పరిణామాన్ని ట్రాక్ చేయడం",
    "Record weed density and pest occurrence in experimental trial plots": "ప్రయోగ క్షేత్రాలలో కలుపు తీవ్రత మరియు తెగుళ్ళ సంభవనీయతను నమోదు చేయడం",
    "Prepare seasonal crop rotation and sowing recommendations for regional crops": "ప్రాంతీయ పంటల కోసం కాలానుగుణ విత్తన మరియు పంట మార్పిడి సిఫార్సులను తయారు చేయడం",

    "Collect and prepare soil lab test samples from various field zones": "వివిధ ప్రాంతాల నుండి మట్టి ల్యాబ్ పరీక్ష నమూనాలను సేకరించడం మరియు సిద్ధం చేయడం",
    "Analyze pH, N-P-K levels, organic carbon, and electrical conductivity": "pH, N-P-K, సేంద్రీయ కార్బన్ మరియు విద్యుత్ వాహకతను విశ్లేషించడం",
    "Draft customized Soil Health Cards and fertilizer dose advisories": "సాయిల్ హెల్త్ కార్డ్‌లు మరియు ఎరువుల మోతాదు సలహాలను రూపొందించడం",

    "Assist in operating agricultural sprayer drones across field trials": "వ్యవసాయ స్ప్రేయర్ డ్రోన్లను నడపడంలో సహాయపడటం",
    "Map farm plots using multispectral drone sensors": "మల్టీస్పెక్ట్రల్ డ్రోన్ సెన్సార్లను ఉపయోగించి వ్యవసాయ క్షేత్రాలను మ్యాపింగ్ చేయడం",
    "Generate crop vigor maps (NDVI) for precision fertilizer application": "ఎరువుల వాడకం కోసం పంట పచ్చదనం మ్యాప్‌లను (NDVI) తయారు చేయడం",

    "Manage shade net nurseries, seedling germination, and plant grafting": "నీడ వల నర్సరీలు, విత్తనాల మొలకెత్తడం మరియు అంటుకట్టడాన్ని నిర్వహించడం",
    "Monitor drip fertigation schedules for polyhouse vegetable crops": "పాలిహౌస్ కూరగాయల కోసం డ్రిప్ ఫెర్టిగేషన్ సమయాలను పర్యవేక్షించడం",
    "Participate in post-harvest harvesting, grading, and packing of fruit crops": "పండ్ల కోత అనంతర నిర్వహణ, గ్రేడింగ్ మరియు ప్యాకింగ్‌లో పాల్గొనడం",

    "Assist in cattle feed ration calculation and silage preparation": "పశువుల మేత మోతాదు లెక్కింపు మరియు సైలేజ్ తయారీలో సహాయపడటం",
    "Monitor milking parlor hygiene, milk testing, and cold storage temperature": "పాలు పితికే కేంద్రాల పరిశుభ్రత మరియు కోల్డ్ స్టోరేజ్ ఉష్ణోగ్రతను పర్యవేక్షించడం",
    "Maintain animal health logs, ear tagging records, and vaccination schedules": "పశువుల ఆరోగ్య రికార్డులు, ఇయర్ ట్యాగింగ్ మరియు టీకాల సమాచారాన్ని నిర్వహించడం",

    "Operate sorting, grading, and vacuum packaging machinery for produce": "సార్టింగ్, గ్రేడింగ్ మరియు వ్యాక్యూమ్ ప్యాకేజింగ్ యంత్రాలను నడపడం",
    "Test moisture content and shelf-life stability of dried fruits & spices": "ఎండిన పండ్లు మరియు మసాలాల తేమ శాతం, నిల్వ కాలాన్ని పరీక్షించడం",
    "Follow FSSAI safety standards across processing and cold storage lines": "ప్రాసెసింగ్ మరియు కోల్డ్ స్టోరేజ్ పరికరాలలో FSSAI భద్రతా ప్రమాణాలను పాటించడం",

    "Prepare vermicompost, Panchagavya, Jeevamrutha, and neem bio-pesticides": "వర్మీకంపోస్ట్, పంచగవ్య, జీవామృతం మరియు వేప కషాయాలను తయారు చేయడం",
    "Implement crop rotation and green manuring in organic vegetable beds": "సేంద్రీయ మడులలో పంట మార్పిడి మరియు పచ్చిరొట్ట ఎరువులను అమర్చడం",
    "Document organic farm compliance records for organic certification": "సరిఫికేషన్ కోసం సేంద్రీయ వ్యవసాయ రికార్డులను పత్రబద్ధం చేయడం",

    "Organize village-level farmer awareness workshops and training camps": "గ్రామ స్థాయిలో రైతుల అవగాహన సదస్సులు మరియు శిక్షణా శిబిరాలను నిర్వహించడం",
    "Distribute agricultural advisory pamphlets and scheme guides": "వ్యవసాయ సలహా కరపత్రాలు మరియు పథకాల మార్గదర్శకాలను పంపిణీ చేయడం",
    "Assist farmers in enrolling for government welfare schemes and PM-KISAN": "ప్రభుత్వ సంక్షేమ పథకాలు మరియు పిఎం-కిసాన్ లో నమోదు చేసుకోవడంలో రైతులకు సహాయం చేయడం"
}

def update_translations():
    with open("src/i18n/translations.ts", "r", encoding="utf-8") as f:
        content = f.read()

    # Extract en dict and te dict
    parts = content.split("te: {")
    en_part = parts[0].split("en: {")[1]
    te_part = parts[1]

    def parse_block(block_str):
        d = {}
        pattern = re.compile(r'^\s*("(?:[^"\\]|\\.)*")\s*:\s*("(?:[^"\\]|\\.)*")\s*,?\s*$', re.MULTILINE)
        for m in pattern.finditer(block_str):
            k = json.loads(m.group(1))
            v = json.loads(m.group(2))
            d[k] = v
        return d

    en_dict = parse_block(en_part)
    te_dict = parse_block(te_part)

    for k, v in internship_map.items():
        en_dict[k] = k
        te_dict[k] = v

    new_code = "export type Language = 'en' | 'te';\n\nexport const translations: Record<Language, Record<string, string>> = {\n  en: {\n"
    for k in sorted(en_dict.keys()):
        clean_k = json.dumps(k)
        clean_v = json.dumps(en_dict[k])
        new_code += f"    {clean_k}: {clean_v},\n"

    new_code += "  },\n  te: {\n"
    for k in sorted(te_dict.keys()):
        clean_k = json.dumps(k)
        clean_v = json.dumps(te_dict[k])
        new_code += f"    {clean_k}: {clean_v},\n"

    new_code += "  },\n};\n"

    with open("src/i18n/translations.ts", "w", encoding="utf-8") as f:
        f.write(new_code)

    print("Updated translations.ts successfully with all internship translations.")

if __name__ == "__main__":
    update_translations()
