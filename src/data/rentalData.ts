import { BusinessConfig, RentalAssetUnit } from '../types';

export const CONFIRMED_BUSINESS_CONFIG: BusinessConfig = {
  businessName: 'Tobago Healthcare Equipment & Supplies',
  email: 'tobagohealcare@gmail.com',
  phone: '+1-868-495-9748',
  whatsAppDigits: '18687133859',
  location: 'Burnett Hill, Scarborough, Tobago, Trinidad and Tobago',
  directions: 'Next to Sports and Games',
  serviceArea: 'Tobago and Trinidad and Tobago',
};

export interface RentalCategoryInfo {
  id: 'Hospital beds' | 'Wheelchairs' | 'Oxygen concentrators' | 'Oxygen cylinders';
  title: string;
  shortDescription: string;
  detailedOverview: string;
  commonUses: string[];
  safetyDirectives: string[];
  fulfilmentNotes: string;
  image: string;
}

export const RENTAL_CATEGORIES: RentalCategoryInfo[] = [
  {
    id: 'Hospital beds',
    title: 'Hospital Beds (Semi-Electric & Full-Electric)',
    shortDescription: 'Adjustable home and clinical care beds supporting head, knee, and elevation adjustments with safety side rails.',
    detailedOverview: 'Engineered for patient recovery, comfort, and caregiver ease. Features motorized positioning, dual locking castors, and emergency manual crank overrides. Available with compatible therapeutic pressure-relief mattress overlays.',
    commonUses: [
      'Post-surgical convalescence and mobility recovery',
      'Long-term home care for bed-bound individuals',
      'Palliative and recuperative care support',
    ],
    safetyDirectives: [
      'Must be placed on level flooring away from doorways.',
      'Side rails must be inspected and locked when patient is resting unattended.',
      'Electrical connection requires grounded 110V supply.',
    ],
    fulfilmentNotes: 'Delivery and collection feasibility is assessed based on building access, stairs, and technician availability. Contact us to confirm arrangements.',
    image: '/src/assets/images/wheelchair_mobility_1791914619247.jpg',
  },
  {
    id: 'Wheelchairs',
    title: 'Wheelchairs (Standard & Ergonomic Transport)',
    shortDescription: 'Heavy-duty and lightweight folding wheelchairs with swing-away footrests, companion brakes, and puncture-proof wheels.',
    detailedOverview: 'Versatile mobility equipment designed for both self-propelled and attendant-assisted transit. Easily folds for vehicle boot transport between home, clinic appointments, or ferry/airport connections.',
    commonUses: [
      'Temporary post-injury or fracture rehabilitation',
      'Travel assistance across Tobago or inter-island transfers',
      'Daily personal mobility support',
    ],
    safetyDirectives: [
      'Always engage parking wheel brakes before seating or dismounting.',
      'Check footrest clearance before navigating ramps or thresholds.',
    ],
    fulfilmentNotes: 'Available for convenient collection at Burnett Hill, Scarborough (next to Sports and Games), or coordinated delivery subject to scheduling.',
    image: '/src/assets/images/wheelchair_mobility_1791914619247.jpg',
  },
  {
    id: 'Oxygen concentrators',
    title: 'Oxygen Concentrators (Stationary & Portable)',
    shortDescription: 'Medical-grade continuous and pulse-flow oxygen concentrators delivering filtered oxygen from room air without tanks.',
    detailedOverview: 'Electric oxygen generation systems providing reliable supplemental oxygen for prescribed patient regimens. Equipped with high/low pressure alarms, visual purity sensors, and quiet compressor operation.',
    commonUses: [
      'Chronic obstructive pulmonary disease (COPD) management',
      'Respiratory convalescence under physician prescription',
      'Home respiratory supplemental therapy',
    ],
    safetyDirectives: [
      'CLINICAL DIRECTIVE: Flow rate settings (litres per minute) must strictly follow the written instruction of the patient’s licensed physician.',
      'Strictly prohibition: Keep at least 10 feet away from open flames, smoking, gas stoves, and flammable oils.',
      'Store in well-ventilated areas; do not enclose in closets or drape fabrics over intake filters.',
      'Tobago Healthcare Equipment & Supplies does not prescribe flow rates or provide clinical respiratory therapy advice.',
    ],
    fulfilmentNotes: 'Thorough sanitization and operational diagnostic test performed before every rental release. Filter accessories and tubing provided clean and sealed.',
    image: '/src/assets/images/bp_monitor_diagnostic_1791914621309.jpg',
  },
  {
    id: 'Oxygen cylinders',
    title: 'Oxygen Cylinders & Regulators',
    shortDescription: 'Compressed medical oxygen cylinders with certified pressure regulators, flowmeters, and cylinder stands or trolleys.',
    detailedOverview: 'Standard medical oxygen cylinders providing portable or backup oxygen delivery. Fitted with calibrated medical regulators, pressure gauges, and cylinder security rings.',
    commonUses: [
      'Transit oxygen during transport to medical facilities',
      'Emergency standby respiratory support',
      'Short-duration mobile travel requirements',
    ],
    safetyDirectives: [
      'CLINICAL DIRECTIVE: Cylinder administration must strictly follow medical prescription and authorized regulator settings.',
      'Always secure cylinder in an upright stand or mobile trolley. Never leave cylinders unanchored.',
      'Keep away from heat sources, grease, combustible materials, and electrical switches.',
      'Check pressure regulator gauge before transit.',
    ],
    fulfilmentNotes: 'Cylinders are released verified and sealed. Collection at Burnett Hill or direct vehicle coordination available.',
    image: '/src/assets/images/medical_supplies_kit_1791914620679.jpg',
  },
];

export const INITIAL_INVENTORY_UNITS: RentalAssetUnit[] = [
  {
    assetId: 'THC-BED-001',
    category: 'Hospital beds',
    brandModel: 'Invacare MedLite Semi-Electric',
    serialNumber: 'INV-2024-9841',
    currentState: 'Available',
    condition: 'Excellent',
    lastInspectionDate: '2026-09-28',
    specifications: {
      'Motor System': 'Head & Foot Motorized / Hi-Lo Manual',
      'Bed Dimensions': '84 x 36 inches',
      'Weight Capacity': '450 lbs (204 kg)',
      'Rails': 'Split Assist Half-Rails',
    },
    accessoriesSupplied: ['Emergency Hand Crank', 'Wipeable Vinyl Mattress Cover', '2x Locking Side Rails'],
    safetyNotes: 'Tested electronic pendant controls and caster locks. Grounding verified.',
  },
  {
    assetId: 'THC-BED-002',
    category: 'Hospital beds',
    brandModel: 'Drive Medical Full-Electric Ultralight',
    serialNumber: 'DRV-2025-1102',
    currentState: 'Available',
    condition: 'Good',
    lastInspectionDate: '2026-10-02',
    specifications: {
      'Motor System': 'Fully Motorized (Head, Foot & Elevation)',
      'Bed Dimensions': '88 x 36 inches',
      'Weight Capacity': '450 lbs (204 kg)',
      'Rails': 'Telescoping Full-Length Rails',
    },
    accessoriesSupplied: ['Handheld Control Pendant', 'Emergency Battery Backup Connection'],
    safetyNotes: 'Serviced elevation motor; all rail pins lock securely.',
  },
  {
    assetId: 'THC-WHL-001',
    category: 'Wheelchairs',
    brandModel: 'Medline ComfortPlus Lightweight',
    serialNumber: 'MED-2024-3321',
    currentState: 'Available',
    condition: 'Excellent',
    lastInspectionDate: '2026-10-08',
    specifications: {
      'Seat Width': '18 inches',
      'Weight Capacity': '300 lbs',
      'Wheel Type': 'Solid Non-Marking Polyurethane',
      'Footrests': 'Swing-away detachable with heel loops',
    },
    accessoriesSupplied: ['Padded Seat Cushion', 'Safety Lap Belt'],
    safetyNotes: 'Brakes recalibrated; frame sanitized and wiped down.',
  },
  {
    assetId: 'THC-WHL-002',
    category: 'Wheelchairs',
    brandModel: 'Drive Cruiser III Dual-Axle',
    serialNumber: 'DRV-2024-5542',
    currentState: 'Out on rent',
    condition: 'Good',
    lastInspectionDate: '2026-09-15',
    currentRentalReference: 'THC-RNT-2026-1049',
    expectedReturnDate: '2026-10-22',
    specifications: {
      'Seat Width': '20 inches (Bariatric-friendly)',
      'Weight Capacity': '350 lbs',
      'Wheel Type': 'Solid Rubber Treaded',
      'Footrests': 'Elevating leg-rests for leg injury/cast',
    },
    accessoriesSupplied: ['Elevating Leg Rests with Calf Pads'],
    safetyNotes: 'Rented to client in Lowlands. Return due on Oct 22, 2026.',
  },
  {
    assetId: 'THC-OXY-001',
    category: 'Oxygen concentrators',
    brandModel: 'Philips Respironics EverFlo 5L',
    serialNumber: 'PHI-2025-8819',
    currentState: 'Available',
    condition: 'Excellent',
    lastInspectionDate: '2026-10-05',
    specifications: {
      'Flow Rate Range': '0.5 to 5.0 Litres/min continuous',
      'Oxygen Purity': '93% ± 3% at all flow rates',
      'Sound Level': '45 dBA whisper-quiet',
      'Power Source': '110V / 60Hz',
    },
    accessoriesSupplied: ['New Sealed Humidifier Bottle', '2x Sterile Nasal Cannulas', 'Tubing Adapter'],
    safetyNotes: 'O2 purity sensor tested at 94.2%. Intake particulate filter replaced Oct 5, 2026.',
  },
  {
    assetId: 'THC-OXY-002',
    category: 'Oxygen concentrators',
    brandModel: 'DeVilbiss 525DS Compact 5L',
    serialNumber: 'DEV-2024-4091',
    currentState: 'Returned, awaiting inspection',
    condition: 'Requires Sanitization/Inspection',
    lastInspectionDate: '2026-09-10',
    specifications: {
      'Flow Rate Range': '0.5 to 5.0 Litres/min continuous',
      'Oxygen Purity': '93% ± 3%',
      'Weight': '36 lbs',
      'Power Source': '110V / 60Hz',
    },
    accessoriesSupplied: [],
    safetyNotes: 'Returned yesterday. Inspection and full filter sterilization required before returning to Available status.',
  },
  {
    assetId: 'THC-CYL-001',
    category: 'Oxygen cylinders',
    brandModel: 'Catalina Medical E-Cylinder with Brass Regulator',
    serialNumber: 'CAT-2025-0199',
    currentState: 'Available',
    condition: 'Excellent',
    lastInspectionDate: '2026-10-09',
    specifications: {
      'Cylinder Volume': '680 Litres compressed O2',
      'Pressure Fill': '2000 PSI certified full',
      'Regulator Type': 'CGA-870 Pin-Index with Flowmeter (0-15 LPM)',
      'Cart': 'Chrome Mobile 2-Wheel Trolley',
    },
    accessoriesSupplied: ['Pre-installed Pressure Gauge', 'Safety Cylinder Ring', '2-Wheel Transport Cart'],
    safetyNotes: 'Hydrostatic inspection current through 2029. Valve seat tested for zero leakage.',
  },
];
