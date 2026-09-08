import json

with open('product_list.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

mappings = {}

# We have specific Unsplash/Wiki URLs for specific crop types
base_images = {
    'Paddy': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Rice_seed.jpg',
    'Maize': 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Corn_seeds.jpg',
    'Onion': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Onion_seeds.jpg',
    'Soybean': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Soybean_seeds.jpg',
    'Turmeric': 'https://upload.wikimedia.org/wikipedia/commons/4/46/Turmeric_rhizome.jpg',
    'Papaya': 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Papaya_seeds.jpg',
    'Tomato': 'https://upload.wikimedia.org/wikipedia/commons/5/52/Tomato_seeds.jpg',
    'Chilli': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Chili_seeds.jpg',
    'Cucumber': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Cucumber_seeds.jpg',
    'Carrot': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Carrot_seeds.jpg',
    'Cabbage': 'https://upload.wikimedia.org/wikipedia/commons/4/40/Cabbage_seeds.jpg',
    'Cauliflower': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Cauliflower_seeds.jpg',
    'Bottle Gourd': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Bottle_gourd_seeds.jpg',
    'Bitter Gourd': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Bitter_gourd_seeds.jpg',
    'Watermelon': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Watermelon_seeds.jpg',
    'Muskmelon': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Muskmelon_seeds.jpg',
    'Spinach': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Spinach_seeds.jpg',
    'Coriander': 'https://upload.wikimedia.org/wikipedia/commons/5/55/Coriander_seeds.jpg',
    'Fenugreek': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Fenugreek_seeds.jpg',
    'Barley': 'https://upload.wikimedia.org/wikipedia/commons/8/88/Barley_seeds.jpg',
    'Sorghum': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Sorghum_seeds.jpg',
    'Finger Millet': 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Finger_millet_seeds.jpg',
    'Sesame': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Sesame_seeds.jpg',
    'Castor': 'https://upload.wikimedia.org/wikipedia/commons/d/de/Castor_beans.jpg',
    'Lentil': 'https://upload.wikimedia.org/wikipedia/commons/9/94/Lentil_seeds.jpg',
    'Field Pea': 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Pea_seeds.jpg',
    'Berseem': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Berseem_seeds.jpg',
    'Napier': 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Napier_grass.jpg',
    'Marigold': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Marigold_seeds.jpg',
    'Ginger': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Ginger_rhizome.jpg',
    'Garlic': 'https://upload.wikimedia.org/wikipedia/commons/9/94/Garlic_cloves.jpg',
    'Banana': 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Banana_tissue_culture.jpg',
    'Guava': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Guava_plant.jpg',
    'Mango': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Mango_plant.jpg',
    'Drumstick': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Moringa_seeds.jpg',
    'Curry Leaf': 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Curry_leaf_plant.jpg',
    'Wheat': 'https://upload.wikimedia.org/wikipedia/commons/1/14/Wheat_seeds.jpg',
    'Cotton': 'https://upload.wikimedia.org/wikipedia/commons/3/31/Cotton_seeds.jpg',
    'Groundnut': 'https://upload.wikimedia.org/wikipedia/commons/6/61/Peanut_seeds.jpg',
    'Mustard': 'https://upload.wikimedia.org/wikipedia/commons/6/65/Mustard_seeds.jpg',
    'Gram': 'https://upload.wikimedia.org/wikipedia/commons/8/82/Chickpea_seeds.jpg',
    'Pigeon Pea': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Pigeon_pea_seeds.jpg',
    'Urea': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Urea_fertilizer.jpg',
    'DAP': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/DAP_fertilizer.jpg',
    'MOP': 'https://upload.wikimedia.org/wikipedia/commons/3/3c/MOP_fertilizer.jpg',
    'NPK': 'https://upload.wikimedia.org/wikipedia/commons/c/c9/NPK_fertilizer.jpg',
    'Phosphate': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Phosphate_fertilizer.jpg',
    'Zinc': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Zinc_sulfate.jpg',
    'Ammonium': 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Ammonium_sulfate.jpg',
    'Calcium Nitrate': 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Calcium_nitrate.jpg',
    'Potassium Schoenite': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Potassium_fertilizer.jpg',
    'Vermicompost': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Vermicompost.jpg',
    'Neem Cake': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Neem_cake.jpg',
    'Bone Meal': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Bone_meal.jpg',
    'Cow Dung': 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Cow_dung_manure.jpg',
    'Rhizobium': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Biofertilizer.jpg',
    'Azotobacter': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Biofertilizer.jpg',
    'PSB': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Biofertilizer.jpg',
    'Mycorrhiza': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Mycorrhiza.jpg',
    'Trichoderma': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Biofungicide.jpg',
    'Pseudomonas': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Biofungicide.jpg',
    'Humic Acid': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Humic_acid.jpg',
    'Seaweed': 'https://upload.wikimedia.org/wikipedia/commons/0/07/Seaweed_extract.jpg',
    'Micronutrient': 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Micronutrient_fertilizer.jpg',
    'Boron': 'https://upload.wikimedia.org/wikipedia/commons/5/58/Boron_powder.jpg',
    'Ferrous Sulphate': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Ferrous_sulfate.jpg',
    'Gypsum': 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Gypsum_fertilizer.jpg',
    'Sulphur': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Sulfur_powder.jpg',
    'Consortia': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Biofertilizer.jpg',
    'Nano': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Liquid_fertilizer.jpg',
    'Humate': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Humic_acid.jpg',
    'Panchagavya': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Liquid_organic.jpg',
    'Knapsack': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Knapsack_sprayer.jpg',
    'Battery Sprayer': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Knapsack_sprayer.jpg',
    'Sprayer': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Knapsack_sprayer.jpg',
    'Sickle': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Sickle.jpg',
    'Hoe': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Garden_hoe.jpg',
    'Shovel': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Shovel.jpg',
    'Spade': 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Spade.jpg',
    'Khurpi': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Trowel.jpg',
    'Rake': 'https://upload.wikimedia.org/wikipedia/commons/1/14/Garden_rake.jpg',
    'Pruning': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Pruning_shears.jpg',
    'Secateurs': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Pruning_shears.jpg',
    'Axe': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Axe.jpg',
    'Machete': 'https://upload.wikimedia.org/wikipedia/commons/2/21/Machete.jpg',
    'Tiller': 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Rototiller.jpg',
    'Weeder': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Weeder.jpg',
    'Brush Cutter': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Brush_cutter.jpg',
    'Chaff Cutter': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Chaff_cutter.jpg',
    'Earth Auger': 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Earth_auger.jpg',
    'Water Pump': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Water_pump.jpg',
    'Drip': 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Drip_irrigation.jpg',
    'Sprinkler': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Sprinkler.jpg',
    'Mulch': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Plastic_mulch.jpg',
    'Shade Net': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Shade_net.jpg',
    'Tarpaulin': 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Tarpaulin.jpg',
    'Gunny': 'https://upload.wikimedia.org/wikipedia/commons/1/18/Gunny_bags.jpg',
    'Silo': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Grain_silo.jpg',
    'Weighing': 'https://upload.wikimedia.org/wikipedia/commons/5/52/Weighing_scale.jpg',
    'Chlorpyrifos': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Pesticide_bottle.jpg',
    'Imidacloprid': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Pesticide_bottle.jpg',
    'Thiamethoxam': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Pesticide_bottle.jpg',
    'Lambda': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Pesticide_bottle.jpg',
    'Quinalphos': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Pesticide_bottle.jpg',
    'Profenofos': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Pesticide_bottle.jpg',
    'Acetamiprid': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Pesticide_bottle.jpg',
    'Mancozeb': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Fungicide.jpg',
    'Carbendazim': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Fungicide.jpg',
    'Hexaconazole': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Fungicide.jpg',
    'Propiconazole': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Fungicide.jpg',
    'Tebuconazole': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Fungicide.jpg',
    'Azoxystrobin': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Fungicide.jpg',
    'Glyphosate': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Herbicide.jpg',
    'Paraquat': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Herbicide.jpg',
    'Pendimethalin': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Herbicide.jpg',
    'Atrazine': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Herbicide.jpg',
    '2,4-D': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Herbicide.jpg',
    'Metsulfuron': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Herbicide.jpg',
    'Pretilachlor': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Herbicide.jpg',
    'Neem Oil': 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Neem_oil.jpg',
    'Beauveria': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Pesticide_bottle.jpg',
    'Bacillus': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Pesticide_bottle.jpg',
    'Verticillium': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Pesticide_bottle.jpg',
    'Pheromone': 'https://upload.wikimedia.org/wikipedia/commons/0/07/Pheromone_trap.jpg',
    'Sticky': 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Sticky_trap.jpg',
    'Fruit Fly': 'https://upload.wikimedia.org/wikipedia/commons/0/07/Pheromone_trap.jpg',
    'Light Trap': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Light_trap.jpg'
}

for p in products:
    name = p['name']
    matched = False
    for k, v in base_images.items():
        if k.lower() in name.lower():
            mappings[name] = v
            matched = True
            break
    if not matched:
        # Generic by category
        if p['category'] == 'seeds':
            mappings[name] = 'https://upload.wikimedia.org/wikipedia/commons/9/93/Various_seeds.jpg'
        elif p['category'] == 'fertilizers':
            mappings[name] = 'https://upload.wikimedia.org/wikipedia/commons/a/af/Fertilizer_bags.jpg'
        elif p['category'] == 'tools':
            mappings[name] = 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Farming_tools.jpg'
        elif p['category'] == 'pesticides':
            mappings[name] = 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Pesticide_bottle.jpg'
        else:
            mappings[name] = 'https://upload.wikimedia.org/wikipedia/commons/9/93/Various_seeds.jpg'

# Now we construct the IMAGE_MAPPINGS code for products.ts
ts_code = "export const IMAGE_MAPPINGS: Record<string, string> = {\n"
for k, v in mappings.items():
    ts_code += f'  "{k}": "{v}",\n'
ts_code += "};\n"

with open('mappings_code.txt', 'w', encoding='utf-8') as f:
    f.write(ts_code)

print("Generated mapping for all products!")
