import {
  TransportRequest,
  RentalRequest,
  ConsultationRequest,
  RentalAssetUnit,
  AuditLogEntry,
  UserRole,
  RequestStatus,
  EquipmentState,
  TransportPathway,
  RentalFulfilmentStatus,
} from '../types';
import { INITIAL_INVENTORY_UNITS } from '../data/rentalData';

// Initial sample requests to ensure staff dashboard has operational queue data immediately
const SAMPLE_TRANSPORT_REQUESTS: TransportRequest[] = [
  {
    id: 'trn-1',
    reference: 'THC-TRN-2026-1082',
    timestamp: '2026-10-14 07:15',
    status: 'Under Review',
    assignedStaff: 'Marcus T. (Transport Coord.)',
    contactName: 'Cheryl Alexander',
    phone: '+1 (868) 639-4412',
    email: 'cheryl.a@example.com',
    preferredContactMethod: 'WhatsApp',
    passengerRelationship: 'Family Member',
    transportType: 'Local Tobago Non-Emergency',
    origin: 'Patience Hill, Tobago',
    destination: 'Scarborough General Hospital Outpatient Clinic',
    requestedDate: '2026-10-16',
    preferredTimeWindow: 'Morning (8am - 12pm)',
    specificTime: '08:45 AM',
    journeyType: 'Return',
    passengerCount: 1,
    hasAccompanyingPerson: true,
    isInterIsland: false,
    wheelchairAccessibilityRequired: true,
    boardingAssistanceRequired: true,
    lyingFlatRequested: false,
    medicalEquipmentAccompanying: false,
    escortRequired: false,
    pathway: 'Company vehicle assessment required',
    notes: 'Passenger is elderly with walking difficulty; wheelchair accessible vehicle required.',
  },
  {
    id: 'trn-2',
    reference: 'THC-TRN-2026-1094',
    timestamp: '2026-10-14 08:00',
    status: 'Awaiting Provider Confirmation',
    assignedStaff: 'Marcus T.',
    contactName: 'David Rampersad',
    phone: '+1 (868) 495-2281',
    preferredContactMethod: 'Phone Call',
    passengerRelationship: 'Self',
    transportType: 'Trinidad Inter-Island Medical Transfer',
    origin: 'Crown Point, Tobago (ANR Robinson Airport)',
    destination: 'St. Clair Medical Centre, Port of Spain, Trinidad',
    requestedDate: '2026-10-19',
    preferredTimeWindow: 'Morning (8am - 12pm)',
    journeyType: 'One-way',
    passengerCount: 2,
    hasAccompanyingPerson: true,
    isInterIsland: true,
    wheelchairAccessibilityRequired: false,
    boardingAssistanceRequired: true,
    lyingFlatRequested: false,
    medicalEquipmentAccompanying: true,
    accompanyingEquipmentDetails: 'Small portable oxygen concentrator',
    escortRequired: false,
    pathway: 'Airline coordination required',
    notes: 'Coordinating airline boarding clearance for portable O2 concentrator.',
  },
];

const SAMPLE_RENTAL_REQUESTS: RentalRequest[] = [
  {
    id: 'rnt-1',
    reference: 'THC-RNT-2026-2041',
    timestamp: '2026-10-14 06:45',
    status: 'Enquiry Received',
    customerName: 'Patricia London',
    phone: '+1 (868) 789-1120',
    email: 'plondon@example.com',
    equipmentCategory: 'Hospital beds',
    quantityRequested: 1,
    requestedStartDate: '2026-10-17',
    expectedDurationDays: 30,
    preferredFulfilment: 'Delivery (Subject to review)',
    deliveryGeneralLocation: 'Black Rock, Tobago',
    fulfilmentStatus: 'Delivery feasibility under review',
    accessibilityRequirements: 'Ground floor bedroom with double doors.',
  },
  {
    id: 'rnt-2',
    reference: 'THC-RNT-2026-2048',
    timestamp: '2026-10-13 14:20',
    status: 'Quotation Prepared',
    assignedStaff: 'Althea K. (Rental Coord.)',
    customerName: 'Kenrick Charles',
    phone: '+1 (868) 639-8800',
    equipmentCategory: 'Wheelchairs',
    quantityRequested: 1,
    requestedStartDate: '2026-10-15',
    expectedDurationDays: 14,
    preferredFulfilment: 'Collection (Burnett Hill, Scarborough)',
    fulfilmentStatus: 'Collection instructions pending',
    allocatedAssetIds: ['THC-WHL-001'],
    quotedRentalRateTTD: 450,
    quotedDepositTTD: 300,
  },
];

const SAMPLE_CONSULTATION_REQUESTS: ConsultationRequest[] = [
  {
    id: 'cns-1',
    reference: 'THC-CNS-2026-3011',
    timestamp: '2026-10-14 07:30',
    status: 'Under Review',
    assignedStaff: 'Sister Edwards',
    contactName: 'Brenda Mitchell',
    phone: '+1 (868) 495-7711',
    email: 'b.mitchell@example.tt',
    consultationTopic: 'Inter-Island Travel Coordination',
    preferredDate: '2026-10-16',
    preferredTimeSlot: 'Morning (9am - 12pm)',
    message: 'Seeking guidance on coordinating ferry transport and wheelchair boarding for an upcoming cardiology appointment in Trinidad.',
  },
];

const SAMPLE_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    timestamp: '2026-10-14 08:05',
    performedBy: 'System Auto-Log',
    role: 'Administrator',
    action: 'System Initialized',
    targetReference: 'SYS-INIT',
    details: 'Tobago Healthcare operational queue loaded with confirmed business location at Burnett Hill, Scarborough.',
  },
];

export class OperationsStore {
  private static instance: OperationsStore;

  private transportRequests: TransportRequest[] = [];
  private rentalRequests: RentalRequest[] = [];
  private consultationRequests: ConsultationRequest[] = [];
  private inventoryUnits: RentalAssetUnit[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private currentStaffRole: UserRole = 'Administrator';
  private currentStaffName: string = 'Staff Admin (Tobago)';
  private listeners: Array<() => void> = [];

  private constructor() {
    this.loadState();
  }

  public static getInstance(): OperationsStore {
    if (!OperationsStore.instance) {
      OperationsStore.instance = new OperationsStore();
    }
    return OperationsStore.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.saveState();
    this.listeners.forEach((l) => l());
  }

  private saveState() {
    try {
      localStorage.setItem('thc_transport_reqs', JSON.stringify(this.transportRequests));
      localStorage.setItem('thc_rental_reqs', JSON.stringify(this.rentalRequests));
      localStorage.setItem('thc_consult_reqs', JSON.stringify(this.consultationRequests));
      localStorage.setItem('thc_inventory', JSON.stringify(this.inventoryUnits));
      localStorage.setItem('thc_audit_logs', JSON.stringify(this.auditLogs));
      localStorage.setItem('thc_staff_role', this.currentStaffRole);
      localStorage.setItem('thc_staff_name', this.currentStaffName);
    } catch {
      // Ignore
    }
  }

  private loadState() {
    try {
      const trn = localStorage.getItem('thc_transport_reqs');
      this.transportRequests = trn ? JSON.parse(trn) : SAMPLE_TRANSPORT_REQUESTS;

      const rnt = localStorage.getItem('thc_rental_reqs');
      this.rentalRequests = rnt ? JSON.parse(rnt) : SAMPLE_RENTAL_REQUESTS;

      const cns = localStorage.getItem('thc_consult_reqs');
      this.consultationRequests = cns ? JSON.parse(cns) : SAMPLE_CONSULTATION_REQUESTS;

      const inv = localStorage.getItem('thc_inventory');
      this.inventoryUnits = inv ? JSON.parse(inv) : INITIAL_INVENTORY_UNITS;

      const aud = localStorage.getItem('thc_audit_logs');
      this.auditLogs = aud ? JSON.parse(aud) : SAMPLE_AUDIT_LOGS;

      const role = localStorage.getItem('thc_staff_role') as UserRole;
      if (role) this.currentStaffRole = role;

      const name = localStorage.getItem('thc_staff_name');
      if (name) this.currentStaffName = name;
    } catch {
      this.transportRequests = SAMPLE_TRANSPORT_REQUESTS;
      this.rentalRequests = SAMPLE_RENTAL_REQUESTS;
      this.consultationRequests = SAMPLE_CONSULTATION_REQUESTS;
      this.inventoryUnits = INITIAL_INVENTORY_UNITS;
      this.auditLogs = SAMPLE_AUDIT_LOGS;
    }
  }

  // Getters
  public getStaffRole(): UserRole {
    return this.currentStaffRole;
  }

  public getStaffName(): string {
    return this.currentStaffName;
  }

  public setStaffSession(name: string, role: UserRole) {
    this.currentStaffName = name;
    this.currentStaffRole = role;
    this.logAction('Staff Session Switched', `ROLE-${role}`, `Switched role to ${role}`);
    this.notify();
  }

  public getTransportRequests(): TransportRequest[] {
    return [...this.transportRequests];
  }

  public getRentalRequests(): RentalRequest[] {
    return [...this.rentalRequests];
  }

  public getConsultationRequests(): ConsultationRequest[] {
    return [...this.consultationRequests];
  }

  public getInventoryUnits(): RentalAssetUnit[] {
    return [...this.inventoryUnits];
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  // Audit Logger
  public logAction(action: string, targetReference: string, details: string) {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      performedBy: this.currentStaffName,
      role: this.currentStaffRole,
      action,
      targetReference,
      details,
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
  }

  // Transport Methods
  public createTransportRequest(data: Omit<TransportRequest, 'id' | 'reference' | 'timestamp' | 'status'>): TransportRequest {
    const reference = `THC-TRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: TransportRequest = {
      ...data,
      id: `trn-${Date.now()}`,
      reference,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Enquiry Received',
    };
    this.transportRequests.unshift(newReq);
    this.logAction('Transport Request Created', reference, `From: ${newReq.origin} to ${newReq.destination}`);
    this.notify();
    return newReq;
  }

  public updateTransportStatus(
    id: string,
    status: RequestStatus,
    pathway?: TransportPathway,
    assignedStaff?: string,
    notes?: string
  ) {
    const req = this.transportRequests.find((r) => r.id === id);
    if (!req) return;
    const oldStatus = req.status;
    req.status = status;
    if (pathway) req.pathway = pathway;
    if (assignedStaff) req.assignedStaff = assignedStaff;
    if (notes) req.notes = notes;

    this.logAction(
      'Transport Status Updated',
      req.reference,
      `Status: ${oldStatus} -> ${status}${pathway ? ` (Pathway: ${pathway})` : ''}`
    );
    this.notify();
  }

  // Rental Methods
  public createRentalRequest(data: Omit<RentalRequest, 'id' | 'reference' | 'timestamp' | 'status' | 'fulfilmentStatus'>): RentalRequest {
    const reference = `THC-RNT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: RentalRequest = {
      ...data,
      id: `rnt-${Date.now()}`,
      reference,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Enquiry Received',
      fulfilmentStatus: data.preferredFulfilment.includes('Delivery')
        ? 'Delivery requested'
        : 'Collection requested',
    };
    this.rentalRequests.unshift(newReq);
    this.logAction('Rental Enquiry Created', reference, `Category: ${newReq.equipmentCategory}`);
    this.notify();
    return newReq;
  }

  public updateRentalStatus(
    id: string,
    status: RequestStatus,
    fulfilmentStatus?: RentalFulfilmentStatus,
    assignedStaff?: string,
    quotedRate?: number,
    quotedDeposit?: number
  ) {
    const req = this.rentalRequests.find((r) => r.id === id);
    if (!req) return;
    const oldStatus = req.status;
    req.status = status;
    if (fulfilmentStatus) req.fulfilmentStatus = fulfilmentStatus;
    if (assignedStaff) req.assignedStaff = assignedStaff;
    if (quotedRate !== undefined) req.quotedRentalRateTTD = quotedRate;
    if (quotedDeposit !== undefined) req.quotedDepositTTD = quotedDeposit;

    this.logAction(
      'Rental Status Updated',
      req.reference,
      `Status: ${oldStatus} -> ${status}${fulfilmentStatus ? ` (${fulfilmentStatus})` : ''}`
    );
    this.notify();
  }

  // Equipment Allocation with Double-Booking Prevention
  public allocateAssetToRental(rentalId: string, assetId: string): { success: boolean; error?: string } {
    const req = this.rentalRequests.find((r) => r.id === rentalId);
    if (!req) return { success: false, error: 'Rental request not found.' };

    const asset = this.inventoryUnits.find((a) => a.assetId === assetId);
    if (!asset) return { success: false, error: 'Asset ID not found in inventory.' };

    // Prevent double-allocation
    if (asset.currentState === 'Out on rent') {
      return {
        success: false,
        error: `Asset ${assetId} (${asset.brandModel}) is currently out on rent under reference ${asset.currentRentalReference || 'active contract'}.`,
      };
    }
    if (asset.currentState === 'Reserved') {
      return {
        success: false,
        error: `Asset ${assetId} is already reserved for another customer.`,
      };
    }
    if (asset.currentState === 'Returned, awaiting inspection' || asset.currentState === 'Under maintenance') {
      return {
        success: false,
        error: `Asset ${assetId} requires physical safety inspection and sanitization before it can be assigned.`,
      };
    }

    // Allocate
    if (!req.allocatedAssetIds) req.allocatedAssetIds = [];
    if (!req.allocatedAssetIds.includes(assetId)) {
      req.allocatedAssetIds.push(assetId);
    }
    asset.currentState = 'Reserved';
    asset.currentRentalReference = req.reference;

    this.logAction(
      'Asset Allocated to Rental',
      req.reference,
      `Allocated unit ${asset.assetId} (${asset.brandModel})`
    );
    this.notify();
    return { success: true };
  }

  // De-allocate or Release Unit
  public releaseAssetFromRental(rentalId: string, assetId: string) {
    const req = this.rentalRequests.find((r) => r.id === rentalId);
    if (req && req.allocatedAssetIds) {
      req.allocatedAssetIds = req.allocatedAssetIds.filter((id) => id !== assetId);
    }
    const asset = this.inventoryUnits.find((a) => a.assetId === assetId);
    if (asset && asset.currentRentalReference === req?.reference) {
      // Must go to awaiting inspection if was out on rent, or available if was just reserved
      asset.currentState = asset.currentState === 'Out on rent' ? 'Returned, awaiting inspection' : 'Available';
      asset.currentRentalReference = undefined;
    }
    this.logAction(
      'Asset Released from Rental',
      rentalId,
      `Unit ${assetId} released`
    );
    this.notify();
  }

  // Update Inventory Unit State directly (Inspection, Maintenance, Return)
  public updateInventoryUnitState(
    assetId: string,
    newState: EquipmentState,
    condition?: 'Excellent' | 'Good' | 'Needs Minor Servicing' | 'Requires Sanitization/Inspection',
    notes?: string
  ) {
    const asset = this.inventoryUnits.find((a) => a.assetId === assetId);
    if (!asset) return;

    const oldState = asset.currentState;
    asset.currentState = newState;
    if (condition) asset.condition = condition;
    if (notes) asset.safetyNotes = notes;
    if (newState === 'Available' || condition === 'Excellent') {
      asset.lastInspectionDate = new Date().toISOString().substring(0, 10);
    }

    this.logAction(
      'Inventory State Changed',
      asset.assetId,
      `Unit state: ${oldState} -> ${newState}${notes ? ` (${notes})` : ''}`
    );
    this.notify();
  }

  // Consultation Methods
  public createConsultationRequest(data: Omit<ConsultationRequest, 'id' | 'reference' | 'timestamp' | 'status'>): ConsultationRequest {
    const reference = `THC-CNS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: ConsultationRequest = {
      ...data,
      id: `cns-${Date.now()}`,
      reference,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Enquiry Received',
    };
    this.consultationRequests.unshift(newReq);
    this.logAction('Consultation Requested', reference, `Topic: ${newReq.consultationTopic}`);
    this.notify();
    return newReq;
  }

  public updateConsultationStatus(id: string, status: RequestStatus, assignedStaff?: string, notes?: string) {
    const req = this.consultationRequests.find((r) => r.id === id);
    if (!req) return;
    const oldStatus = req.status;
    req.status = status;
    if (assignedStaff) req.assignedStaff = assignedStaff;
    if (notes) req.notes = notes;

    this.logAction(
      'Consultation Status Updated',
      req.reference,
      `Status: ${oldStatus} -> ${status}`
    );
    this.notify();
  }
}

export const operationsStore = OperationsStore.getInstance();
