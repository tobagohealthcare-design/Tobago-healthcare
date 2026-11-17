import React, { useState, useEffect } from 'react';
import {
  Shield,
  Car,
  Bed,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Search,
  Filter,
  Layers,
  FileText,
  Lock,
  PlusCircle,
  Eye,
  Check,
  RefreshCw,
  HardDrive,
  Calendar,
  Mail,
  ClipboardList,
  Users,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { operationsStore } from '../services/operationsStore';
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

interface StaffAdminDashboardProps {
  onOpenDrive?: () => void;
  onOpenCalendar?: () => void;
  onOpenGmail?: () => void;
  onOpenForms?: () => void;
  onOpenContacts?: () => void;
}

export const StaffAdminDashboard: React.FC<StaffAdminDashboardProps> = ({
  onOpenDrive,
  onOpenCalendar,
  onOpenGmail,
  onOpenForms,
  onOpenContacts,
}) => {
  const [activeTab, setActiveTab] = useState<'transport' | 'rentals' | 'inventory' | 'consultations' | 'audit'>('transport');
  
  // Store data
  const [currentRole, setCurrentRole] = useState<UserRole>(operationsStore.getStaffRole());
  const [staffName, setStaffName] = useState<string>(operationsStore.getStaffName());
  const [transportReqs, setTransportReqs] = useState<TransportRequest[]>(operationsStore.getTransportRequests());
  const [rentalReqs, setRentalReqs] = useState<RentalRequest[]>(operationsStore.getRentalRequests());
  const [consultReqs, setConsultReqs] = useState<ConsultationRequest[]>(operationsStore.getConsultationRequests());
  const [inventoryUnits, setInventoryUnits] = useState<RentalAssetUnit[]>(operationsStore.getInventoryUnits());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(operationsStore.getAuditLogs());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal / Selected Item Detail States
  const [selectedTransport, setSelectedTransport] = useState<TransportRequest | null>(null);
  const [selectedRental, setSelectedRental] = useState<RentalRequest | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<RentalAssetUnit | null>(null);
  const [allocationError, setAllocationError] = useState<string | null>(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Subscribe to store changes
  useEffect(() => {
    const unsub = operationsStore.subscribe(() => {
      setTransportReqs(operationsStore.getTransportRequests());
      setRentalReqs(operationsStore.getRentalRequests());
      setConsultReqs(operationsStore.getConsultationRequests());
      setInventoryUnits(operationsStore.getInventoryUnits());
      setAuditLogs(operationsStore.getAuditLogs());
      setCurrentRole(operationsStore.getStaffRole());
      setStaffName(operationsStore.getStaffName());
    });
    return () => unsub();
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    const newName = `${newRole.split(' ')[0]} User (Tobago)`;
    operationsStore.setStaffSession(newName, newRole);
    setActionSuccessNotice(`Switched active operational role to ${newRole}`);
    setTimeout(() => setActionSuccessNotice(null), 3000);
  };

  // Permission helpers
  const canEditTransport = currentRole === 'Administrator' || currentRole === 'Transport Coordinator' || currentRole === 'Customer Service Staff';
  const canEditRentals = currentRole === 'Administrator' || currentRole === 'Rental Coordinator' || currentRole === 'Customer Service Staff';
  const canManageInventory = currentRole === 'Administrator' || currentRole === 'Rental Coordinator';
  const isReadOnly = currentRole === 'Read-Only Manager';

  // Transport handlers
  const handleUpdateTransportStatus = (id: string, status: RequestStatus, pathway?: TransportPathway, notes?: string) => {
    operationsStore.updateTransportStatus(id, status, pathway, staffName, notes);
    setSelectedTransport(null);
    setActionSuccessNotice(`Transport request status updated to "${status}".`);
    setTimeout(() => setActionSuccessNotice(null), 3000);
  };

  // Rental Asset Allocation
  const handleAllocateAsset = (rentalId: string, assetId: string) => {
    setAllocationError(null);
    const result = operationsStore.allocateAssetToRental(rentalId, assetId);
    if (!result.success) {
      setAllocationError(result.error || 'Allocation failed');
    } else {
      setActionSuccessNotice(`Successfully allocated asset unit ${assetId} without conflict.`);
      setTimeout(() => setActionSuccessNotice(null), 3500);
      // update selected rental modal view
      const updated = operationsStore.getRentalRequests().find((r) => r.id === rentalId);
      if (updated) setSelectedRental(updated);
    }
  };

  const handleReleaseAsset = (rentalId: string, assetId: string) => {
    operationsStore.releaseAssetFromRental(rentalId, assetId);
    setActionSuccessNotice(`Released asset unit ${assetId} from rental allocation.`);
    setTimeout(() => setActionSuccessNotice(null), 3000);
    const updated = operationsStore.getRentalRequests().find((r) => r.id === rentalId);
    if (updated) setSelectedRental(updated);
  };

  // Inventory Inspection & State handler
  const handleUpdateAssetState = (assetId: string, newState: EquipmentState, condition: any, notes?: string) => {
    operationsStore.updateInventoryUnitState(assetId, newState, condition, notes);
    setSelectedAsset(null);
    setActionSuccessNotice(`Updated inventory unit ${assetId} state to "${newState}".`);
    setTimeout(() => setActionSuccessNotice(null), 3000);
  };

  return (
    <div className="py-8 bg-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Control Bar: Active Staff Identity & Role Switcher */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold tracking-wider uppercase text-sky-400">
                Staff Operational Portal · Role-Based Access Control
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Tobago Healthcare Operations Management
            </h1>
            <p className="text-xs text-slate-400">
              Logged in as: <strong className="text-slate-200">{staffName}</strong> (Role: <span className="text-amber-400">{currentRole}</span>)
            </p>
          </div>

          {/* Role Switcher for Testing & Multi-Staff Operations */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-xs text-slate-300">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Switch Staff Role</span>
              <select
                value={currentRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="mt-0.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="Administrator">Administrator (Full Access)</option>
                <option value="Transport Coordinator">Transport Coordinator</option>
                <option value="Rental Coordinator">Rental Coordinator</option>
                <option value="Customer Service Staff">Customer Service Staff</option>
                <option value="Read-Only Manager">Read-Only Manager (Audits & Views)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-3">
              {onOpenGmail && (
                <button
                  onClick={onOpenGmail}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Gmail</span>
                </button>
              )}

              {onOpenCalendar && (
                <button
                  onClick={onOpenCalendar}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Calendar</span>
                </button>
              )}

              {onOpenForms && (
                <button
                  onClick={onOpenForms}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Forms</span>
                </button>
              )}

              {onOpenContacts && (
                <button
                  onClick={onOpenContacts}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Contacts</span>
                </button>
              )}

              {onOpenDrive && (
                <button
                  onClick={onOpenDrive}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                  <span>Drive</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Notice */}
        {actionSuccessNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('transport')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'transport'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Transport Queue ({transportReqs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rentals')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'rentals'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>Rental Queue ({rentalReqs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Equipment Inventory ({inventoryUnits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('consultations')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'consultations'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Consultations ({consultReqs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Log ({auditLogs.length})</span>
          </button>
        </div>

        {/* ----------------- SUB-VIEW 1: TRANSPORT QUEUE ----------------- */}
        {activeTab === 'transport' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Medical Transport & Travel Coordination Queue
                </h2>
                <p className="text-xs text-slate-500">
                  Manage non-emergency journey requests, vehicle assessments, and provider assignments.
                </p>
              </div>

              <div className="text-xs text-slate-500">
                Permission: {canEditTransport ? <span className="text-emerald-600 font-semibold">Editing Enabled</span> : <span className="text-amber-600 font-semibold">Read Only</span>}
              </div>
            </div>

            {/* Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">Contact / Phone</th>
                    <th className="px-4 py-3 font-semibold">Origin → Destination</th>
                    <th className="px-4 py-3 font-semibold">Date & Time</th>
                    <th className="px-4 py-3 font-semibold">Access Needs</th>
                    <th className="px-4 py-3 font-semibold">Pathway</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transportReqs.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-sky-900">{req.reference}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">{req.contactName}</span>
                        <span className="text-slate-500 text-[11px] font-mono">{req.phone}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">
                        {req.origin} → {req.destination}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono">
                        {req.requestedDate}
                        <span className="text-[10px] text-slate-400 block">{req.preferredTimeWindow}</span>
                      </td>
                      <td className="px-4 py-3">
                        {req.wheelchairAccessibilityRequired && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold text-[10px] mr-1">
                            Wheelchair
                          </span>
                        )}
                        {req.isInterIsland && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold text-[10px]">
                            Inter-Island
                          </span>
                        )}
                        {!req.wheelchairAccessibilityRequired && !req.isInterIsland && (
                          <span className="text-slate-400 text-[11px]">Standard</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11px] font-medium text-slate-700 max-w-[150px] truncate">
                        {req.pathway || 'Pending Assessment'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.status === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'Enquiry Received'
                              ? 'bg-blue-100 text-blue-800'
                              : req.status === 'Quotation Prepared'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedTransport(req)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------- SUB-VIEW 2: RENTALS QUEUE ----------------- */}
        {activeTab === 'rentals' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Medical Equipment Rental Requests & Allocation
                </h2>
                <p className="text-xs text-slate-500">
                  Review customer requests, prevent double-booking, and allocate physical inventory units.
                </p>
              </div>

              <div className="text-xs text-slate-500">
                Permission: {canEditRentals ? <span className="text-emerald-600 font-semibold">Editing Enabled</span> : <span className="text-amber-600 font-semibold">Read Only</span>}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">Customer / Phone</th>
                    <th className="px-4 py-3 font-semibold">Category Requested</th>
                    <th className="px-4 py-3 font-semibold">Start Date & Duration</th>
                    <th className="px-4 py-3 font-semibold">Fulfilment</th>
                    <th className="px-4 py-3 font-semibold">Allocated Unit(s)</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rentalReqs.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-900">{req.reference}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">{req.customerName}</span>
                        <span className="text-slate-500 text-[11px] font-mono">{req.phone}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{req.equipmentCategory} (Qty: {req.quantityRequested})</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">
                        {req.requestedStartDate}
                        <span className="text-[10px] text-slate-400 block">{req.expectedDurationDays} days</span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-600">
                        {req.preferredFulfilment.split(' ')[0]}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {req.allocatedAssetIds && req.allocatedAssetIds.length > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                            {req.allocatedAssetIds.join(', ')}
                          </span>
                        ) : (
                          <span className="text-amber-600 text-[10px] font-semibold">Unallocated</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedRental(req)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------- SUB-VIEW 3: INVENTORY MANAGER ----------------- */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Tracked Rental Inventory & Safety Inspections
                </h2>
                <p className="text-xs text-slate-500">
                  Live state tracking for hospital beds, wheelchairs, oxygen concentrators, and cylinders.
                </p>
              </div>

              <div className="text-xs text-slate-500">
                Permission: {canManageInventory ? <span className="text-emerald-600 font-semibold">Full Inventory Control</span> : <span className="text-amber-600 font-semibold">View Only</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventoryUnits.map((asset) => (
                <div
                  key={asset.assetId}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-sky-900">{asset.assetId}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          asset.currentState === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : asset.currentState === 'Out on rent'
                            ? 'bg-sky-100 text-sky-800'
                            : asset.currentState === 'Reserved'
                            ? 'bg-purple-100 text-purple-800'
                            : asset.currentState === 'Returned, awaiting inspection'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {asset.currentState}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                        {asset.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{asset.brandModel}</h4>
                      <span className="text-[11px] font-mono text-slate-500">SN: {asset.serialNumber}</span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                      <div>Condition: <strong className="text-slate-800">{asset.condition}</strong></div>
                      <div>Last Inspected: <span className="font-mono">{asset.lastInspectionDate}</span></div>
                      {asset.currentRentalReference && (
                        <div className="text-sky-800 font-semibold">Current Rental Ref: {asset.currentRentalReference}</div>
                      )}
                      {asset.safetyNotes && (
                        <div className="text-slate-500 italic text-[10px]">{asset.safetyNotes}</div>
                      )}
                    </div>
                  </div>

                  {canManageInventory && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      {asset.currentState === 'Returned, awaiting inspection' ? (
                        <button
                          onClick={() => handleUpdateAssetState(asset.assetId, 'Available', 'Excellent', 'Inspection & sanitization completed.')}
                          className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors"
                        >
                          Pass Safety Inspection → Available
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedAsset(asset)}
                          className="w-full py-1.5 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                        >
                          Update Unit State
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- SUB-VIEW 4: CONSULTATIONS ----------------- */}
        {activeTab === 'consultations' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Service Consultations & Discussion Requests
              </h2>
              <p className="text-xs text-slate-500">
                Client discussion appointments for travel logistics and rental options.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">Client / Phone</th>
                    <th className="px-4 py-3 font-semibold">Topic</th>
                    <th className="px-4 py-3 font-semibold">Requested Date & Slot</th>
                    <th className="px-4 py-3 font-semibold">Assigned Staff</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {consultReqs.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-purple-900">{req.reference}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">{req.contactName}</span>
                        <span className="text-slate-500 text-[11px] font-mono">{req.phone}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{req.consultationTopic}</td>
                      <td className="px-4 py-3 font-mono">
                        {req.preferredDate}
                        <span className="text-[10px] text-slate-400 block">{req.preferredTimeSlot}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{req.assignedStaff || 'Unassigned'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canEditTransport && (
                          <button
                            onClick={() => {
                              operationsStore.updateConsultationStatus(req.id, 'Confirmed', staffName);
                              setActionSuccessNotice(`Confirmed consultation appointment for ${req.contactName}.`);
                              setTimeout(() => setActionSuccessNotice(null), 3000);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 rounded-lg cursor-pointer"
                          >
                            Confirm Appointment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------- SUB-VIEW 5: AUDIT LOG ----------------- */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Operational Security & Activity Audit Log
              </h2>
              <p className="text-xs text-slate-500">
                System tracking for all status changes, booking allocations, inventory updates, and staff actions.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                    <th className="px-4 py-3 font-semibold">Timestamp</th>
                    <th className="px-4 py-3 font-semibold">Performed By</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                    <th className="px-4 py-3 font-semibold">Target Ref</th>
                    <th className="px-4 py-3 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-500">{log.timestamp}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-800 font-sans">{log.performedBy}</td>
                      <td className="px-4 py-2.5 text-slate-600">{log.role}</td>
                      <td className="px-4 py-2.5 font-semibold text-sky-900 font-sans">{log.action}</td>
                      <td className="px-4 py-2.5 text-slate-700 font-bold">{log.targetReference}</td>
                      <td className="px-4 py-2.5 text-slate-600 font-sans">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: MANAGE TRANSPORT REQUEST */}
      {selectedTransport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-700">Manage Transport Request</span>
                <h3 className="text-base font-bold text-slate-900">{selectedTransport.reference}</h3>
              </div>
              <button onClick={() => setSelectedTransport(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="text-xs space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div><strong>Passenger/Contact:</strong> {selectedTransport.contactName} ({selectedTransport.phone})</div>
              <div><strong>Route:</strong> {selectedTransport.origin} → {selectedTransport.destination}</div>
              <div><strong>Date:</strong> {selectedTransport.requestedDate} ({selectedTransport.preferredTimeWindow})</div>
              <div><strong>Accessibility:</strong> Wheelchair: {selectedTransport.wheelchairAccessibilityRequired ? 'Yes' : 'No'} | Inter-Island: {selectedTransport.isInterIsland ? 'Yes' : 'No'}</div>
              {selectedTransport.notes && <div><strong>Notes:</strong> {selectedTransport.notes}</div>}
            </div>

            {canEditTransport ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Transport Pathway</label>
                  <select
                    defaultValue={selectedTransport.pathway || 'Company vehicle assessment required'}
                    id="transport_pathway_select"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50"
                  >
                    <option value="Company vehicle assessment required">Company vehicle assessment required</option>
                    <option value="Independent transport provider required">Independent transport provider required</option>
                    <option value="Airline coordination required">Airline coordination required</option>
                    <option value="Sea transport coordination required">Sea transport coordination required</option>
                    <option value="Mixed transport arrangement required">Mixed transport arrangement required</option>
                    <option value="Further assessment required">Further assessment required</option>
                    <option value="Unable to fulfil">Unable to fulfil</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Update Status</label>
                  <select
                    defaultValue={selectedTransport.status}
                    id="transport_status_select"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50"
                  >
                    <option value="Enquiry Received">Enquiry Received</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Awaiting Customer Info">Awaiting Customer Info</option>
                    <option value="Awaiting Provider Confirmation">Awaiting Provider Confirmation</option>
                    <option value="Quotation Prepared">Quotation Prepared</option>
                    <option value="Provisional Arrangement">Provisional Arrangement</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedTransport(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const pathwayEl = document.getElementById('transport_pathway_select') as HTMLSelectElement;
                      const statusEl = document.getElementById('transport_status_select') as HTMLSelectElement;
                      handleUpdateTransportStatus(selectedTransport.id, statusEl.value as RequestStatus, pathwayEl.value as TransportPathway);
                    }}
                    className="px-5 py-2 text-white bg-sky-700 hover:bg-sky-800 rounded-lg font-semibold cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-700 italic">Read-only mode for current staff role.</div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: MANAGE RENTAL REQUEST & ALLOCATE UNIT */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700">Manage Rental Request</span>
                <h3 className="text-base font-bold text-slate-900">{selectedRental.reference}</h3>
              </div>
              <button onClick={() => setSelectedRental(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="text-xs space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div><strong>Customer:</strong> {selectedRental.customerName} ({selectedRental.phone})</div>
              <div><strong>Category Requested:</strong> {selectedRental.equipmentCategory} (Qty: {selectedRental.quantityRequested})</div>
              <div><strong>Dates:</strong> From {selectedRental.requestedStartDate} ({selectedRental.expectedDurationDays} days)</div>
              <div><strong>Fulfilment:</strong> {selectedRental.preferredFulfilment}</div>
              {selectedRental.allocatedAssetIds && selectedRental.allocatedAssetIds.length > 0 && (
                <div className="text-emerald-800 font-bold">
                  Allocated Unit(s): {selectedRental.allocatedAssetIds.join(', ')}
                </div>
              )}
            </div>

            {allocationError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{allocationError}</span>
              </div>
            )}

            {canEditRentals ? (
              <div className="space-y-4 text-xs">
                {/* Double-Booking Prevention: Allocate Unit */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Allocate Specific Equipment Unit (Double-Booking Protected)
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="asset_allocate_select"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50"
                    >
                      <option value="">-- Choose Unit in Category --</option>
                      {inventoryUnits
                        .filter((u) => u.category === selectedRental.equipmentCategory)
                        .map((u) => (
                          <option
                            key={u.assetId}
                            value={u.assetId}
                            disabled={u.currentState !== 'Available'}
                          >
                            {u.assetId} - {u.brandModel} ({u.currentState})
                          </option>
                        ))}
                    </select>

                    <button
                      onClick={() => {
                        const selectEl = document.getElementById('asset_allocate_select') as HTMLSelectElement;
                        if (selectEl.value) handleAllocateAsset(selectedRental.id, selectEl.value);
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      Allocate
                    </button>
                  </div>
                </div>

                {/* Currently Allocated Units Release Button */}
                {selectedRental.allocatedAssetIds && selectedRental.allocatedAssetIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">De-allocate:</span>
                    {selectedRental.allocatedAssetIds.map((id) => (
                      <button
                        key={id}
                        onClick={() => handleReleaseAsset(selectedRental.id, id)}
                        className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded text-[10px] font-bold cursor-pointer"
                      >
                        Release {id}
                      </button>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedRental(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-700 italic">Read-only mode for current staff role.</div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: UPDATE INVENTORY UNIT */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-700">Inventory Unit State</span>
                <h3 className="text-base font-bold text-slate-900">{selectedAsset.assetId}</h3>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="text-xs space-y-1">
              <div><strong>Model:</strong> {selectedAsset.brandModel}</div>
              <div><strong>Category:</strong> {selectedAsset.category}</div>
              <div><strong>Current State:</strong> {selectedAsset.currentState}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Equipment State</label>
                <select
                  defaultValue={selectedAsset.currentState}
                  id="asset_state_select"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Out on rent">Out on rent</option>
                  <option value="Return due">Return due</option>
                  <option value="Returned, awaiting inspection">Returned, awaiting inspection</option>
                  <option value="Under maintenance">Under maintenance</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Condition</label>
                <select
                  defaultValue={selectedAsset.condition}
                  id="asset_condition_select"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Needs Minor Servicing">Needs Minor Servicing</option>
                  <option value="Requires Sanitization/Inspection">Requires Sanitization/Inspection</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const stateEl = document.getElementById('asset_state_select') as HTMLSelectElement;
                    const condEl = document.getElementById('asset_condition_select') as HTMLSelectElement;
                    handleUpdateAssetState(selectedAsset.assetId, stateEl.value as EquipmentState, condEl.value as any);
                  }}
                  className="px-5 py-2 text-white bg-sky-700 hover:bg-sky-800 rounded-lg font-semibold cursor-pointer"
                >
                  Apply Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
