import sys
import json
import os

lessons_data = [
    # agri-1
    {
        "id": "agri-1-l1", "courseId": "agri-1", "lessonNumber": 1, "duration": "15 mins",
        "title_en": "Introduction to Modern Agricultural Practices",
        "title_te": "ఆధునిక వ్యవసాయ పద్ధతుల పరిచయం",
        "summary_en": "Overview of modern machinery, soil preparation, and crop rotation for high yield.",
        "summary_te": "అధిక దిగుబడి కోసం ఆధునిక యంత్రాలు, నేల తయారీ మరియు పంట మార్పిడి అవలోకనం.",
        "content_en": "Modern farming combines traditional agricultural knowledge with scientific techniques such as soil testing, balanced fertilization, and mechanized tillage to maximize crop production while preserving land quality.",
        "content_te": "ఆధునిక వ్యవసాయం సాంప్రదాయ వ్యవసాయ పరిజ్ఞానాన్ని నేల పరీక్ష, సమతుల్య ఎరువుల వాడకం మరియు యంత్రీకృత దుక్కి వంటి వైజ్ఞానిక పద్ధతులతో మిళితం చేసి భూమి నాణ్యతను కాపాడుతూ పంట ఉత్పత్తిని గరిష్టం చేస్తుంది.",
        "keyPoints_en": [
            "Use certified seeds with high germination rates",
            "Perform soil testing before every sowing season",
            "Adopt crop rotation to maintain soil microbial balance"
        ],
        "keyPoints_te": [
            "అధిక మొలక శాతంతో ధృవీకరించబడిన విత్తనాలను ఉపయోగించండి",
            "ప్రతి విత్తే సీజన్‌కు ముందు నేల పరీక్ష నిర్వహించండి",
            "నేల సూక్ష్మజీవుల సమతుల్యతను కాపాడటానికి పంట మార్పిడిని అవలంబించండి"
        ],
        "tip_en": "Prepare land with deep summer ploughing to expose weed seeds and soil pests to heat.",
        "tip_te": "కలుపు విత్తనాలు మరియు నేల పురుగులను ఎండకు గురిచేయడానికి వేసవిలో లోతైన దుక్కి దున్నండి."
    },
    {
        "id": "agri-1-l2", "courseId": "agri-1", "lessonNumber": 2, "duration": "20 mins",
        "title_en": "Land Preparation and Field Layout",
        "title_te": "నేల తయారీ మరియు పొలం లేఅవుట్",
        "summary_en": "Proper field levelling, bunding, and channel creation for uniform irrigation.",
        "summary_te": "సమానమైన నీటిపారుదల కోసం సరైన పొలం లెవలింగ్, గట్లు మరియు కాలువల నిర్మాణం.",
        "content_en": "Proper land levelling prevents waterlogging and ensures even moisture distribution across the field. Laser levelling can save up to 20% irrigation water and increase crop yield.",
        "content_te": "సరైన పొలం లెవలింగ్ నీరు నిలవకుండా నిరోధిస్తుంది మరియు పొలమంతా సమానంగా తేమ అందుతుందని నిర్ధారిస్తుంది. లేజర్ లెవలింగ్ 20% వరకు నీటిని ఆదా చేస్తుంది మరియు దిగుబడిని పెంచుతుంది.",
        "keyPoints_en": [
            "Laser land levelling improves irrigation efficiency",
            "Construct firm field bunds to prevent soil erosion",
            "Ensure proper drainage channels for heavy rain periods"
        ],
        "keyPoints_te": [
            "లేజర్ పొలం లెవలింగ్ నీటిపారుదల సామర్థ్యాన్ని మెరుగుపరుస్తుంది",
            "మట్టి కోతను నివారించడానికి బలమైన పొలం గట్లను నిర్మించండి",
            "భారీ వర్షాల కాలంలో సరైన నీటి పారుదల కాలువలను నిర్ధారించండి"
        ],
        "tip_en": "Levelling field surfaces reduces seed loss during heavy rain and ensures uniform germination.",
        "tip_te": "పొలం ఉపరితలాన్ని సమానం చేయడం వల్ల భారీ వర్షంలో విత్తనాల నష్టం తగ్గుతుంది మరియు సమానంగా మొలకెత్తుతుంది."
    },
    {
        "id": "agri-1-l3", "courseId": "agri-1", "lessonNumber": 3, "duration": "25 mins",
        "title_en": "Seed Selection and Sowing Techniques",
        "title_te": "విత్తన ఎంపిక మరియు విత్తే పద్ధతులు",
        "summary_en": "How to choose high-quality seeds, seed treatment, and optimum seed depth.",
        "summary_te": "ఉత్తమ రకం విత్తనాల ఎంపిక, విత్తన శుద్ధి మరియు సరైన లోతులో విత్తడం.",
        "content_en": "Selecting disease-resistant hybrid or certified seed varieties suitable for local agro-climatic conditions is the foundation of high productivity. Seed treatment with bio-agents or fungicides protects young roots.",
        "content_te": "స్థానిక వాతావరణ పరిస్థితులకు అనుగుణమైన వ్యాధి నిరోధక సంకర లేదా ధృవీకరించబడిన విత్తన రకాలను ఎంచుకోవడం అధిక ఉత్పాదకతకు పునాది. జీవ ఏజెంట్లు లేదా శిలీంధ్ర నాశకాలతో విత్తన శుద్ధి పసి వేర్లను రక్షిస్తుంది.",
        "keyPoints_en": [
            "Treat seeds with Trichoderma or fungicide before sowing",
            "Maintain proper seed spacing and depth for crop canopy",
            "Test seed germination percentage before large-scale field planting"
        ],
        "keyPoints_te": [
            "విత్తే ముందు విత్తనాలను ట్రైకోడెర్మా లేదా శిలీంధ్ర నాశకంతో శుద్ధి చేయండి",
            "పంట విత్తనాల మధ్య సరైన దూరం మరియు లోతును నిర్వహించండి",
            "పెద్ద ఎత్తున విత్తే ముందు విత్తన మొలక శాతాన్ని పరీక్షించండి"
        ],
        "tip_en": "Soak paddy seeds in 1% salt water to remove light, hollow seeds before nursery bed preparation.",
        "tip_te": "నార్ల పెంపకానికి ముందు తేలికైన, లొల్ల విత్తనాలను తొలగించడానికి వరి విత్తనాలను 1% ఉప్పు నీటిలో నానబెట్టండి."
    },
    {
        "id": "agri-1-l4", "courseId": "agri-1", "lessonNumber": 4, "duration": "20 mins",
        "title_en": "Crop Monitoring and Harvesting Basics",
        "title_te": "పంట పర్యవేక్షణ మరియు కోత ప్రాథమిక అంశాలు",
        "summary_en": "Regular field scouting for pests, water stress, and identifying crop maturity.",
        "summary_te": "పురుగులు, నీటి ఎద్దడి మరియు పంట పక్వతను గుర్తించడానికి క్రమం తప్పకుండా పొలం తనిఖీ.",
        "content_en": "Regular field inspection helps farmers detect pest infestations, nutrient deficiencies, and water stress early. Timely harvesting at physiological maturity minimizes grain shattering and quality loss.",
        "content_te": "క్రమం తప్పకుండా పొలం తనిఖీ చేయడం వల్ల రైతులు పురుగుల దాడి, పోషకాల లోపం మరియు నీటి ఎద్దడిని ముందుగానే గుర్తించగలరు. సరైన సమయంలో కోత కోయడం వల్ల గింజలు రాలడం మరియు నాణ్యత తగ్గడం నివారించవచ్చు.",
        "keyPoints_en": [
            "Inspect crops at least twice a week during critical growth stages",
            "Check lower leaf surfaces for early pest egg clusters",
            "Harvest grains when moisture content drops to 14-16%"
        ],
        "keyPoints_te": [
            "ముఖ్యమైన ఎదుగుదల దశల్లో వారానికి కనీసం రెండుసార్లు పంటను పరిశీలించండి",
            "పురుగుల గ్రుడ్ల సమూహాల కోసం ఆకుల క్రింది భాగాన్ని తనిఖీ చేయండి",
            "తేమ శాతం 14-16% కి తగ్గినప్పుడు ధాన్యం కోత కోయండి"
        ],
        "tip_en": "Harvest crops early in the morning when moisture content is stable to prevent grain loss.",
        "tip_te": "ధాన్యం నష్టాన్ని నివారించడానికి తేమ స్థిరంగా ఉండే ఉదయాన్నే పంటను కోయండి."
    },

    # agri-2
    {
        "id": "agri-2-l1", "courseId": "agri-2", "lessonNumber": 1, "duration": "20 mins",
        "title_en": "Soil Testing and pH Balance",
        "title_te": "నేల పరీక్ష మరియు pH సమతుల్యత",
        "summary_en": "How to collect soil samples, understand pH values, and correct acidic or alkaline soil.",
        "summary_te": "మట్టి నమూనాలను సేకరించడం, pH విలువలను అర్థం చేసుకోవడం మరియు ఆమ్ల/క్షార నేలలను సరిచేయడం.",
        "content_en": "Soil testing reveals the availability of primary and micronutrients in the field. Soil pH affects nutrient uptake; lime is used for acidic soils while gypsum is recommended for alkaline soils.",
        "content_te": "నేల పరీక్ష ద్వారా ప్రధాన మరియు సూక్ష్మ పోషకాల లభ్యత తెలుస్తుంది. నేల pH పోషకాల గ్రహణను ప్రభావితం చేస్తుంది; ఆమ్ల నేలలకు సున్నం మరియు క్షార నేలలకు జిప్సమ్ ఉపయోగించబడుతుంది.",
        "keyPoints_en": [
            "Collect soil samples from 5 to 8 zig-zag field locations",
            "Ideal soil pH for most crops is between 6.5 and 7.5",
            "Apply agricultural lime for acidic soils (pH < 6.0)"
        ],
        "keyPoints_te": [
            "పొలంలో 5 నుండి 8 విభిన్న ప్రదేశాల నుండి జిగ్-జాగ్ పద్ధతిలో మట్టి నమూనాలను సేకరించండి",
            "చాలా పంటలకు అనుకూలమైన నేల pH 6.5 నుండి 7.5 మధ్య ఉంటుంది",
            "ఆమ్ల నేలలకు (pH < 6.0) వ్యవసాయ సున్నాన్ని వాడండి"
        ],
        "tip_en": "Do not take soil samples directly from field bunds, manure heaps, or tree shadows.",
        "tip_te": "పొలం గట్లు, ఎరువుల కుప్పలు లేదా చెట్ల నీడల నుండి నేరుగా మట్టి నమూనాలను తీసుకోకండి."
    },
    {
        "id": "agri-2-l2", "courseId": "agri-2", "lessonNumber": 2, "duration": "25 mins",
        "title_en": "Primary Nutrients: N, P, K Management",
        "title_te": "ప్రధాన పోషకాలు: N, P, K నిర్వహణ",
        "summary_en": "Balanced application of Nitrogen, Phosphorus, and Potassium based on crop stage.",
        "summary_te": "పంట ఎదుగుదల దశను బట్టి నత్రజని, భాస్వరం మరియు పొటాషియం సమతుల్య వాడకం.",
        "content_en": "Nitrogen promotes vegetative leaf growth, Phosphorus boosts root development, and Potassium enhances crop disease resistance and grain filling. Split application of Nitrogen reduces leaching losses.",
        "content_te": "నత్రజని ఆకుల ఎదుగుదలకు, భాస్వరం వేర్ల అభివృద్ధికి, మరియు పొటాషియం తెగుళ్ల నిరోధకత మరియు గింజ పక్వతకు తోడ్పడతాయి. నత్రజనిని విడతల వారీగా వేయడం వల్ల వ్యర్థం కాకుండా నిరోధించవచ్చు.",
        "keyPoints_en": [
            "Apply full dose of Phosphorus and Potassium at basal sowing stage",
            "Apply Nitrogen in 2 to 3 split doses matching growth peaks",
            "Avoid excessive Nitrogen spray which attracts sap-sucking pests"
        ],
        "keyPoints_te": [
            "విత్తే సమయంలో భాస్వరం మరియు పొటాషియం పూర్తి మోతాదును అడుగు పిండిగా వేయండి",
            "ఎదుగుదల దశలను బట్టి నత్రజనిని 2 నుండి 3 విడతలుగా వేయండి",
            "రసం పీల్చే పురుగులను ఆకర్షించే అధిక నత్రజని వాడకాన్ని నివారించండి"
        ],
        "tip_en": "Use neem-coated urea to slow down Nitrogen release and improve plant absorption efficiency.",
        "tip_te": "నత్రజని నెమ్మదిగా విడుదలవ్వడానికి మరియు మొక్కలకు బాగా అందడానికి వేపపూత పూసిన యూరియాను ఉపయోగించండి."
    },
    {
        "id": "agri-2-l3", "courseId": "agri-2", "lessonNumber": 3, "duration": "20 mins",
        "title_en": "Organic Manures and Bio-fertilizers",
        "title_te": "సేంద్రీయ ఎరువులు మరియు జీవ ఎరువులు",
        "summary_en": "Role of FYM, vermicompost, Rhizobium, and Azotobacter in soil health.",
        "summary_te": "నేల ఆరోగ్యంలో పశుల ఎరువు, వర్మీకంపోస్ట్, రైజోబియం మరియు అజోటోబాక్టర్ పాత్ర.",
        "content_en": "Organic manures increase soil organic carbon, improve water holding capacity, and stimulate beneficial soil microbes. Bio-fertilizers convert atmospheric nitrogen into plant-absorbable forms.",
        "content_te": "సేంద్రీయ ఎరువులు నేలలో బొగ్గు శాతాన్ని పెంచుతాయి, నీటిని పట్టి ఉంచే సామర్థ్యాన్ని మెరుగుపరుస్తాయి మరియు మేలు చేసే సూక్ష్మజీవులను వృద్ధి చేస్తాయి.",
        "keyPoints_en": [
            "Apply well-decomposed Farm Yard Manure (FYM) 3 weeks before sowing",
            "Inoculate legume seeds with Rhizobium culture",
            "Use Phosphate Solubilizing Bacteria (PSB) to unlock fixed soil phosphorus"
        ],
        "keyPoints_te": [
            "విత్తడానికి 3 వారాల ముందు బాగా కుళ్లిన పశుల ఎరువును వేయండి",
            "పప్పుధాన్యాల విత్తనాలకు రైజోబియం కల్చర్‌తో పట్టించండి",
            "నేలలో ఉండే భాస్వరాన్ని కరిగించడానికి పిఎస్‌బి (PSB) ని ఉపయోగించండి"
        ],
        "tip_en": "Store FYM in shaded pits covered with soil to retain Nitrogen content.",
        "tip_te": "నత్రజని శాతం తగ్గకుండా ఉండేందుకు పశుల ఎరువును నీడ ఉన్న గోతులలో మట్టితో కప్పి ఉంచండి."
    },
    {
        "id": "agri-2-l4", "courseId": "agri-2", "lessonNumber": 4, "duration": "25 mins",
        "title_en": "Soil Organic Matter and Carbon Conservation",
        "title_te": "నేల సేంద్రీయ పదార్థం మరియు కార్బన్ పరిరక్షణ",
        "summary_en": "Building soil humus, green manuring, and preventing soil erosion.",
        "summary_te": "నేల సారాన్ని పెంపొందించడం, పచ్చిరొట్ట ఎరువులు మరియు మట్టి కోత నివారణ.",
        "content_en": "Soil organic matter is the foundation of soil fertility. Incorporating crop residues, green manure crops like Sunn Hemp or Dhaincha, and practicing zero-tillage builds long-term soil carbon.",
        "content_te": "నేల సేంద్రీయ పదార్థం నేల సారానికి మూలస్తంభం. పంట వ్యర్థాలను కలిపి దున్నడం, జనుము లేదా జీలుగు వంటి పచ్చిరొట్ట పైర్లను పెంచడం ద్వారా నేలలో సేంద్రీయ కార్బన్ పెరుగుతుంది.",
        "keyPoints_en": [
            "Incorporate crop residues into soil instead of burning",
            "Sow green manure crops like Dhaincha before Kharif paddy",
            "Mulch crop rows to conserve soil moisture and suppress weeds"
        ],
        "keyPoints_te": [
            "పంట వ్యర్థాలను తగలబెట్టకుండా మట్టిలో కలిపి దున్నండి",
            "ఖరీఫ్ వరికి ముందు జీలుగు వంటి పచ్చిరొట్ట పైర్లను వేయండి",
            "తేమను కాపాడేందుకు మరియు కలుపు నివారణకు ఆచ్ఛాదన (ముల్చింగ్) చేయండి"
        ],
        "tip_en": "Incorporating 45-day-old Dhaincha into soil adds up to 80 kg Nitrogen per hectare.",
        "tip_te": "45 రోజుల జీలుగు పైరును భూమిలో కలిపి దున్నడం వల్ల హెక్టారుకు 80 కేజీల నత్రజని అందుతుంది."
    },

    # agri-3
    {
        "id": "agri-3-l1", "courseId": "agri-3", "lessonNumber": 1, "duration": "15 mins",
        "title_en": "Kharif, Rabi, and Zaid Crop Cycles",
        "title_te": "ఖరీఫ్, రబీ మరియు జైద్ పంట చక్రాలు",
        "summary_en": "Planning crops around monsoon timings, winter season, and summer irrigation.",
        "summary_te": "వర్షాకాలం, శీతాకాలం మరియు వేసవి నీటిపారుదలకు అనుగుణంగా పంట ప్రణాళిక.",
        "content_en": "India's agricultural calendar is divided into Kharif (monsoon crops like Paddy, Maize, Cotton), Rabi (winter crops like Wheat, Mustard, Gram), and Zaid (summer crops like Watermelon, Cucumber, Pulses).",
        "content_te": "భారతీయ వ్యవసాయ క్యాలెండర్ ఖరీఫ్ (వరి, జొన్న, పత్తి), రబీ (గోధుమ, ఆవాలు, శనగ) మరియు జైద్ (పుచ్చకాయ, దోసకాయ, పప్పుధాన్యాలు) సీజన్లుగా విభజించబడింది.",
        "keyPoints_en": [
            "Kharif sowing depends on early monsoon rain arrivals",
            "Rabi crops require cool winter temperatures during grain filling",
            "Zaid crops offer quick short-duration income between main seasons"
        ],
        "keyPoints_te": [
            "ఖరీఫ్ విత్తడం తొలి రుతుపవనాల వర్షాలపై ఆధారపడి ఉంటుంది",
            "రబీ పంటలకు గింజ పక్వానికి చల్లని శీతాకాల ఉష్ణోగ్రతలు అవసరం",
            "జైద్ పంటలు ప్రధాన సీజన్ల మధ్య స్వల్పకాలిక ఆదాయాన్ని ఇస్తాయి"
        ],
        "tip_en": "Select short-duration Kharif varieties if monsoon rainfall is delayed in your region.",
        "tip_te": "మీ ప్రాంతంలో వర్షాలు ఆలస్యమైతే స్వల్పకాలిక ఖరీఫ్ రకాలను ఎంచుకోండి."
    },
    {
        "id": "agri-3-l2", "courseId": "agri-3", "lessonNumber": 2, "duration": "20 mins",
        "title_en": "Crop Rotation Strategies",
        "title_te": "పంట మార్పిడి వ్యూహాలు",
        "summary_en": "Alternating cereals with legumes to maintain soil fertility and break pest cycles.",
        "summary_te": "నేల సారాన్ని కాపాడటానికి ధాన్యాల తర్వాత పప్పుధాన్యాల పంటలను మార్చి వేయడం.",
        "content_en": "Monoculture depletes specific soil nutrients and builds up soil-borne diseases. Rotating heavy-feeding cereal crops with nitrogen-fixing leguminous crops restores soil balance naturally.",
        "content_te": "ఒకే పంటను వరుసగా వేయడం వల్ల నేలలో నిర్దిష్ట పోషకాలు తగ్గిపోతాయి మరియు తెగుళ్లు పెరుగుతాయి. ధాన్యపు పైర్ల తర్వాత పప్పుధాన్యాలను వేయడం వల్ల నేల సారం సహజంగా పెరుగుతుంది.",
        "keyPoints_en": [
            "Rotate Paddy/Wheat with Gram, Moong, or Groundnut",
            "Legumes fix atmospheric nitrogen for subsequent cereal crops",
            "Crop rotation breaks life cycles of host-specific pests and weeds"
        ],
        "keyPoints_te": [
            "వరి/గోధుమల తర్వాత శనగలు, మినుములు లేదా వేరుశనగ వేయండి",
            "పప్పుధాన్యాలు తదుపరి పంటల కోసం గాలిలోని నత్రజనిని స్థిరీకరిస్తాయి",
            "పంట మార్పిడి వల్ల పురుగులు మరియు కలుపు నివారించబడుతుంది"
        ],
        "tip_en": "Planting summer Moong after Rabi Wheat adds natural nitrogen and extra income.",
        "tip_te": "రబీ గోధుమ తర్వాత వేసవి పెసర వేయడం వల్ల సహజ నత్రజని మరియు అదనపు ఆదాయం లభిస్తాయి."
    },
    {
        "id": "agri-3-l3", "courseId": "agri-3", "lessonNumber": 3, "duration": "20 mins",
        "title_en": "Intercropping and Companion Planting",
        "title_te": "అంతర పంటలు మరియు సహచర పంటలు",
        "summary_en": "Maximizing land efficiency by growing complementary crops together.",
        "summary_te": "ఒకే పొలంలో అనుకూలమైన అంతర పంటలను పెంచడం ద్వారా భూమి సామర్థ్యాన్ని గరిష్టం చేయడం.",
        "content_en": "Intercropping involves cultivating two or more crops simultaneously in the same field in specific row patterns. It reduces risk against total crop failure and optimizes sunlight and water use.",
        "content_te": "అంతర పంటల పద్ధతిలో ఒకే పొలంలో నిర్దిష్ట వరుసలలో రెండు లేదా అంతకంటే ఎక్కువ పంటలను సాగు చేస్తారు. ఇది పంట నష్ట భయాన్ని తగ్గిస్తుంది.",
        "keyPoints_en": [
            "Intercrop Maize with Cowpea or Arhar for ground cover",
            "Grow Marigold along field borders as a trap crop for nematodes",
            "Maintain proper inter-row spacing to prevent light competition"
        ],
        "keyPoints_te": [
            "జొన్న పంటలో అలసందలు లేదా కందులను అంతర పంటగా వేయండి",
            "నులిపురుగుల నివారణకు పొలం సరిహద్దుల్లో బంతి పూల మొక్కలను పెంచండి",
            "వెలుతురు పోటీ లేకుండా వరుసల మధ్య సరైన దూరం పాటించండి"
        ],
        "tip_en": "Border rows of tall Maize or Sorghum act as natural windbreakers for delicate vegetable crops.",
        "tip_te": "కూరగాయల పంటల చుట్టూ పొడవాటి జొన్న లేదా మొక్కజొన్న వేయడం వల్ల గాలి నుండి రక్షణ లభిస్తుంది."
    },
    {
        "id": "agri-3-l4", "courseId": "agri-3", "lessonNumber": 4, "duration": "15 mins",
        "title_en": "Weather-Based Sowing Schedules",
        "title_te": "వాతావరణ ఆధారిత విత్తన ప్రణాళిక",
        "summary_en": "Using rainfall forecasts and temperature windows for optimal sowing.",
        "summary_te": "సరైన విత్తే సమయం కోసం వర్షపాత అంచనాలు మరియు ఉష్ణోగ్రత పరిమితులను ఉపయోగించడం.",
        "content_en": "Sowing at the right soil temperature and moisture condition ensures uniform seed emergence. Climate advisory apps provide localized weather alerts to guide sowing dates.",
        "content_te": "సరైన నేల ఉష్ణోగ్రత మరియు తేమ ఉన్నప్పుడు విత్తడం వల్ల సమానంగా మొలకెత్తుతుంది. వాతావరణ ఆధారిత హెచ్చరికలు సరైన విత్తే సమయాన్ని సూచిస్తాయి.",
        "keyPoints_en": [
            "Avoid sowing seeds right before heavy rain to prevent soil crusting",
            "Ensure soil moisture is adequate at root depth before seed placement",
            "Use certified weather advisories for localized spray and sowing decisions"
        ],
        "keyPoints_te": [
            "మట్టి పెచ్చులు కట్టకుండా ఉండటానికి భారీ వర్షానికి ముందు విత్తవద్దు",
            "విత్తే ముందు వేరు లోతు వరకు సరిపడా తేమ ఉందని నిర్ధారించుకోండి",
            "విత్తే మరియు మందులు పిచికారీ చేసే సమయాలకు వాతావరణ నివేదికలను చూడండి"
        ],
        "tip_en": "Check 5-day local rainfall forecasts before scheduling large-scale sowing operations.",
        "tip_te": "పెద్ద ఎత్తున విత్తే ముందు రాబోయే 5 రోజుల వర్షపాత అంచనాలను తనిఖీ చేయండి."
    },

    # agri-4
    {
        "id": "agri-4-l1", "courseId": "agri-4", "lessonNumber": 1, "duration": "20 mins",
        "title_en": "Critical Crop Water Requirement Stages",
        "title_te": "పంటలకు క్లిష్టమైన నీటి అవసర దశలు",
        "summary_en": "Identifying critical growth stages when crops must receive irrigation.",
        "summary_te": "పంటలకు తప్పనిసరిగా నీటిపారుదల అందించాల్సిన ముఖ్యమైన ఎదుగుదల దశల గుర్తింపు.",
        "content_en": "Crops have specific growth stages where moisture stress causes maximum yield loss, such as flowering, grain filling, and root establishment. Timely watering during these stages is essential.",
        "content_te": "పూత, పిందె మరియు గింజ పట్టు దశలలో నీటి కొరత ఏర్పడితే తీవ్ర దిగుబడి నష్టం జరుగుతుంది. ఈ దశలలో సమయానికి నీరు అందించడం చాలా అవసరం.",
        "keyPoints_en": [
            "Paddy requires critical water at tillering and panicle initiation",
            "Wheat needs guaranteed irrigation at Crown Root Initiation (CRI) stage",
            "Moisture stress during flowering causes severe flower drop"
        ],
        "keyPoints_te": [
            "వరికి పిలకల దశ మరియు ఈత దశలలో నీరు చాలా అవసరం",
            "గోధుమకు మొదట వేర్లు తొడిగే దశ (CRI) లో తప్పనిసరిగా నీరు పెట్టాలి",
            "పూత దశలో నీటి ఎద్దడి వల్ల పువ్వులు రాలిపోతాయి"
        ],
        "tip_en": "Never miss irrigation during the Crown Root Initiation stage (20-25 days after Wheat sowing).",
        "tip_te": "గోధుమ విత్తిన 20-25 రోజులకు (CRI దశ) నీరు పెట్టడం మరవకండి."
    },
    {
        "id": "agri-4-l2", "courseId": "agri-4", "lessonNumber": 2, "duration": "25 mins",
        "title_en": "Drip and Sprinkler Irrigation Systems",
        "title_te": "బిందు మరియు స్ప్రింక్లర్ సేద్య పద్ధతులు",
        "summary_en": "Principles of micro-irrigation, water savings, and root zone delivery.",
        "summary_te": "సూక్ష్మ నీటిపారుదల సూత్రాలు, నీటి పొదుపు మరియు వేరు వ్యవస్థకు నేరుగా నీటి రవాణా.",
        "content_en": "Drip irrigation delivers water directly to plant roots in precise drops, reducing water evaporation and weed growth. Sprinkler systems simulate natural rainfall for closely spaced crops.",
        "content_te": "బిందు సేద్యం నీటిని నేరుగా మొక్క వేర్ల వద్దకు చిన్న బొట్లుగా అందిస్తుంది. స్ప్రింక్లర్లు వర్షం లాగా నీటిని చిలకరిస్తాయి.",
        "keyPoints_en": [
            "Drip irrigation saves 40-60% water compared to flood irrigation",
            "Reduces weed emergence in inter-row spaces",
            "Enables precise fertigation directly through water drippers"
        ],
        "keyPoints_te": [
            "సాధారణ పద్ధతి కంటే బిందు సేద్యం 40-60% నీటిని ఆదా చేస్తుంది",
            "వరుసల మధ్య కలుపు మొక్కల పెరుగుదలను తగ్గిస్తుంది",
            "నీటి ద్వారానే ద్రవ ఎరువులను అందించడానికి (ఫెర్టిగేషన్) వీలు కల్పిస్తుంది"
        ],
        "tip_en": "Clean drip line filters weekly to prevent emitter clogging from sand and algae.",
        "tip_te": "డ్రిప్పర్లు మూసుకుపోకుండా వారానికి ఒకసారి ఫిల్టర్లను శుభ్రం చేయండి."
    },
    {
        "id": "agri-4-l3", "courseId": "agri-4", "lessonNumber": 3, "duration": "20 mins",
        "title_en": "Rainwater Harvesting & Farm Ponds",
        "title_te": "వర్షపు నీటి నిల్వ మరియు పొలం కుంటలు",
        "summary_en": "Capturing monsoon runoff water for dry-spell protective irrigation.",
        "summary_te": "వర్షాకాలంలో వృథా నీటిని నిల్వ చేసి కరువు సమయంలో రక్షక నీటిపారుదలగా ఉపయోగించడం.",
        "content_en": "Farm ponds collect excess rainwater runoff during heavy monsoon rains. Stored water provides emergency protective irrigation during dry spells and recharges groundwater aquifers.",
        "content_te": "పొలం కుంటలు వర్షపు నీటిని నిల్వ చేస్తాయి. ఈ నీరు వర్షాభావ పరిస్థితులలో పంటలను కాపాడటానికి ఉపయోగపడుతుంది.",
        "keyPoints_en": [
            "Construct farm ponds at the lowest elevation point of the land",
            "Line farm ponds with HDPE sheets to prevent seepage",
            "Use pond water for supplemental irrigation during dry spells"
        ],
        "keyPoints_te": [
            "పొలంలో అత్యంత పల్లంగా ఉన్న ప్రాంతంలో పొలం కుంటలను తవ్వండి",
            "నీరు ఇంకిపోకుండా HDPE షీట్లను పరచండి",
            "వర్షాభావ సమయంలో పంటను కాపాడుకోవడానికి ఈ నీటిని వాడండి"
        ],
        "tip_en": "Cover farm pond surfaces with shade nets to reduce evaporation loss.",
        "tip_te": "నీరు ఆవిరి కాకుండా పొలం కుంటలపై నీడ వలలను (షెడ్ నెట్స్) వాడండి."
    },
    {
        "id": "agri-4-l4", "courseId": "agri-4", "lessonNumber": 4, "duration": "15 mins",
        "title_en": "Soil Moisture Monitoring and Scheduling",
        "title_te": "నేల తేమ పర్యవేక్షణ మరియు నీటి ప్రణాళిక",
        "summary_en": "Simple field tests to check root-zone moisture before watering.",
        "summary_te": "నీరు పెట్టే ముందు వేరు వద్ద తేమను తనిఖీ చేయడానికి సులభమైన పొలం పరీక్షలు.",
        "content_en": "Checking soil moisture at root depth prevents over-watering, which causes root rot and nutrient leaching. Simple tensiometers or soil feel-and-appearance tests help determine exact irrigation needs.",
        "content_te": "వేరు లోతు వద్ద నేల తేమను తనిఖీ చేయడం వల్ల అధిక నీటి వల్ల కలిగే వేరు కుళ్ళు తెగులును నివారించవచ్చు.",
        "keyPoints_en": [
            "Squeeze soil sample from 15 cm depth; if it forms a firm ball, irrigation is not needed",
            "Over-irrigation leads to oxygen deprivation in plant root zones",
            "Irrigate crops in early morning or evening to lower evaporation"
        ],
        "keyPoints_te": [
            "15 సెం.మీ లోతు నుండి మట్టిని తీసుకుని ముద్దగా చేస్తే ముద్ద అయితే నీరు పెట్టనవసరం లేదు",
            "అధిక నీటిపారుదల వల్ల వేర్లకు ఆక్సిజన్ అందదు",
            "నీరు ఆవిరి కాకుండా ఉదయాన్నే లేదా సాయంత్రం వేళల్లో నీరు పెట్టండి"
        ],
        "tip_en": "Irrigate fields during cool evening hours to minimize water loss from solar evaporation.",
        "tip_te": "సూర్యరశ్మి వల్ల నీరు ఆవిరి కాకుండా సాయంత్రం చల్లని వేళల్లో నీరు పెట్టండి."
    },

    # agri-5
    {
        "id": "agri-5-l1", "courseId": "agri-5", "lessonNumber": 1, "duration": "20 mins",
        "title_en": "Identifying Common Crop Pests and Insects",
        "title_te": "ప్రధాన పంట పురుగులు మరియు కీటకాల గుర్తింపు",
        "summary_en": "Distinguishing between sap-sucking insects, chewing caterpillars, and beneficial insects.",
        "summary_te": "రసం పీల్చే పురుగులు, ఆకులు నమలే లద్దె పురుగులు మరియు మేలు చేసే పురుగుల గుర్తింపు.",
        "content_en": "Effective pest management begins with correct identification. Sap-sucking insects like aphids and whiteflies cause leaf curling, while caterpillars chew leaf tissue. Ladybugs and spiders are beneficial predators.",
        "content_te": "సరైన నివారణకు పురుగులను సరిగ్గా గుర్తించడం ముఖ్యం. పేనుబంక, తెల్లదోమ రసం పీల్చి ఆకులు ముడుచుకుపోయేలా చేస్తాయి. లేడీబర్డ్ బీటిల్స్ మేలు చేసే మిత్ర పురుగులు.",
        "keyPoints_en": [
            "Aphids and thrips suck sap from tender top leaves",
            "Borer insects damage stems and fruit tissues",
            "Protect natural predators like ladybird beetles and lacewings"
        ],
        "keyPoints_te": [
            "పేనుబంక మరియు తామర పురుగులు లేత ఆకుల నుండి రసాన్ని పీలుస్తాయి",
            "తొలుచు పురుగులు కాండం మరియు కాయలకు నష్టం కలిగిస్తాయి",
            "లేడీబర్డ్ బీటిల్స్ వంటి మిత్ర పురుగులను కాపాడుకోండి"
        ],
        "tip_en": "Install yellow sticky cards in vegetable fields to detect whiteflies and aphids early.",
        "tip_te": "తెల్లదోమ మరియు పేనుబంకను నివారించడానికి పసుపు రంగు జిగురు కార్డులను ఏర్పాటు చేయండి."
    },
    {
        "id": "agri-5-l2", "courseId": "agri-5", "lessonNumber": 2, "duration": "25 mins",
        "title_en": "Integrated Pest Management (IPM) Principles",
        "title_te": "సగ్ర సస్యరక్షణ (IPM) సూత్రాలు",
        "summary_en": "Combining cultural, biological, mechanical, and chemical pest controls.",
        "summary_te": "యాజమాన్య, జీవ, భౌతిక మరియు రసాయన పద్ధతులను మేళవించి పురుగుల నివారణ.",
        "content_en": "IPM combines multiple pest control methods to keep pest populations below Economic Threshold Levels (ETL) without over-relying on chemical sprays, safeguarding human health and ecosystem safety.",
        "content_te": "సగ్ర సస్యరక్షణ (IPM) పద్ధతిలో రసాయనాలపైనే ఆధారపడకుండా విభిన్న నివారణ మార్గాల ద్వారా పురుగుల ఉధృతిని అదుపులో ఉంచుతారు.",
        "keyPoints_en": [
            "Use pheromone traps for monitoring insect pest populations",
            "Adopt bird perches in fields for natural predator feeding",
            "Apply chemical pesticides only when pest population exceeds ETL limit"
        ],
        "keyPoints_te": [
            "పురుగుల ఉనికిని గమనించడానికి లింగ ఆకర్షణ బుట్టలను (ఫెరమోన్ ట్రాప్స్) వాడండి",
            "పక్షులు వాలడానికి పొలంలో పక్షి స్థావరాలను (బర్డ్ పర్చెస్) ఏర్పాటు చేయండి",
            "ఉధృతి పరిమితి దాటినప్పుడు మాత్రమే రసాయన మందులను వాడండి"
        ],
        "tip_en": "Set up 5 pheromone traps per acre for early detection of bollworm and stem borer moths.",
        "tip_te": "కాండం తొలుచు పురుగు నివారణకు ఎకరాకు 5 లింగ ఆకర్షణ బుట్టలను అమర్చండి."
    },
    {
        "id": "agri-5-l3", "courseId": "agri-5", "lessonNumber": 3, "duration": "20 mins",
        "title_en": "Safe Pesticide Handling & Spraying",
        "title_te": "సురక్షిత పురుగు మందుల వాడకం మరియు పిచికారీ",
        "summary_en": "Recommended dosage, safety gear, nozzle selection, and spray timing.",
        "summary_te": "సరైన మోతాదు, రక్షణ దుస్తులు, నాజిల్ ఎంపిక మరియు పిచికారీ సమయం.",
        "content_en": "Using chemical pesticides safely requires wearing protective gloves and masks, calculating precise doses per acre, using hollow-cone nozzles, and spraying during calm wind conditions.",
        "content_te": "మందులు పిచికారీ చేసేటప్పుడు చేతి తొడుగులు, మాస్క్ ధరించడం మరియు గాలి వీచే దిశను గమనించడం చాలా ముఖ్యం.",
        "keyPoints_en": [
            "Always wear gloves, face mask, and eye protection during mixing",
            "Calibrate sprayer nozzle to ensure uniform chemical droplet coverage",
            "Never spray pesticides against wind direction or during hot midday hours"
        ],
        "keyPoints_te": [
            "మందులు కలిపేటప్పుడు మాస్క్, చేతి తొడుగులు తప్పనిసరిగా ధరించండి",
            "మందు సమానంగా పడేలా పిచికారీ నాజిల్‌ను సరిచేసుకోండి",
            "ఎండ తీవ్రత ఉన్నప్పుడు లేదా గాలికి ఎదురుగా పిచికారీ చేయవద్దు"
        ],
        "tip_en": "Spray insecticides during early morning or late afternoon when honeybees are inactive.",
        "tip_te": "తేనెటీగలకు హాని కలగకుండా ఉదయాన్నే లేదా సాయంత్రం మందులు పిచికారీ చేయండి."
    },
    {
        "id": "agri-5-l4", "courseId": "agri-5", "lessonNumber": 4, "duration": "20 mins",
        "title_en": "Fungicides and Disease Prevention",
        "title_te": "శిలీంధ్ర నాశకాలు మరియు తెగుళ్ల నివారణ",
        "summary_en": "Managing fungal blights, rots, and mildew through preventive sprays.",
        "summary_te": "ఆకుమచ్చ, కుళ్ళు తెగులు మరియు బూజు తెగుళ్ల ముందస్తు నివారణ.",
        "content_en": "Fungal diseases like leaf spot, blast, and powdery mildew thrive in warm, humid weather. Preventive sprays of copper oxychloride or bio-agents like Trichoderma protect crops before infection spreads.",
        "content_te": "ఆకుమచ్చ, అగ్గి తెగులు వేడి, తేమ ఉన్నప్పుడు వేగంగా వ్యాపిస్తాయి. కాపర్ ఆక్సీక్లోరైడ్ లేదా ట్రైకోడెర్మా వంటి ముందస్తు పిచికారీ తెగుళ్లను అదుపు చేస్తుంది.",
        "keyPoints_en": [
            "Ensure adequate plant spacing for canopy ventilation",
            "Avoid over-fertilizing with Nitrogen, which creates soft foliage vulnerable to fungi",
            "Apply preventive copper or bio-fungicide sprays before continuous rains"
        ],
        "keyPoints_te": [
            "గాలి వెలుతురు ధారాళంగా తగిలేలా మొక్కల మధ్య దూరం పాటించండి",
            "అధిక నత్రజని వాడకాన్ని నివారించండి, ఇది తెగుళ్లను పెంచుతుంది",
            "వర్షాలకు ముందు జాగ్రత్తగా ముందస్తు శిలీంధ్ర నాశకాలను పిచికారీ చేయండి"
        ],
        "tip_en": "Remove and destroy infected plant debris from the field to stop fungal spore spread.",
        "tip_te": "తెగులు సోకిన మొక్క భాగాలను పొలం నుండి తొలగించి నాశనం చేయండి."
    },

    # agri-6
    {
        "id": "agri-6-l1", "courseId": "agri-6", "lessonNumber": 1, "duration": "20 mins",
        "title_en": "Principles of Organic Farming & Certification",
        "title_te": "సేంద్రీయ వ్యవసాయ సూత్రాలు మరియు ప్రమాణపత్రం",
        "summary_en": "Understanding organic standards, bio-inputs, and conversion period.",
        "summary_te": "సేంద్రీయ ప్రమాణాలు, జీవ ఉత్పాదకాలు మరియు పరివర్తన కాలాన్ని అర్థం చేసుకోవడం.",
        "content_en": "Organic farming avoids synthetic chemical fertilizers and toxic pesticides, relying instead on natural crop rotation, organic manures, and biological pest control to grow healthy, chemical-free food.",
        "content_te": "సేంద్రీయ వ్యవసాయం రసాయన ఎరువులు, పురుగు మందులను వర్జిస్తుంది. ఇది సహజ ఎరువులు మరియు జీవ నియంత్రణపై ఆధారపడి రసాయనాలు లేని ఆహారాన్ని అందిస్తుంది.",
        "keyPoints_en": [
            "Complete 3-year organic conversion period for land certification",
            "Maintain detailed farm records of all organic inputs and harvests",
            "Use certified organic seeds or untreated local seeds"
        ],
        "keyPoints_te": [
            "సేంద్రీయ ప్రమాణపత్రం కోసం 3 సంవత్సరాల పరివర్తన కాలాన్ని పూర్తి చేయండి",
            "సేంద్రీయ ఎరువులు మరియు దిగుబడుల వివరాలను నమోదు చేయండి",
            "రసాయన శుద్ధి చేయని స్థానిక లేదా సేంద్రీయ విత్తనాలను వాడండి"
        ],
        "tip_en": "Maintain a 3-meter buffer zone along field borders to prevent chemical drift from neighboring farms.",
        "tip_te": "పక్క పొలాల రసాయనాలు పడకుండా పొలం సరిహద్దుల్లో 3 మీటర్ల బఫర్ జోన్ నిర్వహించండి."
    },
    {
        "id": "agri-6-l2", "courseId": "agri-6", "lessonNumber": 2, "duration": "25 mins",
        "title_en": "Making Vermicompost & Panchagavya",
        "title_te": "వర్మీకంపోస్ట్ మరియు పంచగవ్య తయారీ",
        "summary_en": "Preparation steps for nutrient-rich vermicompost and bio-stimulants.",
        "summary_te": "పోషకాలతో కూడిన వానపాముల ఎరువు మరియు పంచగవ్య తయారీ విధానం.",
        "content_en": "Vermicompost uses earthworms to convert organic waste into high-grade humic manure. Panchagavya is a natural growth promoter prepared from cow dung, urine, milk, curd, and ghee.",
        "content_te": "వానపాముల ద్వారా వ్యర్థాలను పోషకాల ఎరువుగా మారుస్తారు. ఆవు పేడ, మూత్రం, పాలు, పెరుగు మరియు నెయ్యితో పంచగవ్య తయారు చేస్తారు.",
        "keyPoints_en": [
            "Maintain 60% moisture content in vermicompost pits",
            "Keep vermicompost beds shaded from direct sunlight and heavy rain",
            "Dilute Panchagavya at 3% concentration for foliar spray"
        ],
        "keyPoints_te": [
            "వర్మీకంపోస్ట్ గోతులలో 60% తేమను నిర్వహించండి",
            "ఎండ మరియు వర్షం పడకుండా నీడ ఉన్న ప్రదేశంలో బెడ్లను ఏర్పాటు చేయండి",
            "3% గాఢతతో పంచగవ్యను ఆకులపై పిచికారీ చేయండి"
        ],
        "tip_en": "Spraying 3% Panchagavya solution every 15 days increases flower retention and fruit setting.",
        "tip_te": "ప్రతి 15 రోజులకు ఒకసారి 3% పంచగవ్య పిచికారీ చేయడం వల్ల పూత మరియు పిందె నిలుస్తుంది."
    },
    {
        "id": "agri-6-l3", "courseId": "agri-6", "lessonNumber": 3, "duration": "20 mins",
        "title_en": "Green Manuring and Bio-mulching",
        "title_te": "పచ్చిరొట్ట ఎరువులు మరియు ముల్చింగ్",
        "summary_en": "Cultivating cover crops and organic mulches to enrich soil biology.",
        "summary_te": "నేల సారాన్ని పెంచడానికి పచ్చిరొట్ట పైర్లు మరియు ఆచ్ఛాదన వాడకం.",
        "content_en": "Green manuring involves growing fast-growing leguminous plants and ploughing them back into the soil at flowering stage. Organic mulching with straw or leaves conserves moisture and suppresses weeds.",
        "content_te": "జనుము, జీలుగు వంటి పచ్చిరొట్ట పైర్లను పెంచి పూత దశలో భూమిలో దున్ని కలపడం వల్ల నేల సారం పెరుగుతుంది.",
        "keyPoints_en": [
            "Sow Dhaincha or Sunn Hemp at 20-25 kg seed per acre",
            "Incorporate green manure into soil at 45 to 50 days growth stage",
            "Apply 3-4 inch straw mulch around vegetable crop rows"
        ],
        "keyPoints_te": [
            "ఎకరాకు 20-25 కేజీల జీలుగు లేదా జనుము విత్తనాలను విత్తండి",
            "45-50 రోజుల వయస్సులో పచ్చిరొట్టను భూమిలో కలిపి దున్నండి",
            "కూరగాయల పంటల వరుసల మధ్య వరి గడ్డితో 3-4 అంగుళాల ముల్చింగ్ చేయండి"
        ],
        "tip_en": "Plough in green manure 2 weeks before main crop sowing to allow full soil decomposition.",
        "tip_te": "ప్రధాన పంట విత్తడానికి 2 వారాల ముందే పచ్చిరొట్టను దున్ని మట్టిలో కుళ్లనివ్వండి."
    },
    {
        "id": "agri-6-l4", "courseId": "agri-6", "lessonNumber": 4, "duration": "20 mins",
        "title_en": "Natural Pest Control (Jeevamrutha & Neem Oil)",
        "title_te": "సహజ పురుగుల నివారణ (జీవామృతం & వేప నూనె)",
        "summary_en": "Preparing Jeevamrutha and neem seed kernel extract for field application.",
        "summary_te": "జీవామృతం మరియు వేప గింజల కషాయం తయారీ మరియు వాడకం.",
        "content_en": "Jeevamrutha is a fermented bio-culture rich in beneficial microorganisms that revive soil health. Neem oil (10,000 ppm) acts as an effective repellent and growth disruptor for insect pests.",
        "content_te": "జీవామృతం నేలలోని సూక్ష్మజీవులను పునరుజ్జీవింపజేస్తుంది. వేప నూనె పురుగుల వ్యాప్తిని అరికట్టడంలో సమర్థవంతంగా పనిచేస్తుంది.",
        "keyPoints_en": [
            "Ferment Jeevamrutha culture for 48-72 hours under shade",
            "Apply 200 liters of Jeevamrutha per acre through irrigation water",
            "Mix 5 ml neem oil with 1 ml liquid soap per liter of spray water"
        ],
        "keyPoints_te": [
            "జీవామృతాన్ని నీడలో 48-72 గంటల పాటు పులియబెట్టండి",
            "నీటిపారుదల నీటి ద్వారా ఎకరాకు 200 లీటర్ల జీవామృతం అందించండి",
            "లీటరు నీటికి 5 మి.లీ వేప నూనె మరియు 1 మి.లీ ద్రవ సబ్బు కలిపి పిచికారీ చేయండి"
        ],
        "tip_en": "Add liquid soap when preparing neem spray to ensure smooth emulsification in water.",
        "tip_te": "వేప నూనె నీటిలో బాగా కలవడానికి కొద్దిగా ద్రవ సబ్బును జోడించండి."
    },

    # agri-7
    {
        "id": "agri-7-l1", "courseId": "agri-7", "lessonNumber": 1, "duration": "20 mins",
        "title_en": "Precision Agri Tools & IoT Sensors",
        "title_te": "ఖచ్చితత్వ వ్యవసాయ పరికరాలు & IoT సెన్సార్లు",
        "summary_en": "Using soil moisture sensors, weather stations, and smart controllers.",
        "summary_te": "నేల తేమ సెన్సార్లు, వాతావరణ కేంద్రాలు మరియు స్మార్ట్ కంట్రోలర్ల వాడకం.",
        "content_en": "Smart farming utilizes digital tools such as soil sensors, automatic weather stations, and satellite telemetry to monitor crop health, soil moisture, and weather in real time.",
        "content_te": "స్మార్ట్ ఫార్మింగ్ డిజిటల్ పరికరాల ద్వారా పంట ఆరోగ్యం, తేమ మరియు వాతావరణాన్ని ప్రత్యక్షంగా పర్యవేక్షిస్తుంది.",
        "keyPoints_en": [
            "Soil sensors send automated moisture alerts to mobile phones",
            "Automatic Weather Stations (AWS) measure localized temperature and humidity",
            "Precision nutrient tools calculate exact fertilizer requirement per plot"
        ],
        "keyPoints_te": [
            "తేమ సెన్సార్లు మొబైల్‌కు నేరుగా సమాచారాన్ని పంపుతాయి",
            "ఆటోమేటిక్ వాతావరణ కేంద్రాలు స్థానిక ఉష్ణోగ్రత మరియు తేమను కొలుస్తాయి",
            "సరిగ్గా అవసరమైన మోతాదులోనే ఎరువులను వేయడానికి సెన్సార్లు సహాయపడతాయి"
        ],
        "tip_en": "Place soil moisture sensors at both shallow (15 cm) and deep (30 cm) root zone levels.",
        "tip_te": "మట్టి తేమ సెన్సార్లను వేరు వ్యవస్థ పైభాగం మరియు లోపలి భాగం రెండింటిలోనూ అమర్చండి."
    },
    {
        "id": "agri-7-l2", "courseId": "agri-7", "lessonNumber": 2, "duration": "25 mins",
        "title_en": "Drone Technology in Agriculture",
        "title_te": "వ్యవసాయంలో డ్రోన్ సాంకేతికత",
        "summary_en": "Drone spraying for pesticides, fertilizers, and crop surveillance.",
        "summary_te": "పురుగు మందులు, ద్రవ ఎరువుల పిచికారీ మరియు పంట పర్యవేక్షణకు డ్రోన్ల వాడకం.",
        "content_en": "Agricultural drones spray liquid fertilizers and pesticides in 1/10th of the time taken by hand sprayers, using 90% less water and ensuring ultra-uniform chemical coverage across fields.",
        "content_te": "వ్యవసాయ డ్రోన్లు అతి తక్కువ సమయంలో, చాలా తక్కువ నీటితో పొలమంతా సమానంగా మందులను పిచికారీ చేస్తాయి.",
        "keyPoints_en": [
            "Drones cover 1 acre field spray in under 10 minutes",
            "Reduces direct farmer exposure to chemical pesticides",
            "Multispectral drone cameras identify stressed crop patches early"
        ],
        "keyPoints_te": [
            "డ్రోన్లు ఎకరం పొలాన్ని 10 నిమిషాలలో పిచికారీ చేస్తాయి",
            "రైతులు నేరుగా రసాయనాల ప్రభావానికి గురికాకుండా రక్షిస్తాయి",
            "డ్రోన్ కెమెరాలు పంటల్లో ఉన్న సమస్యలను ముందే గుర్తిస్తాయి"
        ],
        "tip_en": "Fly drone sprayers at 2-3 meters height above crop canopy for optimum droplet distribution.",
        "tip_te": "మందు సమానంగా పడేందుకు పంటపై 2-3 మీటర్ల ఎత్తులో డ్రోన్‌ను నడపండి."
    },
    {
        "id": "agri-7-l3", "courseId": "agri-7", "lessonNumber": 3, "duration": "20 mins",
        "title_en": "Satellite Remote Sensing & Crop Mapping",
        "title_te": "శాటిలైట్ రిమోట్ సెన్సింగ్ & పంట మ్యాపింగ్",
        "summary_en": "Using NDVI indices to assess crop vigor and water stress.",
        "summary_te": "పంట సారం మరియు నీటి ఎద్దడిని అంచనా వేయడానికి NDVI సూచికల వాడకం.",
        "content_en": "NDVI satellite imagery measures green vegetation health from space, helping farmers identify yield variations, nutrient shortages, and irrigation leaks.",
        "content_te": "శాటిలైట్ ఇమేజరీ (NDVI) ద్వారా అంతరిక్షం నుండి పంట పచ్చదనాన్ని, నీటి ఎద్దడిని పరిశీలించవచ్చు.",
        "keyPoints_en": [
            "NDVI values near 0.8 indicate healthy, dense green crop canopy",
            "Sudden drops in NDVI highlight disease outbreaks or drought stress",
            "Satellite maps help optimize field-specific fertilizer application"
        ],
        "keyPoints_te": [
            "NDVI విలువ 0.8 ఉంటే పంట చాలా ఆరోగ్యకరంగా ఉన్నట్లు అర్థం",
            "విలువలు తగ్గడం వల్ల తెగుళ్ళు లేదా నీటి ఎద్దడిని గుర్తించవచ్చు",
            "శాటిలైట్ మ్యాప్‌ల ద్వారా అవసరమైన చోటే ఎరువులు వేయవచ్చు"
        ],
        "tip_en": "Check satellite crop health maps weekly to identify underperforming field zones.",
        "tip_te": "పంట సరిగ్గా పెరగని ప్రాంతాలను గుర్తించడానికి వారానికోసారి శాటిలైట్ మ్యాప్‌ను పరిశీలించండి."
    },
    {
        "id": "agri-7-l4", "courseId": "agri-7", "lessonNumber": 4, "duration": "15 mins",
        "title_en": "Digital Portals and Agri Mobile Apps",
        "title_te": "డిజిటల్ పోర్టల్స్ మరియు అగ్రి మొబైల్ యాప్‌లు",
        "summary_en": "Accessing market prices, weather alerts, and expert advice via phone.",
        "summary_te": "మొబైల్ ఫోన్ ద్వారా మార్కెట్ ధరలు, వాతావరణ నివేదికలు మరియు నిపుణుల సలహాలు పొందడం.",
        "content_en": "Digital mobile applications provide farmers with direct access to live mandi rates, weather forecasts, government scheme applications, and AI crop disease diagnosis using smartphone photos.",
        "content_te": "అగ్రి మొబైల్ యాప్‌లు రైతులకు మార్కెట్ ధరలు, వాతావరణ హెచ్చరికలు, ప్రభుత్వ పథకాలు మరియు AI తెగుళ్ల గుర్తింపును అందిస్తాయి.",
        "keyPoints_en": [
            "Upload crop leaf photos for instant AI disease identification",
            "Receive real-time weather risk alerts via SMS or app notifications",
            "Compare live mandi prices across nearby markets before selling"
        ],
        "keyPoints_te": [
            "AI ద్వారా తెగులును గుర్తించడానికి ఆకు ఫోటోలను అప్‌లోడ్ చేయండి",
            "మొబైల్‌కు ప్రత్యక్ష వాతావరణ హెచ్చరికలను పొందండి",
            "అమ్మకానికి ముందు సమీప మార్కెట్ ధరలను పోల్చి చూడండి"
        ],
        "tip_en": "Take clear, well-lit photos of diseased leaves showing both top and bottom surfaces for AI diagnosis.",
        "tip_te": "తెగులు గుర్తింపు కోసం ఆకు పైన మరియు క్రింది భాగం స్పష్టంగా కనిపించేలా ఫోటో తీయండి."
    },

    # agri-8
    {
        "id": "agri-8-l1", "courseId": "agri-8", "lessonNumber": 1, "duration": "20 mins",
        "title_en": "Determining Optimum Harvest Timing",
        "title_te": "సరైన పంట కోత సమయాన్ని నిర్ణయించడం",
        "summary_en": "Checking grain moisture percentage and crop maturity indicators.",
        "summary_te": "ధాన్యం తేమ శాతం మరియు పంట పక్వత సూచికల తనిఖీ.",
        "content_en": "Harvesting at peak maturity prevents grain shattering in fields and ensures high market value. Grains harvested too early have high moisture and spoil during storage.",
        "content_te": "సరిగ్గా పకినప్పుడు కోత కోయడం వల్ల గింజలు రాలవు మరియు మంచి మార్కెట్ ధర వస్తుంది. ముందే కోస్తే తేమ వల్ల ధాన్యం పాడవుతుంది.",
        "keyPoints_en": [
            "Harvest paddy when 80-85% grains turn straw golden yellow",
            "Grain moisture content should be 18-20% at harvest and dried to 12-14% for storage",
            "Avoid harvesting right after rain or heavy morning dew"
        ],
        "keyPoints_te": [
            "80-85% వరి గింజలు బంగారు పసుపు రంగులోకి మారినప్పుడు కోత కోయండి",
            "కోసే సమయంలో తేమ 18-20% ఉండాలి మరియు నిల్వ కోసం 12-14% కి ఆరబెట్టాలి",
            "వర్షం పడిన వెంటనే లేదా మంచు ఉన్నప్పుడు కోత కోయవద్దు"
        ],
        "tip_en": "Sun-dry harvested grains on tarpaulin sheets to bring moisture content down to 12% before bagging.",
        "tip_te": "సంచుల్లో నింపే ముందు ధాన్యం తేమను 12% కి తగ్గించడానికి తార్పాలిన్ షీట్లపై బాగా ఆరబెట్టండి."
    },
    {
        "id": "agri-8-l2", "courseId": "agri-8", "lessonNumber": 2, "duration": "20 mins",
        "title_en": "Cleaning, Grading, and Packaging",
        "title_te": "శుభ్రపరచడం, గ్రేడింగ్ మరియు ప్యాకేజింగ్",
        "summary_en": "Removing chaff, sorting produce by size and quality for premium prices.",
        "summary_te": "పొట్టు తొలగించడం, నాణ్యత మరియు పరిమాణం ప్రకారం వేరు చేసి మంచి ధర పొందడం.",
        "content_en": "Post-harvest cleaning and grading separates damaged, undersized, or diseased produce from top-quality items. Graded produce commands a 15-20% higher market price in mandis.",
        "content_te": "కోత అనంతర శుభ్రత మరియు గ్రేడింగ్ ద్వారా నాణ్యమైన ఉత్పత్తులను వేరు చేయడం వల్ల మార్కెట్లో 15-20% అదనపు ధర లభిస్తుంది.",
        "keyPoints_en": [
            "Use winnowers or grain cleaners to remove dust, chaff, and weed seeds",
            "Grade produce into Grade A, B, and C based on size, color, and texture",
            "Pack produce in clean jute or breathable HDPE bags with weight tags"
        ],
        "keyPoints_te": [
            "ధాన్యం నుండి తూడు, పొట్టు తొలగించడానికి తూర్పారబట్టండి",
            "పరిమాణం, రంగు ఆధారంగా ఎ, బి, సి గ్రేడ్లుగా వేరు చేయండి",
            "పరిశుభ్రమైన గోనె సంచులలో ప్యాక్ చేయండి"
        ],
        "tip_en": "Never mix damaged or decaying fruits/vegetables with healthy produce during packaging.",
        "tip_te": "ప్యాకింగ్ చేసేటప్పుడు పాడైన కాయలను మంచి ఉత్పత్తులతో కలపకండి."
    },
    {
        "id": "agri-8-l3", "courseId": "agri-8", "lessonNumber": 3, "duration": "25 mins",
        "title_en": "Scientific Grain Storage & Hermetic Bags",
        "title_te": "శాస్త్రీయ ధాన్య నిల్వ & హెర్మెటిక్ సంచులు",
        "summary_en": "Preventing storage pests, weevils, and moisture damage in godowns.",
        "summary_te": "గోడౌన్లలో పురుగులు, ముక్కు పురుగులు మరియు తేమ నుండి ధాన్యాన్ని రక్షించడం.",
        "content_en": "Grain storage losses from insect pests reach up to 10%. Using airtight hermetic bags deprives insects of oxygen, killing pests naturally without chemicals.",
        "content_te": "నిల్వ ఉంచిన ధాన్యానికి పురుగుల వల్ల 10% వరకు నష్టం జరుగుతుంది. గాలి చొరబడని సంచులు (హెర్మెటిక్ బ్యాగ్స్) వాడటం వల్ల పురుగులు సహజంగా చనిపోతాయి.",
        "keyPoints_en": [
            "Store bags on wooden dunnage racks elevated 1 foot off the ground",
            "Maintain 1 meter gap between bag stacks and warehouse walls",
            "Use airtight hermetic bags to eliminate storage weevils naturally"
        ],
        "keyPoints_te": [
            "సంచులను నేలకు తగలకుండా చెక్క బల్లలపై ఉంచండి",
            "గోడలకు సంచులకు మధ్య 1 మీటరు ఖాళీ ఉంచండి",
            "పురుగుల నివారణకు గాలి చొరబడని బ్యాగులను వాడండి"
        ],
        "tip_en": "Place dry neem leaves inside storage bags to prevent insect infestation naturally.",
        "tip_te": "సంచులలో పురుగులు పట్టకుండా ఎండిన వేప ఆకులను వేయండి."
    },
    {
        "id": "agri-8-l4", "courseId": "agri-8", "lessonNumber": 4, "duration": "20 mins",
        "title_en": "Cold Storage & Cold Chain Logistics",
        "title_te": "కోల్డ్ స్టోరేజ్ & కోల్డ్ చైన్ లాజిస్టిక్స్",
        "summary_en": "Pre-cooling, temperature control, and humidity management for perishable produce.",
        "summary_te": "త్వరగా పాడయ్యే కూరగాయలు, పండ్ల కోసం ఉష్ణోగ్రత మరియు తేమ నిర్వహణ.",
        "content_en": "Perishable produce requires cold storage maintenance (2-8°C) to slow down respiration rates, double shelf life, and enable transport to distant urban markets.",
        "content_te": "త్వరగా పాడయ్యే కూరగాయలు, పండ్లను కోల్డ్ స్టోరేజ్‌లో నిల్వ చేయడం వల్ల వాటి నిల్వ కాలం పెరుగుతుంది మరియు మంచి ధర లభిస్తుంది.",
        "keyPoints_en": [
            "Pre-cool harvested vegetables within 2 hours of field picking",
            "Maintain relative humidity at 85-95% to prevent fruit shriveling",
            "Book certified cold storage spaces early during peak harvest seasons"
        ],
        "keyPoints_te": [
            "కోసిన 2 గంటలలోపు కూరగాయలను నీడలో ప్రీ-కూల్ చేయండి",
            "పండ్లు ముడతలు పడకుండా ఉండటానికి 85-95% తేమను నిర్వహించండి",
            "కోత కాలానికి ముందే కోల్డ్ స్టోరేజ్ స్థలాన్ని బుక్ చేసుకోండి"
        ],
        "tip_en": "Pre-cool fruits in shaded packing sheds immediately after picking to remove field heat.",
        "tip_te": "పండ్లను కోసిన వెంటనే వేడి తగ్గేలా నీడ ఉన్న ప్రదేశంలో ఆరబెట్టండి."
    },

    # agri-9
    {
        "id": "agri-9-l1", "courseId": "agri-9", "lessonNumber": 1, "duration": "15 mins",
        "title_en": "Understanding Mandi Price Discovery",
        "title_te": "మండీ ధరల నిర్ణయ ప్రక్రియను అర్థం చేసుకోవడం",
        "summary_en": "Factors influencing daily mandi prices: arrival volume, quality, and demand.",
        "summary_te": "రోజువారీ మండీ ధరలను ప్రభావితం చేసే అంశాలు: రాబడి, నాణ్యత మరియు డిమాండ్.",
        "content_en": "Mandi prices fluctuate daily based on total crop arrival volumes, quality grading, buyer competition, and transportation costs. Monitoring arrival trends helps farmers choose the best selling day.",
        "content_te": "మండీ ధరలు మార్కెట్ రాబడి, నాణ్యత మరియు కొనుగోలుదారుల పోటీ ఆధారంగా రోజూ మారతాయి. ఈ వివరాలు తెలిస్తే మంచి రోజున అమ్మవచ్చు.",
        "keyPoints_en": [
            "High market arrival volumes lead to temporary price dips",
            "Grade A produce commands premium prices even during supply gluts",
            "Track market arrival statistics on Agmarknet or PureFarm portal"
        ],
        "keyPoints_te": [
            "మార్కెట్‌కు పంట ఎక్కువగా వస్తే తాత్కాలికంగా ధరలు తగ్గుతాయి",
            "నాణ్యమైన (Grade A) సరుకుకు ఎప్పుడూ మంచి ధర ఉంటుంది",
            "మార్కెట్ రాబడి గణాంకాలను ఆన్‌లైన్‌లో తనిఖీ చేయండి"
        ],
        "tip_en": "Avoid selling on peak arrival Mondays when mandi supply overflow depresses prices.",
        "tip_te": "సరుకు ఎక్కువగా వచ్చే సోమవారాల్లో కాకుండా మిగిలిన రోజుల్లో అమ్మడానికి ప్రయత్నించండి."
    },
    {
        "id": "agri-9-l2", "courseId": "agri-9", "lessonNumber": 2, "duration": "20 mins",
        "title_en": "e-NAM (Electronic National Agriculture Market)",
        "title_te": "ఈ-నామ్ (ఈ-జాతీయ వ్యవసాయ మార్కెట్)",
        "summary_en": "Registering on e-NAM, online quality testing, and transparent digital bidding.",
        "summary_te": "ఈ-నామ్‌లో నమోదు, ఆన్‌లైన్ నాణ్యత పరీక్ష మరియు డిజిటల్ వేలం.",
        "content_en": "e-NAM connects physical mandis across India into a single online trading platform. Farmers can sell produce to distant traders through transparent digital auctions and direct bank payments.",
        "content_te": "ఈ-నామ్ దేశవ్యాప్తంగా ఉన్న మార్కెట్లను అనుసంధానిస్తుంది. రైతులు ఆన్‌లైన్ వేలం ద్వారా దేశంలో ఎక్కడైనా అమ్మి నేరుగా బ్యాంకులో డబ్బు పొందవచ్చు.",
        "keyPoints_en": [
            "Register farmer account on e-NAM portal using Aadhaar and bank details",
            "Get produce quality sampled and tested at e-NAM assaying labs",
            "Receive direct online payment into bank account within 24 hours"
        ],
        "keyPoints_te": [
            "ఆధార్, బ్యాంకు వివరాలతో ఈ-నామ్‌లో నమోదు చేసుకోండి",
            "ఈ-నామ్ ల్యాబ్‌లలో సరుకు నాణ్యత పరీక్ష చేయించండి",
            "24 గంటల్లో బ్యాంకు ఖాతాకు నేరుగా డబ్బు జమ అవుతుంది"
        ],
        "tip_en": "Assaying quality test reports on e-NAM help farmers command better prices from online buyers.",
        "tip_te": "ఈ-నామ్ నాణ్యత నివేదిక ద్వారా ఆన్‌లైన్ వ్యాపారుల నుండి మంచి ధర లభిస్తుంది."
    },
    {
        "id": "agri-9-l3", "courseId": "agri-9", "lessonNumber": 3, "duration": "20 mins",
        "title_en": "Direct Selling to Retailers & FPOs",
        "title_te": "రిటైలర్లు & FPOలకు నేరుగా విక్రయించడం",
        "summary_en": "Forming Farmer Producer Organizations (FPOs) for bulk bargaining power.",
        "summary_te": "రైతు ఉత్పత్తిదారుల సంఘాలు (FPO) ద్వారా దళారులు లేకుండా నేరుగా విక్రయించడం.",
        "content_en": "Selling through FPOs or direct supply contracts with retail chains bypasses multiple middleman commissions, increasing farmer profit margins by 15-20%.",
        "content_te": "రైతు సంఘాల (FPO) ద్వారా నేరుగా విక్రయించడం వల్ల దళారుల కమిషన్లు తప్పి రైతులకు 15-20% అదనపు లాభం చేకూరుతుంది.",
        "keyPoints_en": [
            "FPOs aggregate small farmer produce into large commercial lots",
            "Bulk purchasing of inputs lowers seed and fertilizer costs",
            "Direct contracts offer pre-agreed fixed price protection"
        ],
        "keyPoints_te": [
            "FPOలు చిన్న రైతుల ఉత్పత్తులను సేకరించి పెద్ద మొత్తంలో విక్రయిస్తాయి",
            "ఉమ్మడి కొనుగోలు వల్ల విత్తనాలు, ఎరువుల ఖరీదు తగ్గుతుంది",
            "నేరుగా ఒప్పందాలు చేసుకోవడం వల్ల ధరల రక్షణ లభిస్తుంది"
        ],
        "tip_en": "Join a local FPO to aggregate small crop quantities into bulk lots that attract corporate buyers.",
        "tip_te": "పెద్ద వ్యాపారులను ఆకర్షించడానికి మీ స్థానిక FPOలో చేరండి."
    },
    {
        "id": "agri-9-l4", "courseId": "agri-9", "lessonNumber": 4, "duration": "20 mins",
        "title_en": "Value Addition & Primary Processing",
        "title_te": "విలువ జోడింపు & ప్రాథమిక ప్రాసెసింగ్",
        "summary_en": "Processing crops into flour, oil, dried fruits, or spices for higher profit.",
        "summary_te": "అధిక లాభం కోసం పంటలను పిండి, నూనె, ఎండిన పండ్లు లేదా మసాలాలుగా మార్చడం.",
        "content_en": "Primary processing—such as milling mustard into oil, converting paddy to rice, or drying turmeric and chillies—transforms raw agricultural commodities into high-value processed products.",
        "content_te": "పంటలను ప్రాసెసింగ్ చేయడం (ఆవాల నూనె, పసుపు పొడి, మిరపకాయలు ఎండబెట్టడం) ద్వారా ముడి సరుకు కంటే రెట్టింపు లాభం పొందవచ్చు.",
        "keyPoints_en": [
            "Simple milling and packaging doubles profit margins compared to raw grain sales",
            "Solar drying extends shelf life of perishable chillies and fruits",
            "Obtain basic FSSAI registration for selling packaged processed foods"
        ],
        "keyPoints_te": [
            "గింజల కంటే ప్రాసెస్ చేసిన ఉత్పత్తులను ప్యాక్ చేసి అమ్మడం వల్ల లాభం పెరుగుతుంది",
            "సౌర శక్తితో ఎండబెట్టడం వల్ల మిరపకాయలు, పండ్ల నిల్వ కాలం పెరుగుతుంది",
            "ప్యాక్ చేసిన ఉత్పత్తుల విక్రయానికి FSSAI రిజిస్ట్రేషన్ పొందండి"
        ],
        "tip_en": "Solar drying tomatoes and chillies creates shelf-stable products that sell at 3x raw prices.",
        "tip_te": "టమాటాలు, మిరపకాయలను ఎండబెట్టి ప్యాక్ చేయడం వల్ల 3 రెట్లు ఎక్కువ ధర పొందవచ్చు."
    },

    # agri-10
    {
        "id": "agri-10-l1", "courseId": "agri-10", "lessonNumber": 1, "duration": "15 mins",
        "title_en": "PM-KISAN Income Support Scheme",
        "title_te": "పిఎం-కిసాన్ ఆదాయ మద్దతు పథకం",
        "summary_en": "Eligibility criteria, enrollment process, Aadhaar seeding, and status tracking.",
        "summary_te": "అర్హత నిబంధనలు, దరఖాస్తు విధానం, ఆధార్ లింకింగ్ మరియు పేమెంట్ ట్రాకింగ్.",
        "content_en": "PM-KISAN provides Rs. 6,000 per year in three equal installments of Rs. 2,000 directly into the bank accounts of landholding farmer families across India.",
        "content_te": "పిఎం-కిసాన్ ద్వారా అర్హులైన రైతు కుటుంబాలకు ఏడాదికి రూ. 6,000 ని మూడు విడతల్లో నేరుగా బ్యాంకు ఖాతాలో జమ చేస్తారు.",
        "keyPoints_en": [
            "Rs. 6,000 annual income support transferred directly via DBT",
            "Requires land ownership records (Khata/Khasra) and Aadhaar linkage",
            "Check installment payment status on PM-KISAN official portal"
        ],
        "keyPoints_te": [
            "ఏడాదికి రూ. 6,000 సాయం నేరుగా ఖాతాలో జమ అవుతుంది",
            "పట్టాదారు పాస్ పుస్తకం మరియు ఆధార్ లింకింగ్ తప్పనిసరి",
            "పిఎం-కిసాన్ పోర్టల్‌లో పేమెంట్ వివరాలను తనిఖీ చేయవచ్చు"
        ],
        "tip_en": "Ensure your bank account is e-KYC verified and seeded with Aadhaar to receive installments without delay.",
        "tip_te": "ఆలస్యం కాకుండా డబ్బులు పడటానికి బ్యాంకు ఖాతాకు e-KYC పూర్తి చేయండి."
    },
    {
        "id": "agri-10-l2", "courseId": "agri-10", "lessonNumber": 2, "duration": "15 mins",
        "title_en": "Soil Health Card Scheme",
        "title_te": "సాయిల్ హెల్త్ కార్డ్ (నేల ఆరోగ్య కార్డు) పథకం",
        "summary_en": "How to get free soil testing, reading soil card results, and fertilizer recommendations.",
        "summary_te": "ఉచిత నేల పరీక్షలు, సాయిల్ కార్డ్ ఫలితాలను చదవడం మరియు ఎరువుల సిఫార్సులు.",
        "content_en": "The Soil Health Card scheme provides farmers with customized nutrient advisories every 3 years, guiding balanced fertilizer application to lower cultivation costs.",
        "content_te": "సాయిల్ హెల్త్ కార్డ్ పథకం ప్రతి 3 సంవత్సరాలకు ఒకసారి ఉచిత నేల పరీక్షలు చేసి ఎరువుల వాడకంపై ఉచిత సలహాలు ఇస్తుంది.",
        "keyPoints_en": [
            "Free soil testing conducted by government agriculture laboratories",
            "Card specifies status of 12 soil parameters including N, P, K, and micro-nutrients",
            "Provides crop-specific fertilizer dosage recommendations"
        ],
        "keyPoints_te": [
            "ప్రభుత్వ ల్యాబ్‌ల ద్వారా ఉచితంగా నేల పరీక్షలు చేస్తారు",
            "కార్డులో 12 రకాల నేల పోషకాల వివరాలు ఉంటాయి",
            "పంట ఆధారంగా వేయాల్సిన ఎరువుల మోతాదును సూచిస్తారు"
        ],
        "tip_en": "Follow Soil Health Card dosage recommendations to save up to 20% on unnecessary fertilizer expenses.",
        "tip_te": "కార్డులోని సిఫార్సులను పాటించడం ద్వారా 20% ఎరువుల ఖర్చును ఆదా చేయవచ్చు."
    },
    {
        "id": "agri-10-l3", "courseId": "agri-10", "lessonNumber": 3, "duration": "20 mins",
        "title_en": "Kisan Credit Card (KCC) Scheme",
        "title_te": "కిసాన్ క్రెడిట్ కార్డ్ (KCC) పథకం",
        "summary_en": "Low-interest crop loans, interest subvention, and application requirements.",
        "summary_te": "తక్కువ వడ్డీకే పంట రుణాలు, వడ్డీ రాయితీ మరియు దరఖాస్తు ప్రక్రియ.",
        "content_en": "Kisan Credit Card gives farmers flexible working capital credit for crop cultivation at concessional 4% interest rates (with prompt repayment interest subvention).",
        "content_te": "కిసాన్ క్రెడిట్ కార్డ్ ద్వారా రైతులకు కేవలం 4% తక్కువ వడ్డీకే పంట రుణాలు లభిస్తాయి.",
        "keyPoints_en": [
            "Provides short-term crop loans up to Rs. 3 Lakh at 4% effective interest",
            "No collateral required for crop loans up to Rs. 1.6 Lakh",
            "Covers crop cultivation, post-harvest expenses, and livestock maintenance"
        ],
        "keyPoints_te": [
            "రూ. 3 లక్షల వరకు తక్కువ వడ్డీకే పంట రుణాలు ఇస్తారు",
            "రూ. 1.6 లక్షల వరకు ఎలాంటి షూరిటీ అవసరం లేదు",
            "పంట సాగు, కోత ఖర్చులు మరియు పశుపోషణకు వర్తిస్తుంది"
        ],
        "tip_en": "Repay KCC loan before due date to claim 3% prompt repayment interest subvention bonus.",
        "tip_te": "3% వడ్డీ రాయితీ బోనస్ పొందడానికి రుణాన్నీ గడువులోగా చెల్లించండి."
    },
    {
        "id": "agri-10-l4", "courseId": "agri-10", "lessonNumber": 4, "duration": "20 mins",
        "title_en": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "title_te": "ప్రధాన మంత్రి ఫసల్ బీమా యోజన (PMFBY)",
        "summary_en": "Crop insurance coverage, low premium rates, crop loss reporting within 72 hours.",
        "summary_te": "పంట బీమా పరిహారం, తక్కువ ప్రీమియం మరియు 72 గంటల్లో పంట నష్టం నమోదు.",
        "content_en": "PMFBY protects farmers against non-preventable crop losses from natural calamities, droughts, floods, and pest attacks. Premium is capped at just 2% for Kharif and 1.5% for Rabi crops.",
        "content_te": "ప్రకృతి వైపరీత్యాలు, వర్షాభావం వల్ల కలిగే పంట నష్టాల నుండి ఫసల్ బీమా యోజన ఆర్థిక రక్షణ ఇస్తుంది. ఖరీఫ్‌కు 2%, రబీకి 1.5% మాత్రమే ప్రీమియం.",
        "keyPoints_en": [
            "Farmer premium capped at 2% for Kharif, 1.5% for Rabi, 5% for commercial crops",
            "Covers prevented sowing, standing crop damage, and localized hailstorm loss",
            "Must report crop loss within 72 hours to insurance company or agri officer"
        ],
        "keyPoints_te": [
            "ఖరీఫ్ పంటలకు 2%, రబీ పంటలకు 1.5% మాత్రమే ప్రీమియం",
            "వరదలు, వడగండ్ల వర్షం వల్ల కలిగే నష్టానికి పరిహారం ఇస్తారు",
            "పంట నష్టం జరిగిన 72 గంటల్లోపు నమోదు చేయాలి"
        ],
        "tip_en": "In case of hailstorm or localized flooding, inform the insurance company within 72 hours via crop insurance app.",
        "tip_te": "వడగండ్ల వర్షం పడితే 72 గంటల్లోపు క్రాప్ బీమా యాప్ ద్వారా సమాచారం ఇవ్వండి."
    },

    # agri-11
    {
        "id": "agri-11-l1", "courseId": "agri-11", "lessonNumber": 1, "duration": "20 mins",
        "title_en": "Designing Micro-Drip Layouts",
        "title_te": "సూక్ష్మ బిందు సేద్య లేఅవుట్ రూపకల్పన",
        "summary_en": "Calculating lateral line spacing, emitter discharge rates, and pressure regulators.",
        "summary_te": "పటాలు, డ్రిప్పర్ల నీటి ప్రవాహ రేటు మరియు ప్రెజర్ రెగ్యులేటర్ల అమరిక.",
        "content_en": "Precision drip systems require correct sizing of mainlines, submains, lateral tubes, and inline drippers based on soil texture, slope, and crop row spacing.",
        "content_te": "బిందు సేద్యం విజయవంతం కావడానికి పొలం వాలు, పంట వరుసల ఆధారంగా లైన్లు, డ్రిప్పర్లను సరిగ్గా ఏర్పాటు చేయాలి.",
        "keyPoints_en": [
            "Select 16 mm lateral lines with 2 LPH or 4 LPH pressure-compensating emitters",
            "Maintain operating pressure at 1.0 to 1.5 kg/cm² using pressure regulators",
            "Install flush valves at lateral ends for periodic sediment flushing"
        ],
        "keyPoints_te": [
            "పంటకు తగినట్లుగా 16 mm లేటరల్ లైన్లను అమర్చండి",
            "నీటి ఒత్తిడిని 1.0 నుండి 1.5 kg/cm² మధ్య స్థిరంగా ఉంచండి",
            "లైన్లను శుభ్రం చేయడానికి చివర్లలో ఫ్లష్ వాల్వ్‌లను అమర్చండి"
        ],
        "tip_en": "Operate drip systems early in the morning to maintain optimal hydraulic pressure across laterals.",
        "tip_te": "సరైన నీటి ఒత్తిడి ఉండటానికి ఉదయాన్నే డ్రిప్ సిస్టమ్‌ను నడపండి."
    },
    {
        "id": "agri-11-l2", "courseId": "agri-11", "lessonNumber": 2, "duration": "25 mins",
        "title_en": "Fertigation: Dosing Water-Soluble Fertilizers",
        "title_te": "ఫెర్టిగేషన్: ద్రవ ఎరువుల వాడకం",
        "summary_en": "Using Venturi injectors and fertilizer tanks to feed crops through drippers.",
        "summary_te": "వెంచురీ పరికరాల ద్వారా నేరుగా బిందు సేద్యపు నీటిలోనే ఎరువులు అందించడం.",
        "content_en": "Fertigation delivers liquid water-soluble fertilizers directly into root zones via drip lines, raising nutrient efficiency from 40% to 80%.",
        "content_te": "నీటిలో కరిగే ఎరువులను బిందు సేద్యం ద్వారా అందించడం (ఫెర్టిగేషన్) వల్ల పోషకాల గ్రహణ 40% నుండి 80% కి పెరుగుతుంది.",
        "keyPoints_en": [
            "Use 100% water-soluble fertilizers to prevent line clogging",
            "Inject fertilizers during middle 50% of total irrigation cycle duration",
            "Flush drip lines with clean water for 15 minutes after every fertigation session"
        ],
        "keyPoints_te": [
            "పైపులు మూసుకుపోకుండా 100% నీటిలో కరిగే ఎరువులనే వాడండి",
            "నీరు పారే సమయంలో మధ్య భాగంలో ఎరువులను అందించండి",
            "ఎరువులు వేసిన తర్వాత 15 నిమిషాలు మంచి నీటిని పారించి పైపులను కడగండి"
        ],
        "tip_en": "Always run clean water through drip lines for 15 minutes after fertigation to wash residual chemical salts.",
        "tip_te": "ఎరువులు పారించిన తర్వాత 15 నిమిషాలు మంచి నీటిని పారించి పైపులను శుభ్రం చేయండి."
    },
    {
        "id": "agri-11-l3", "courseId": "agri-11", "lessonNumber": 3, "duration": "20 mins",
        "title_en": "Acid Treatment & Maintenance of Drippers",
        "title_te": "యాసిడ్ ట్రీట్మెంట్ & డ్రిప్పర్ల నిర్వహణ",
        "summary_en": "Cleaning salt deposits and algae from drippers using hydrochloric or phosphoric acid.",
        "summary_te": "డ్రిప్పర్లలో పేరుకుపోయిన ఉప్పు, ఆల్గే రసాయనాలను యాసిడ్ ట్రీట్మెంట్ ద్వారా శుభ్రం చేయడం.",
        "content_en": "Hard water and algae cause dripper clogging over time. Periodic acid treatment with dilute Hydrochloric (HCl) or Phosphoric acid dissolves mineral scale and keeps drippers operating at 100% flow rate.",
        "content_te": "భాస్వరం, ఉప్పు లవణాలు పట్టి డ్రిప్పర్లు మూసుకుపోతాయి. పలచని హైడ్రోక్లోరిక్ యాసిడ్ ద్వారా వీటిని శుభ్రపరచవచ్చు.",
        "keyPoints_en": [
            "Check drip emitter flow rate uniformity across field lines monthly",
            "Perform acid treatment when emitter discharge drops by more than 10%",
            "Use 0.1% Hydrochloric acid solution and let it sit in laterals for 24 hours before flushing"
        ],
        "keyPoints_te": [
            "నెలకోసారి నీటి పారకం సరిగ్గా ఉందో లేదో తనిఖీ చేయండి",
            "నీటి ప్రవాహం తగ్గిపోతే యాసిడ్ ట్రీట్మెంట్ చేయండి",
            "0.1% హెచ్‌సిఎల్ (HCl) ద్రావణాన్ని 24 గంటలు పైపులలో ఉంచి తర్వాత కడగండి"
        ],
        "tip_en": "Flush lateral ends every 15 days by opening end caps while drip pump is running.",
        "tip_te": "ప్రతి 15 రోజులకు ఒకసారి పంప్ నడుస్తున్నప్పుడు ఎండ్ క్యాప్‌లు తీసి లైన్లను కడగండి."
    },
    {
        "id": "agri-11-l4", "courseId": "agri-11", "lessonNumber": 4, "duration": "20 mins",
        "title_en": "Precision Soil Sensor Integration",
        "title_te": "నేల సెన్సార్ల అనుసంధానం",
        "summary_en": "Connecting soil moisture and EC sensors to automated irrigation valves.",
        "summary_te": "ఆటోమేటిక్ నీటిపారుదల కోసం నేల తేమ సెన్సార్లను వాల్వ్‌లకు అనుసంధానించడం.",
        "content_en": "Integrating soil moisture probes and Electrical Conductivity (EC) sensors with automated solenoid valves turns drip systems into smart precision systems that irrigate automatically when soil moisture drops.",
        "content_te": "తేమ సెన్సార్లను ఆటోమేటిక్ వాల్వ్‌లకు అనుసంధానించడం వల్ల నేలలో తేమ తగ్గినప్పుడు సిస్టమ్ ఆటోమేటిక్‌గా నడుస్తుంది.",
        "keyPoints_en": [
            "Automated solenoid valves open and close based on real-time soil moisture thresholds",
            "EC sensors monitor root zone salinity and prevent fertilizer burn",
            "Reduces labor costs and water consumption by an additional 25%"
        ],
        "keyPoints_te": [
            "తేమ శాతాన్ని బట్టి ఆటోమేటిక్ వాల్వ్‌లు తెరుచుకుంటాయి",
            "లవణాల శాతాన్ని సెన్సార్లు పర్యవేక్షిస్తాయి",
            "శ్రమ మరియు నీటి వాడకం మరో 25% తగ్గుతాయి"
        ],
        "tip_en": "Calibrate soil sensors at the start of each season using saturated and field capacity soil samples.",
        "tip_te": "ప్రతి సీజన్ ప్రారంభంలో సెన్సార్ల పనితీరును తనిఖీ చేయండి."
    },

    # agri-12
    {
        "id": "agri-12-l1", "courseId": "agri-12", "lessonNumber": 1, "duration": "20 mins",
        "title_en": "Climate Risk Assessment & Resilient Varieties",
        "title_te": "వాతావరణ ప్రమాద అంచనా & తట్టుకునే రకాలు",
        "summary_en": "Selecting drought-tolerant, flood-tolerant, and short-duration crop varieties.",
        "summary_te": "కరువు, వరదలను తట్టుకునే మరియు స్వల్పకాలిక విత్తన రకాల ఎంపిక.",
        "content_en": "Climate-smart agriculture focuses on building farm resilience against extreme weather events. Planting stress-tolerant seeds like drought-resistant maize or flood-tolerant Sub1 paddy safeguards harvests.",
        "content_te": "వాతావరణ మార్పులను తట్టుకోవడానికి కరువు, ముంపును తట్టుకునే వంగడాలను ఎంచుకోవడం వల్ల పంట నష్టం తగ్గుతుంది.",
        "keyPoints_en": [
            "Sow climate-resilient crop varieties certified by ICAR / State Agri Universities",
            "Adopt short-duration varieties in drought-prone districts",
            "Diversify crop portfolio with climate-hardy millets (Ragi, Bajra, Jowar)"
        ],
        "keyPoints_te": [
            "వ్యవసాయ విశ్వవిద్యాలయాలు ధృవీకరించిన విత్తన రకాలను వాడండి",
            "కరువు ప్రాంతాలలో స్వల్పకాలిక రకాలను ఎంచుకోండి",
            "తృణధాన్యాలు (రాగులు, సజ్జలు, జొన్నలు) సాగు చేసి పంట వైవిధ్యాన్ని పెంచండి"
        ],
        "tip_en": "Millets consume 70% less water than paddy and survive high heat dry spells.",
        "tip_te": "చిరుధాన్యాలు వరి కంటే 70% తక్కువ నీటిని తీసుకుంటాయి మరియు కరువును తట్టుకుంటాయి."
    },
    {
        "id": "agri-12-l2", "courseId": "agri-12", "lessonNumber": 2, "duration": "25 mins",
        "title_en": "Zero-Tillage & Conservation Agriculture",
        "title_te": "దుక్కి లేని సేద్యం (జీరో ట్రిల్లేజ్) & పరిరక్షణ వ్యవసాయం",
        "summary_en": "Direct sowing with Happy Seeder to conserve soil moisture and lower diesel costs.",
        "summary_te": "హ్యాపీ సీడర్ ద్వారా నేరుగా విత్తడం వల్ల డీజిల్ ఖర్చు తగ్గడం మరియు తేమ పరిరక్షణ.",
        "content_en": "Zero-tillage involves sowing seeds directly into unploughed fields retaining previous crop residues. Using machines like Happy Seeder saves tractor fuel, preserves soil structure, and reduces soil evaporation.",
        "content_te": "దుక్కి దున్నకుండా నేరుగా పాత పంట వ్యర్థాలలోనే విత్తనాలు విత్తడం వల్ల డీజిల్ ఖర్చు ఆదా అవుతుంది మరియు నేల తేమ పెరుగుతుంది.",
        "keyPoints_en": [
            "Happy Seeder sows Wheat directly into standing Paddy stubble without burning",
            "Saves Rs. 2,500 to 3,000 per acre in tractor diesel and land preparation costs",
            "Organic residue mulch retains soil moisture during hot winds"
        ],
        "keyPoints_te": [
            "వరి వ్యర్థాలను తగలబెట్టకుండా హ్యాపీ సీడర్‌తో నేరుగా విత్తండి",
            "ఎకరాకు రూ. 2,500 నుండి 3,000 వరకు డీజిల్ ఖర్చు ఆదా అవుతుంది",
            "వ్యర్థాల పొర నేల తేమను కాపాడుతుంది"
        ],
        "tip_en": "Zero-tillage wheat sowing advances planting date by 7-10 days, preventing terminal heat stress in March.",
        "tip_te": "దుక్కి లేని సేద్యం ద్వారా 7-10 రోజులు ముందుగానే విత్తవచ్చు."
    },
    {
        "id": "agri-12-l3", "courseId": "agri-12", "lessonNumber": 3, "duration": "20 mins",
        "title_en": "Extreme Weather Mitigation (Floods & Heatwaves)",
        "title_te": "తీవ్ర వాతావరణ నివారణ (వరదలు & వడగాలులు)",
        "summary_en": "Foliar sprays of Potassium and Salicylic acid during heat stress.",
        "summary_te": "తీవ్రమైన ఎండలు ఉన్నప్పుడు పొటాషియం మరియు శాలిసిలిక్ యాసిడ్ పిచికారీ.",
        "content_en": "Sudden heatwaves during grain filling shorten crop maturity and reduce grain weight. Applying foliar sprays of 1% Potassium Nitrate helps plants maintain cell turgor and withstand thermal stress.",
        "content_te": "అనుకోకుండా వచ్చే తీవ్రమైన వడగాలులు గింజ నాణ్యతను తగ్గిస్తాయి. పొటాషియం నైట్రేట్ (1%) పిచికారీ మొక్కలకు వేడిని తట్టుకునే శక్తిని ఇస్తుంది.",
        "keyPoints_en": [
            "Foliar spray of 1% KNO3 (10g/L water) protects crops during sudden heatwaves",
            "Ensure field drainage ditches are clear before heavy cyclone warnings",
            "Provide shade nets or protective sprinkler misting for high-value crops"
        ],
        "keyPoints_te": [
            "వడగాలుల సమయంలో 1% పొటాషియం నైట్రేట్ (లీటరుకు 10 గ్రా) పిచికారీ చేయండి",
            "తుఫాను హెచ్చరికలకు ముందే కాలువలు శుభ్రం చేయండి",
            "విలువైన పంటలకు స్ప్రింక్లర్లతో నీరు చిలకరించండి"
        ],
        "tip_en": "Apply light surface irrigation before expected night frost or extreme heatwaves to moderate field micro-climate.",
        "tip_te": "వడగాలులు లేదా తీవ్రమైన చలి వచ్చే ముందు తేలికపాటి నీటిపారుదల అందించండి."
    },
    {
        "id": "agri-12-l4", "courseId": "agri-12", "lessonNumber": 4, "duration": "20 mins",
        "title_en": "Agroforestry & Carbon Farming Integration",
        "title_te": "అగ్రోఫారెస్ట్రీ (అటవీ వ్యవసాయం) & కార్బన్ ఫార్మింగ్",
        "summary_en": "Planting border trees like Teak, Subabul, or Poplar for shade, timber, and carbon credits.",
        "summary_te": "పొలం సరిహద్దుల్లో టేకు, సుబాబుల్ వంటి చెట్లను పెంచడం ద్వారా అదనపు ఆదాయం.",
        "content_en": "Agroforestry integrates fast-growing trees along field borders. Trees act as windbreaks, yield timber/fruit income, capture carbon, and enrich soil through deep root nutrient cycling.",
        "content_te": "పొలం సరిహద్దుల్లో వేగంగా పెరిగే చెట్లను నాటడం వల్ల తుఫాను ఈదురుగాలుల నుండి పంటకు రక్షణ లభించడంతో పాటు అదనపు ఆదాయం వస్తుంది.",
        "keyPoints_en": [
            "Plant Poplar, Melia Dubia, or Sandalwood along field boundaries",
            "Tree windbreaks reduce wind erosion and crop lodging during storms",
            "Generates additional long-term income alongside seasonal food crops"
        ],
        "keyPoints_te": [
            "పొలం సరిహద్దులలో శ్రీగంధం, సుబాబుల్ లేదా మలబార్ వేప చెట్లను నాటండి",
            "ఈదురుగాలుల నుండి పంట వాలిపోకుండా చెట్లు రక్షిస్తాయి",
            "సాధారణ పంటలతో పాటు దీర్ఘకాలిక ఆదాయం లభిస్తుంది"
        ],
        "tip_en": "Plant border trees along North-South lines to minimize shade competition with field crops.",
        "tip_te": "పంటకు నీడ పడకుండా చెట్లను ఉత్తర-దక్షిణ దిశలలో నాటండి."
    }
]

# Generate src/data/lessons.ts
lessons_code = '''import type { CourseLesson } from "./types";

export const AGRICULTURE_LESSONS: CourseLesson[] = [
'''

for item in lessons_data:
    kp = json.dumps(item['keyPoints_en'])
    lessons_code += f'''  {{
    id: "{item['id']}",
    courseId: "{item['courseId']}",
    lessonNumber: {item['lessonNumber']},
    duration: "{item['duration']}",
    title: "{item['title_en']}",
    summary: "{item['summary_en']}",
    content: "{item['content_en']}",
    keyPoints: {kp},
    farmingTip: "{item['tip_en']}"
  }},
'''

lessons_code += '];\n'

with open("src/data/lessons.ts", "w", encoding="utf-8") as f:
    f.write(lessons_code)

print("Created src/data/lessons.ts")

# Now collect all text strings to add to translations.ts
translation_entries_en = {}
translation_entries_te = {}

# Common UI strings
ui_map = {
    "Learning": "అభ్యసనం",
    "Agriculture Learning Hub": "వ్యవసాయ అభ్యాస కేంద్రం",
    "Learn practical farming skills, modern agricultural technologies, crop management, and sustainable farming practices.": "ప్రాక్టికల్ వ్యవసాయ నైపుణ్యాలు, ఆధునిక వ్యవసాయ సాంకేతికతలు, పంట నిర్వహణ మరియు సుస్థిర వ్యవసాయ పద్ధతులను నేర్చుకోండి.",
    "Search courses...": "కోర్సులను శోధించండి...",
    "All Courses": "అన్ని కోర్సులు",
    "Beginner": "ప్రారంభ స్థాయి",
    "Intermediate": "మధ్యస్థ స్థాయి",
    "Advanced": "ఉన్నత స్థాయి",
    "hrs": "గంటలు",
    "lessons": "పాఠాలు",
    "completed": "పూర్తయింది",
    "Start Learning": "అభ్యాసం ప్రారంభించండి",
    "Continue Learning": "అభ్యాసం కొనసాగించండి",
    "Back to Learning Hub": "అభ్యాస కేంద్రానికి తిరిగి వెళ్ళండి",
    "Course Details & Lessons": "కోర్సు వివరాలు & పాఠాలు",
    "Lesson": "పాఠం",
    "Previous Lesson": "మునుపటి పాఠం",
    "Next Lesson": "తరువాతి పాఠం",
    "Mark as Complete": "పూర్తయినట్లు గుర్తుపెట్టండి",
    "Completed ✓": "పూర్తయింది ✓",
    "Completed": "పూర్తయింది",
    "Farming Tip & Practical Action": "వ్యవసాయ చిట్కా & ప్రాయోగిక చర్య",
    "Key Field Takeaways": "ముఖ్యమైన పొలం ముఖ్యాంశాలు",
    "Overview & Guidance": "అవలోకనం & మార్గదర్శకత్వం",
    "Course Not Found": "కోర్సు కనుగొనబడలేదు",
    "The requested course could not be found or does not exist.": "అభ్యర్థించిన కోర్సు కనుగొనబడలేదు లేదా అందుబాటులో లేదు.",
    "Back to Learning": "అభ్యాసానికి తిరిగి వెళ్ళండి",
    "Overall Course Progress": "మొత్తం కోర్సు ప్రగతి",
    "Select a lesson to begin learning": "అభ్యాసాన్ని ప్రారంభించడానికి ఒక పాఠాన్ని ఎంచుకోండి",
    "PureFarm Agri Academy": "ప్యూర్ ఫామ్ అగ్రి అకాడమీ",
    "Soil Health Advisory": "సాయిల్ హెల్త్ అడ్వైజరీ",
    "Seasonal Farming Guide": "సీజనల్ ఫార్మింగ్ గైడ్",
    "Water Conservation Cell": "వాటర్ కన్సర్వేషన్ సెల్",
    "Crop Protection Lab": "క్రాప్ ప్రొటెక్షన్ ల్యాబ్",
    "Organic Farming Forum": "ఆర్గానిక్ ఫార్మింగ్ ఫోరం",
    "AgriTech Innovations": "అగ్రిటెక్ ఇన్నోవేషన్స్",
    "Agri Storage Hub": "అగ్రి స్టోరేజ్ హబ్",
    "Mandi Market Advisory": "మండీ మార్కెట్ అడ్వైజరీ",
    "Farmer Welfare Cell": "ఫార్మర్ వెల్ఫేర్ సెల్",
    "Precision Agri Institute": "ప్రిసిషన్ అగ్రి ఇన్స్టిట్యూట్",
    "Climate Resilience Network": "క్లైమేట్ రెసిలియన్స్ నెట్‌వర్క్",
    "Crop Management": "పంట నిర్వహణ",
    "Soil & Nutrients": "నేల & పోషకాలు",
    "Crop Planning": "పంట ప్రణాళిక",
    "Irrigation": "నీటిపారుదల",
    "Pest Control": "తెగుళ్ల నివారణ",
    "Organic Farming": "సేంద్రీయ వ్యవసాయం",
    "Smart Farming": "స్మార్ట్ ఫార్మింగ్",
    "Post Harvest": "కోత అనంతర నిర్వహణ",
    "Market Advisory": "మార్కెట్ అడ్వైజరీ",
    "Government Schemes": "ప్రభుత్వ పథకాలు",
    "Precision Farming": "ఖచ్చితత్వ వ్యవసాయం",
    "Climate Resilience": "వాతావరణ తట్టుకునే శక్తి"
}

for k, v in ui_map.items():
    translation_entries_en[k] = k
    translation_entries_te[k] = v

for item in lessons_data:
    translation_entries_en[item['title_en']] = item['title_en']
    translation_entries_te[item['title_en']] = item['title_te']

    translation_entries_en[item['summary_en']] = item['summary_en']
    translation_entries_te[item['summary_en']] = item['summary_te']

    translation_entries_en[item['content_en']] = item['content_en']
    translation_entries_te[item['content_en']] = item['content_te']

    translation_entries_en[item['tip_en']] = item['tip_en']
    translation_entries_te[item['tip_en']] = item['tip_te']

    for i in range(len(item['keyPoints_en'])):
        translation_entries_en[item['keyPoints_en'][i]] = item['keyPoints_en'][i]
        translation_entries_te[item['keyPoints_en'][i]] = item['keyPoints_te'][i]

print(f"Collected {len(translation_entries_en)} translation entries")

# Now read src/i18n/translations.ts and insert these entries into en and te objects
with open("src/i18n/translations.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Find en block and te block
# Structure is:
# export const translations: Record<Language, Record<string, string>> = {
#   en: {
#     ...
#   },
#   te: {
#     ...
#   }

import re

# Update en object
en_insert = ""
for k, v in sorted(translation_entries_en.items()):
    clean_k = json.dumps(k)
    clean_v = json.dumps(v)
    en_insert += f"    {clean_k}: {clean_v},\n"

te_insert = ""
for k, v in sorted(translation_entries_te.items()):
    clean_k = json.dumps(k)
    clean_v = json.dumps(v)
    te_insert += f"    {clean_k}: {clean_v},\n"

# Match `en: {` and insert right after it
content = content.replace("en: {", "en: {\n" + en_insert, 1)
# Match `te: {` and insert right after it
content = content.replace("te: {", "te: {\n" + te_insert, 1)

with open("src/i18n/translations.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully updated src/i18n/translations.ts with all lesson translations.")
