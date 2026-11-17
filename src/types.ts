export type UserRole =
  | 'Administrator'
  | 'Transport Coordinator'
  | 'Rental Coordinator'
  | 'Customer Service Staff'
  | 'Read-Only Manager';

export type TransportPathway =
  | 'Company vehicle assessment required'
  | 'Independent transport provider required'
  | 'Airline coordination required'
  | 'Sea transport coordination required'
  | 'Mixed transport arrangement required'
  | 'Further assessment required'
  | 'Unable to fulfil';

export type RequestStatus =
  | 'Enquiry Received'
  | 'Under Review'
  | 'Awaiting Customer Info'
  | 'Awaiting Provider Confirmation'
  | 'Quotation Prepared'
  | 'Provisional Arrangement'
  | 'Confirmed'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type EquipmentState =
  | 'Available'
  | 'Requested'
  | 'Reserved'
  | 'Out on rent'
  | 'Return due'
  | 'Returned, awaiting inspection'
  | 'Under maintenance'
  | 'Unavailable'
  | 'Retired';

export type RentalFulfilmentStatus =
  | 'Collection requested'
  | 'Delivery requested'
  | 'Delivery feasibility under review'
  | 'Delivery approved'
  | 'Collection instructions pending'
  | 'Fulfilment arrangement confirmed';

export interface TransportRequest {
  id: string;
  reference: string;
  timestamp: string;
  status: RequestStatus;
  assignedStaff?: string;
  notes?: string;

  // Step 1: Contact Information
  contactName: string;
  phone: string;
  email?: string;
  preferredContactMethod: 'WhatsApp' | 'Phone Call' | 'Email';
  passengerRelationship: 'Self' | 'Family Member' | 'Caregiver' | 'Healthcare Professional' | 'Other';

  // Step 2: Journey Details
  transportType: 'Local Tobago Non-Emergency' | 'Trinidad Inter-Island Medical Transfer' | 'Airport/Ferry Connection' | 'Clinic/Hospital Appointment' | 'Other Non-Emergency';
  origin: string;
  destination: string;
  requestedDate: string;
  preferredTimeWindow: 'Morning (8am - 12pm)' | 'Afternoon (12pm - 4pm)' | 'Evening (4pm - 8pm)' | 'Specific Time';
  specificTime?: string;
  journeyType: 'One-way' | 'Return';
  passengerCount: number;
  hasAccompanyingPerson: boolean;
  isInterIsland: boolean;

  // Step 3: Accessibility & Logistical Requirements
  wheelchairAccessibilityRequired: boolean;
  boardingAssistanceRequired: boolean;
  lyingFlatRequested: boolean;
  medicalEquipmentAccompanying: boolean;
  accompanyingEquipmentDetails?: string;
  escortRequired: boolean;
  additionalLogisticalNotes?: string;

  // Step 4: Staff Classification Pathway
  pathway?: TransportPathway;
  assignedVehicleOrProvider?: string;
  quotedPriceTTD?: number;
}

export interface RentalRequest {
  id: string;
  reference: string;
  timestamp: string;
  status: RequestStatus;
  assignedStaff?: string;
  notes?: string;

  customerName: string;
  phone: string;
  email?: string;
  equipmentCategory: 'Hospital beds' | 'Wheelchairs' | 'Oxygen concentrators' | 'Oxygen cylinders';
  quantityRequested: number;
  requestedStartDate: string;
  expectedDurationDays?: number;
  expectedReturnDate?: string;

  preferredFulfilment: 'Collection (Burnett Hill, Scarborough)' | 'Delivery (Subject to review)' | 'Discuss Options';
  deliveryGeneralLocation?: string;
  fulfilmentStatus: RentalFulfilmentStatus;

  accessibilityRequirements?: string;
  clinicalPrescriptionNotes?: string; // e.g. for oxygen flow verification statement

  allocatedAssetIds?: string[];
  quotedRentalRateTTD?: number;
  quotedDepositTTD?: number;
  quotedDeliveryFeeTTD?: number;
}

export interface ConsultationRequest {
  id: string;
  reference: string;
  timestamp: string;
  status: RequestStatus;
  assignedStaff?: string;
  notes?: string;

  contactName: string;
  phone: string;
  email?: string;
  consultationTopic:
    | 'Transport Arrangements'
    | 'Inter-Island Travel Coordination'
    | 'Accessibility Requirements'
    | 'Medical Equipment Rental Options'
    | 'Other Relevant Service Enquiries';
  preferredDate: string;
  preferredTimeSlot: 'Morning (9am - 12pm)' | 'Afternoon (1pm - 4pm)' | 'Late Afternoon (4pm - 6pm)';
  message: string;
  confirmedCalendarEventId?: string;
}

export interface RentalAssetUnit {
  assetId: string;
  category: 'Hospital beds' | 'Wheelchairs' | 'Oxygen concentrators' | 'Oxygen cylinders';
  brandModel: string;
  serialNumber: string;
  currentState: EquipmentState;
  condition: 'Excellent' | 'Good' | 'Needs Minor Servicing' | 'Requires Sanitization/Inspection';
  lastInspectionDate: string;
  currentRentalReference?: string;
  expectedReturnDate?: string;
  specifications: Record<string, string>;
  accessoriesSupplied?: string[];
  safetyNotes?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  performedBy: string;
  role: UserRole;
  action: string;
  targetReference: string;
  details: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  itemCount: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId: string;
  shortDescription: string;
  fullDescription: string;
  priceTTD: number | null;
  isPriceConfirmed: boolean;
  availability: 'In Stock' | 'Contact for Availability' | 'Available to Order';
  sku: string;
  brand: string;
  image: string;
  featured: boolean;
  keyFeatures: string[];
  specifications: Record<string, string>;
  intendedUse: string;
}

export interface BusinessConfig {
  businessName: string;
  email: string;
  phone: string;
  whatsAppDigits: string;
  location: string;
  directions: string;
  serviceArea: string;
  telephonePlaceholder?: string;
  whatsAppPlaceholder?: string;
  addressPlaceholder?: string;
  openingHoursPlaceholder?: string;
}

export interface EnquirySubmission {
  id: string;
  fullName: string;
  email: string;
  telephone?: string;
  enquiryType: string;
  productName?: string;
  message: string;
  submittedAt: string;
  status: 'Received' | 'In Review';
  referenceCode: string;
}

