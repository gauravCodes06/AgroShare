// Seed Equipment Data for Farm2Value AgroShare
export const INITIAL_EQUIPMENT = [
  {
    id: "eq-1",
    name: "Mahindra 575 DI Tractor (45 HP)",
    category: "Tractors",
    ownerName: "Balasaheb Patil",
    phone: "+91 98220 14321",
    village: "Baramati",
    district: "Pune",
    state: "Maharashtra",
    pricePerDay: 1200,
    rating: 4.9,
    reviewsCount: 38,
    status: "Available",
    power: "45 HP",
    fuelType: "Diesel",
    year: "2023",
    description: "Well-maintained 45 HP dual-clutch tractor, perfect for ploughing, rotavator operations, and heavy haulage. Comes with clean oil service and operator available on request.",
    includedTerms: [
      "Fuel to be provided by renter",
      "Valid driving license required",
      "Clean return expected",
      "Operator available for ₹300/day extra"
    ],
    imageUrl: "https://images.unsplash.com/photo-1780332514648-516e9dad94c6?auto=format&fit=crop&w=800&q=80",
    specs: {
      engine: "4 Cylinder 2730 cc",
      liftingCapacity: "1600 kg",
      ptoHp: "39.8 HP"
    }
  },
  {
    id: "eq-2",
    name: "John Deere 5050D Tractor (50 HP)",
    category: "Tractors",
    ownerName: "Dnyaneshwar Shinde",
    phone: "+91 94231 87654",
    village: "Niphad",
    district: "Nashik",
    state: "Maharashtra",
    pricePerDay: 1500,
    rating: 4.8,
    reviewsCount: 29,
    status: "Available",
    power: "50 HP",
    fuelType: "Diesel",
    year: "2024",
    description: "High performance 50 HP power steering tractor with dual PTO and heavy-duty front axle. Ideal for deep tillage, rotavator, and laser levelling.",
    includedTerms: [
      "Daily usage limit: 10 engine hours",
      "Minor puncture repairs covered by owner",
      "Immediate replacement in case of mechanical fault"
    ],
    imageUrl: "https://images.unsplash.com/photo-1527847263472-aa5338d178b8?auto=format&fit=crop&w=800&q=80",
    specs: {
      engine: "3 Cylinder Turbocharged",
      liftingCapacity: "1800 kg",
      ptoHp: "42.5 HP"
    }
  },
  {
    id: "eq-3",
    name: "Shaktiman Regular Plus Rotavator (6 Feet)",
    category: "Rotavators",
    ownerName: "Sambhaji Kadam",
    phone: "+91 97654 32109",
    village: "Karad",
    district: "Satara",
    state: "Maharashtra",
    pricePerDay: 650,
    rating: 4.9,
    reviewsCount: 44,
    status: "Available",
    power: "Requires 40+ HP Tractor",
    fuelType: "PTO Driven",
    year: "2023",
    description: "Heavy duty 48 L-type blade rotavator. Produces ultra-fine soil tilth for sugarcane, soybean, and onion seedbeds in a single pass.",
    includedTerms: [
      "Greased and ready to hitch",
      "PTO shaft included",
      "Safety cover must remain intact"
    ],
    imageUrl: "https://images.unsplash.com/photo-1774351923106-efc3173ec4ad?auto=format&fit=crop&w=800&q=80",
    specs: {
      workingWidth: "180 cm (6 ft)",
      bladesCount: "48 L-Type Boron Steel",
      gearbox: "Multi-speed Heavy Duty"
    }
  },
  {
    id: "eq-4",
    name: "New Holland TC5.30 Multicrop Combine Harvester",
    category: "Harvesters",
    ownerName: "Vikram Gaikwad",
    phone: "+91 98812 34567",
    village: "Daund",
    district: "Pune",
    state: "Maharashtra",
    pricePerDay: 4800,
    rating: 4.7,
    reviewsCount: 22,
    status: "Available",
    power: "130 HP",
    fuelType: "Diesel",
    year: "2022",
    description: "Self-propelled multi-crop combine harvester equipped with specialized cutter bars for wheat, soybean, gram, and paddy. High throughput with minimal grain loss.",
    includedTerms: [
      "Expert driver and technician included",
      "Charges per acre or per day",
      "Grain unloader truck coordination available"
    ],
    imageUrl: "https://images.unsplash.com/photo-1716445867588-105a60770e1d?auto=format&fit=crop&w=800&q=80",
    specs: {
      cutterBarWidth: "14 Feet",
      grainTankCapacity: "3000 Litres",
      unloadingSpeed: "60 L/sec"
    }
  },
  {
    id: "eq-5",
    name: "National 9-Tyne Automatic Seed cum Fertilizer Drill",
    category: "Seed drills",
    ownerName: "Anand Deshmukh",
    phone: "+91 99234 56789",
    village: "Latur Rural",
    district: "Latur",
    state: "Maharashtra",
    pricePerDay: 500,
    rating: 4.8,
    reviewsCount: 19,
    status: "Available",
    power: "Requires 35+ HP",
    fuelType: "Tractor Attachment",
    year: "2023",
    description: "Precision metering mechanism for soybean, wheat, chickpea, and groundnut. Places seed and fertilizer at uniform depth, saving 25% seed wastage.",
    includedTerms: [
      "Calibrated seed cups included",
      "Depth adjustment wheels in place",
      "Free calibration assistance over call"
    ],
    imageUrl: "https://images.unsplash.com/photo-1787048607799-a205a6749a50?auto=format&fit=crop&w=800&q=80",
    specs: {
      rows: "9 Rows",
      boxCapacity: "50 kg Seed + 50 kg Fertilizer",
      rowSpacing: "Adjustable 7 to 9 inches"
    }
  },
  {
    id: "eq-6",
    name: "ASPEE HTP Tractor-Mounted Boom Sprayer (400L)",
    category: "Sprayers",
    ownerName: "Kishor Wagh",
    phone: "+91 98901 23456",
    village: "Pimpalgaon",
    district: "Nashik",
    state: "Maharashtra",
    pricePerDay: 750,
    rating: 4.9,
    reviewsCount: 31,
    status: "Available",
    power: "PTO Mounted",
    fuelType: "Attachment",
    year: "2024",
    description: "400-litre UV stabilized poly tank with 28-nozzle folding boom. Provides uniform micron misting across 30-feet spray swath for grapes, vegetables, and cotton.",
    includedTerms: [
      "Triple action brass nozzles",
      "50-meter high-pressure hose pipe included",
      "Flush clean before returning"
    ],
    imageUrl: "https://images.unsplash.com/photo-1755931359594-852c73c6609c?auto=format&fit=crop&w=800&q=80",
    specs: {
      tankCapacity: "400 Litres",
      boomLength: "30 Feet (Foldable)",
      pumpPressure: "40 kg/cm²"
    }
  },
  {
    id: "eq-7",
    name: "Lemken 2-Furrow Reversible MB Plough",
    category: "Ploughs and other implements",
    ownerName: "Santosh Gite",
    phone: "+91 97632 11223",
    village: "Sangamner",
    district: "Ahmednagar",
    state: "Maharashtra",
    pricePerDay: 550,
    rating: 4.8,
    reviewsCount: 26,
    status: "Available",
    power: "Requires 45+ HP",
    fuelType: "Hydraulic Reversible",
    year: "2023",
    description: "Hydraulic reversible mouldboard plough for deep tillage and soil inversion. Buries weed residue, breaks hardpan, and improves soil moisture retention.",
    includedTerms: [
      "Boron steel share points in sharp condition",
      "Hydraulic hose connects to standard tractor couplings",
      "Inspect bolts before operation"
    ],
    imageUrl: "https://images.unsplash.com/photo-1660391029076-00aebf4ffd96?auto=format&fit=crop&w=800&q=80",
    specs: {
      furrows: "2 Bottom Reversible",
      tillageDepth: "12 to 14 inches",
      weight: "380 kg"
    }
  },
  {
    id: "eq-8",
    name: "Solis 5015 4WD Heavy Tractor (50 HP)",
    category: "Tractors",
    ownerName: "Prataprao Jadhav",
    phone: "+91 98223 99887",
    village: "Phaltan",
    district: "Satara",
    state: "Maharashtra",
    pricePerDay: 1650,
    rating: 4.9,
    reviewsCount: 35,
    status: "Available",
    power: "50 HP 4WD",
    fuelType: "Diesel",
    year: "2024",
    description: "4-Wheel Drive powerhouse built for muddy paddy puddling, wet black cotton soil, and heavy subsoiler implements. Unbeatable traction and fuel efficiency.",
    includedTerms: [
      "4WD engaged transmission",
      "GPS tracking enabled for security",
      "Prompt on-site support if required"
    ],
    imageUrl: "https://images.unsplash.com/photo-1614811840666-3ceed1eb392b?auto=format&fit=crop&w=800&q=80",
    specs: {
      drive: "4WD Four Wheel Drive",
      liftingCapacity: "2000 kg",
      gears: "12 Forward + 12 Reverse Shuttle"
    }
  }
];

export const EQUIPMENT_CATEGORIES = [
  "All",
  "Tractors",
  "Harvesters",
  "Rotavators",
  "Seed drills",
  "Sprayers",
  "Ploughs and other implements"
];
