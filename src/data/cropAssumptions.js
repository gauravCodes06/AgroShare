// Default Presets and Assumptions for Module B: AI Crop Profit Advisor
export const CROP_PRESETS = [
  {
    id: "sugarcane",
    name: "Sugarcane",
    hindiName: "गन्ना",
    defaultUnit: "quintal",
    icon: "🎋",
    rawPricePerUnit: 340, // ₹340 per quintal (₹3.4/kg) - FRP benchmark
    rawCostPerUnit: 190,  // harvest + farm input cost per quintal
    defaultQuantity: 50,  // 50 quintals = 5000 kg
    products: [
      {
        id: "jaggery-block",
        name: "Chemical-Free Solid Jaggery (Gur)",
        yieldPercent: 11.5, // 100 kg cane gives ~11.5 kg jaggery
        processedUnit: "kg",
        processedSellingPrice: 85, // ₹85 per kg retail/wholesale bulk
        processingCostPerRawUnit: 70, // crushing & wood boiling cost per quintal
        packagingCostPerProcessedUnit: 4, // eco paper wrapping/box per kg
        transportCostPerProcessedUnit: 3,
        equipmentNeeded: "Cane Crusher & Jaggery Boiling Pan Unit",
        shelfLife: "12 Months",
        demandLevel: "Very High (Festivals & Health Conscious)",
        actionSteps: [
          {
            step: 1,
            title: "Harvest at Peak Maturity",
            desc: "Ensure Brix reading above 19° to maximize sugar recovery ratio before crushing."
          },
          {
            step: 2,
            title: "Crush within 24 Hours",
            desc: "Rent or use nearby village sugarcane crusher unit to prevent juice inversion and acidity."
          },
          {
            step: 3,
            title: "Traditional Clarification",
            desc: "Use natural vegetative mucilage (bhendi/wild okra juice) instead of toxic hydrosulphite."
          },
          {
            step: 4,
            title: "Airtight Eco-Packaging",
            desc: "Pack in 1kg blocks with butter paper to prevent moisture absorption during monsoon."
          }
        ]
      },
      {
        id: "jaggery-powder",
        name: "Granular Organic Jaggery Powder",
        yieldPercent: 10.0,
        processedUnit: "kg",
        processedSellingPrice: 110,
        processingCostPerRawUnit: 85,
        packagingCostPerProcessedUnit: 6,
        transportCostPerProcessedUnit: 3,
        equipmentNeeded: "Pulverizer & Stainless Steel Sieve Mesh",
        shelfLife: "18 Months",
        demandLevel: "High (Urban Supermarkets & Tea Stalls)",
        actionSteps: [
          { step: 1, title: "Boil to Higher Concentration", desc: "Concentrate strike temperature to 118°C for crystallisation." },
          { step: 2, title: "Cooling & Granulation", desc: "Rub vigorously with wooden paddles during cooling phase." },
          { step: 3, title: "Sieving", desc: "Filter through 16-mesh SS sieve for uniform granular consistency." },
          { step: 4, title: "Zip-lock Pouching", desc: "Seal in 500g pouches with nutritional labelling for premium retail." }
        ]
      }
    ]
  },
  {
    id: "tomato",
    name: "Tomato",
    hindiName: "टमाटर",
    defaultUnit: "quintal",
    icon: "🍅",
    rawPricePerUnit: 1400, // ₹14/kg raw in glut season
    rawCostPerUnit: 800,
    defaultQuantity: 20, // 20 quintals = 2000 kg
    products: [
      {
        id: "tomato-puree",
        name: "Concentrated Tomato Puree (24° Brix)",
        yieldPercent: 35, // 100 kg tomatoes yield ~35 kg puree
        processedUnit: "kg",
        processedSellingPrice: 95, // ₹95/kg
        processingCostPerRawUnit: 350,
        packagingCostPerProcessedUnit: 8,
        transportCostPerProcessedUnit: 4,
        equipmentNeeded: "Pulper Machine & Steam Jacketed Kettle",
        shelfLife: "9 Months",
        demandLevel: "Consistent (Restaurants & Urban Households)",
        actionSteps: [
          { step: 1, title: "Sorting & Blanching", desc: "Wash thoroughly and blanch at 85°C for 2 minutes to loosen skins." },
          { step: 2, title: "Mechanical De-seeding", desc: "Run through 1.2 mm mesh pulper to extract smooth seedless pulp." },
          { step: 3, title: "Concentration & Acidity Check", desc: "Evaporate excess water down to 24° Brix; add 0.2% citric acid." },
          { step: 4, title: "Hot Filling & Capping", desc: "Fill at 88°C into sterilized glass jars or stand-up spouted pouches." }
        ]
      },
      {
        id: "sun-dried-tomatoes",
        name: "Solar-Dried Italian-Style Tomato Halves",
        yieldPercent: 8, // 100 kg fresh yields ~8 kg dehydrated
        processedUnit: "kg",
        processedSellingPrice: 450,
        processingCostPerRawUnit: 250,
        packagingCostPerProcessedUnit: 12,
        transportCostPerProcessedUnit: 5,
        equipmentNeeded: "Polyhouse Solar Tunnel Dryer",
        shelfLife: "12 Months",
        demandLevel: "Niche Premium (Gourmet Cafes & Export)",
        actionSteps: [
          { step: 1, title: "Select Meaty Cultivars", desc: "Use firm Roma or Vaishali varieties with high dry-matter content." },
          { step: 2, title: "Halving & Mild Salting", desc: "Cut longitudinally and sprinkle 1.5% rock salt to draw moisture." },
          { step: 3, title: "Solar Dryer Loading", desc: "Spread on food-grade nylon racks at 55°C for 36 hours." },
          { step: 4, title: "Vacuum Sealed Packaging", desc: "Pack in 250g vacuum pouches with an oxygen absorber sachet." }
        ]
      }
    ]
  },
  {
    id: "wheat",
    name: "Wheat",
    hindiName: "गेहूं",
    defaultUnit: "quintal",
    icon: "🌾",
    rawPricePerUnit: 2500, // ₹25/kg MSP/market rate
    rawCostPerUnit: 1400,
    defaultQuantity: 30, // 30 quintals
    products: [
      {
        id: "stoneground-atta",
        name: "Stone-Ground Chakki Whole Wheat Atta",
        yieldPercent: 96, // 100 kg wheat gives 96 kg full grain flour with bran
        processedUnit: "kg",
        processedSellingPrice: 48, // ₹48/kg retail
        processingCostPerRawUnit: 350,
        packagingCostPerProcessedUnit: 5,
        transportCostPerProcessedUnit: 3,
        equipmentNeeded: "Traditional Slow RPM Stone Chakki (Emery Stone)",
        shelfLife: "4 Months",
        demandLevel: "Everyday Staple (Premium Wellness Segment)",
        actionSteps: [
          { step: 1, title: "Triple Destoning & Air Cleaning", desc: "Pass harvested grain through vibratory de-stoner and air aspirator." },
          { step: 2, title: "Conditioning & Rest", desc: "Light moisture tempering (1.5%) for 8 hours ensures even bran flakes." },
          { step: 3, title: "Low-Temperature Milling", desc: "Grind between slow stone burrs below 42°C to prevent heat damage to nutrients." },
          { step: 4, title: "Breathable Cloth / Kraft Packaging", desc: "Pack in 5kg branded kraft paper bags with inner moisture barrier." }
        ]
      },
      {
        id: "dalia-porridge",
        name: "Coarse Roasted Broken Wheat (Dalia)",
        yieldPercent: 92,
        processedUnit: "kg",
        processedSellingPrice: 62,
        processingCostPerRawUnit: 400,
        packagingCostPerProcessedUnit: 5,
        transportCostPerProcessedUnit: 3,
        equipmentNeeded: "Grain Cracker & Roasting Drum",
        shelfLife: "8 Months",
        demandLevel: "High (Breakfast & Diabetic Diet Demand)",
        actionSteps: [
          { step: 1, title: "Coarse Cracking", desc: "Adjust burr spacing to crack grains into 4-6 pieces without making flour." },
          { step: 2, title: "Fine Bran Winnowing", desc: "Blow away superfine dust and retain high-fiber semolina grit." },
          { step: 3, title: "Light Dry Roasting", desc: "Roast evenly for 6 minutes to enhance nutty aroma and shelf life." },
          { step: 4, title: "Pouch Packaging", desc: "Seal in nitrogen-flushed 1kg transparent front pouches." }
        ]
      }
    ]
  },
  {
    id: "turmeric",
    name: "Turmeric",
    hindiName: "हल्दी",
    defaultUnit: "quintal",
    icon: "🟡",
    rawPricePerUnit: 6800, // ₹68/kg fresh rhizome
    rawCostPerUnit: 3600,
    defaultQuantity: 15,
    products: [
      {
        id: "curcumin-powder",
        name: "Cured & Stone-Ground High-Curcumin Turmeric Powder",
        yieldPercent: 22, // 100 kg raw yields ~22 kg dry cured powder
        processedUnit: "kg",
        processedSellingPrice: 320, // ₹320/kg
        processingCostPerRawUnit: 800,
        packagingCostPerProcessedUnit: 10,
        transportCostPerProcessedUnit: 5,
        equipmentNeeded: "Turmeric Boiling Drum, Solar Dryer, & Micro-Pulverizer",
        shelfLife: "24 Months",
        demandLevel: "Very High Domestic & Export Demand",
        actionSteps: [
          { step: 1, title: "Boiling in Perforated Drums", desc: "Cook fingers in water with lime for 45 minutes until white froth emerges." },
          { step: 2, title: "Sun Drying & Polishing", desc: "Dry on clean raised tarps for 12 days; polish in drum polisher to remove rough skin." },
          { step: 3, title: "Cold Pulverization", desc: "Grind in air-cooled pin-mill pulverizer to 100 mesh fineness." },
          { step: 4, title: "UV-Barrier Packaging", desc: "Pack in foil-lined zip pouches to preserve curcumin from sunlight fading." }
        ]
      }
    ]
  },
  {
    id: "soybean",
    name: "Soybean",
    hindiName: "सोयाबीन",
    defaultUnit: "quintal",
    icon: "🫘",
    rawPricePerUnit: 4400, // ₹44/kg
    rawCostPerUnit: 2600,
    defaultQuantity: 25,
    products: [
      {
        id: "soya-paneer",
        name: "Fresh Soya Milk & Tofu (Soya Paneer)",
        yieldPercent: 180, // 100 kg dry beans produce ~180 kg fresh firm tofu!
        processedUnit: "kg",
        processedSellingPrice: 120, // ₹120/kg retail
        processingCostPerRawUnit: 3200, // coagulant, power, water, labor
        packagingCostPerProcessedUnit: 8,
        transportCostPerProcessedUnit: 6, // cold chain / local delivery
        equipmentNeeded: "Soy Milk Extraction Machine & Pneumatic Tofu Press",
        shelfLife: "20 Days (Refrigerated) or 6 Months (Vacuum brine)",
        demandLevel: "Exploding (Vegan, Fitness & Dairy Alternative)",
        actionSteps: [
          { step: 1, title: "De-hulling & Soaking", desc: "Soak clean beans for 6 hours; remove beany off-flavor using hot water grind." },
          { step: 2, title: "Cooking & Extraction", desc: "Boil slurry at 100°C for 10 minutes and separate high-protein soy milk." },
          { step: 3, title: "Coagulation", desc: "Add natural food-grade Nigari or Calcium Sulfate to curdle into firm curds." },
          { step: 4, title: "Pressing & Block Packaging", desc: "Press out whey under 3 kg/cm² pressure, slice into 200g blocks, and vacuum seal." }
        ]
      }
    ]
  }
];

/**
 * Transparent calculation engine for Module B
 */
export function calculateCropProfit(input) {
  const {
    rawQuantity, // in quintals
    rawPricePerUnit, // in ₹/quintal
    rawCostPerUnit,  // in ₹/quintal
    productPreset,   // selected product object
    overrideYield,   // optional override
    overrideProcessedPrice, // optional override
    overrideProcessingCost, // per quintal
    overridePackagingCost,  // per processed unit
    overrideTransportCost   // per processed unit
  } = input;

  const yieldPercent = overrideYield ?? productPreset.yieldPercent;
  const processedSellingPrice = overrideProcessedPrice ?? productPreset.processedSellingPrice;
  const processingCostPerRaw = overrideProcessingCost ?? productPreset.processingCostPerRawUnit;
  const packagingCost = overridePackagingCost ?? productPreset.packagingCostPerProcessedUnit;
  const transportCost = overrideTransportCost ?? productPreset.transportCostPerProcessedUnit;

  // 1. Raw Scenario
  const rawRevenue = rawQuantity * rawPricePerUnit;
  const rawProductionCost = rawQuantity * rawCostPerUnit;
  const rawNetProfit = rawRevenue - rawProductionCost;

  // 2. Processed Scenario
  // 1 Quintal = 100 kg
  const rawQuantityInKg = rawQuantity * 100;
  const processedYieldQty = (rawQuantityInKg * (yieldPercent / 100)); // in kg or units

  const processedRevenue = processedYieldQty * processedSellingPrice;
  const totalProcessingExpense = rawQuantity * processingCostPerRaw;
  const totalPackagingExpense = processedYieldQty * packagingCost;
  const totalTransportExpense = processedYieldQty * transportCost;
  const totalValueAddCost = totalProcessingExpense + totalPackagingExpense + totalTransportExpense;

  const processedNetProfit = processedRevenue - rawProductionCost - totalValueAddCost;

  // 3. Comparison Metrics
  const additionalProfit = processedNetProfit - rawNetProfit;
  const profitUpliftPercent = rawNetProfit > 0 
    ? Math.round((additionalProfit / rawNetProfit) * 100) 
    : 100;
  
  const isRecommended = additionalProfit > 0;

  return {
    rawQuantity,
    rawPricePerUnit,
    rawProductionCost,
    rawRevenue,
    rawNetProfit,

    processedYieldQty: Math.round(processedYieldQty),
    processedUnit: productPreset.processedUnit,
    processedSellingPrice,
    processedRevenue,
    totalProcessingExpense,
    totalPackagingExpense,
    totalTransportExpense,
    totalValueAddCost,
    processedNetProfit,

    additionalProfit,
    profitUpliftPercent,
    isRecommended,
    actionSteps: productPreset.actionSteps,
    equipmentNeeded: productPreset.equipmentNeeded,
    shelfLife: productPreset.shelfLife,
    demandLevel: productPreset.demandLevel
  };
}
