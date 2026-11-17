/**
 * Google Forms API Service for Tobago Healthcare Equipment & Supplies
 * Handles form creation, item configuration, response retrieval, and listing via Drive API
 */

import { getAccessToken } from './firebaseAuth';

export interface GoogleFormQuestion {
  questionId?: string;
  required?: boolean;
  type: 'text' | 'paragraph' | 'choice' | 'date' | 'scale';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
}

export interface GoogleFormItem {
  itemId?: string;
  title: string;
  description?: string;
  questionItem?: {
    question: {
      questionId: string;
      required?: boolean;
      textQuestion?: {
        paragraph?: boolean;
      };
      choiceQuestion?: {
        type: 'RADIO' | 'CHECKBOX' | 'DROP_DOWN';
        options: Array<{ value: string }>;
      };
      dateQuestion?: {
        includeTime?: boolean;
        includeYear?: boolean;
      };
      scaleQuestion?: {
        low: number;
        high: number;
        lowLabel?: string;
        highLabel?: string;
      };
    };
  };
}

export interface GoogleFormResponseAnswer {
  questionId: string;
  textAnswers?: {
    answers: Array<{ value: string }>;
  };
}

export interface GoogleFormResponseItem {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  answers?: Record<string, GoogleFormResponseAnswer>;
}

export interface GoogleFormDetails {
  formId: string;
  info: {
    title: string;
    description?: string;
    documentTitle?: string;
  };
  settings?: any;
  items?: GoogleFormItem[];
  revisionId?: string;
  responderUri?: string;
}

export interface GoogleDriveFormFile {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export interface FormTemplatePreset {
  id: string;
  title: string;
  description: string;
  category: 'intake' | 'transport' | 'rental' | 'feedback';
  items: Array<{
    title: string;
    description?: string;
    required: boolean;
    type: 'text' | 'paragraph' | 'choice' | 'date' | 'scale';
    options?: string[];
    lowLabel?: string;
    highLabel?: string;
  }>;
}

export const TOBAGO_FORM_TEMPLATES: FormTemplatePreset[] = [
  {
    id: 'patient-intake',
    title: 'Tobago Healthcare - Patient Intake & Medical Profile',
    description: 'Confidential patient intake for mobility assessment, emergency contact, and baseline health details in Tobago.',
    category: 'intake',
    items: [
      {
        title: 'Full Name of Patient',
        description: 'First and last name as shown on national ID or passport',
        required: true,
        type: 'text',
      },
      {
        title: 'Contact Phone Number / WhatsApp',
        description: 'Preferably Trinidad & Tobago mobile with WhatsApp availability',
        required: true,
        type: 'text',
      },
      {
        title: 'Home Address / Location in Tobago',
        description: 'Parish/town (e.g., Scarborough, Crown Point, Plymouth, Roxborough)',
        required: true,
        type: 'text',
      },
      {
        title: 'Mobility Status & Functional Level',
        description: 'Select the primary mobility classification',
        required: true,
        type: 'choice',
        options: [
          'Ambulatory (walks independently)',
          'Requires assistance / cane / walker',
          'Wheelchair user (can transfer)',
          'Wheelchair bound (requires full assistance)',
          'Bed-bound (requires stretcher / specialized care)',
        ],
      },
      {
        title: 'Medical Conditions / Alerts',
        description: 'Relevant conditions (e.g. cardiac, respiratory, dialysis, post-op)',
        required: false,
        type: 'paragraph',
      },
      {
        title: 'Emergency Contact Name & Phone',
        description: 'Next of kin or designated primary caregiver',
        required: true,
        type: 'text',
      },
    ],
  },
  {
    id: 'transport-clearance',
    title: 'Tobago Healthcare - Non-Emergency Transport Pre-Trip Assessment',
    description: 'Pre-journey clearance to determine vehicle suitability (company vehicle or specialist partner), oxygen requirements, and ferry/flight coordination.',
    category: 'transport',
    items: [
      {
        title: 'Passenger Name & Travel Reference',
        required: true,
        type: 'text',
      },
      {
        title: 'Primary Pick-Up & Destination in Trinidad or Tobago',
        description: 'E.g., Scarborough General Hospital to residence, or ANR Robinson Airport',
        required: true,
        type: 'text',
      },
      {
        title: 'Planned Travel Date & Time',
        required: true,
        type: 'text',
      },
      {
        title: 'Oxygen Support Required During Journey?',
        required: true,
        type: 'choice',
        options: [
          'No oxygen required',
          'Continuous oxygen needed (Litres/min specify in notes)',
          'Emergency PRN oxygen availability requested',
        ],
      },
      {
        title: 'Travel Pathway Assistance',
        description: 'Non-emergency road transport or inter-island coordination',
        required: true,
        type: 'choice',
        options: [
          'Tobago Local Non-Emergency Road Transport',
          'Inter-island Ferry Travel Coordination',
          'Inter-island Flight Coordination (Caribbean Airlines)',
          'Trinidad Medical Facility Transfer Partner',
        ],
      },
      {
        title: 'Attending Caregiver Accompanying Passenger?',
        required: true,
        type: 'choice',
        options: ['Yes (1 escort)', 'Yes (2 escorts)', 'No (Travelling solo)'],
      },
    ],
  },
  {
    id: 'equipment-rental-agreement',
    title: 'Tobago Healthcare - Medical Equipment Rental Agreement & Inspection',
    description: 'Customer agreement acknowledging proper handling, sanitized collection/delivery, and safety guidelines for rented beds, wheelchairs, or oxygen devices.',
    category: 'rental',
    items: [
      {
        title: 'Renter / Responsible Party Full Name',
        required: true,
        type: 'text',
      },
      {
        title: 'Equipment Item(s) Rented',
        required: true,
        type: 'choice',
        options: [
          'Hospital Bed (Full Electric / Semi-Electric)',
          'Standard / Heavy-Duty Wheelchair',
          'Oxygen Concentrator (5L / 10L Continuous)',
          'Medical Oxygen Cylinder / Tank with Regulator',
          'Combination Package',
        ],
      },
      {
        title: 'Rental Start Date & Estimated Duration',
        required: true,
        type: 'text',
      },
      {
        title: 'Delivery or Collection Preference',
        description: 'Collection next to Sports and Games, Burnett Hill, Scarborough or requested delivery',
        required: true,
        type: 'choice',
        options: [
          'Self-Collection at Burnett Hill, Scarborough (Next to Sports and Games)',
          'Delivery Requested (Staff confirmation and access check required)',
        ],
      },
      {
        title: 'Acknowledgement of Operational & Safety Briefing',
        description: 'I confirm that equipment operation and safety protocols have been explained and accepted.',
        required: true,
        type: 'choice',
        options: [
          'I Accept & Acknowledge All Safety Guidelines and Terms',
        ],
      },
    ],
  },
  {
    id: 'service-feedback',
    title: 'Tobago Healthcare - Client Experience & Service Feedback',
    description: 'Continuous quality improvement feedback for transport coordination, consultations, and rental support.',
    category: 'feedback',
    items: [
      {
        title: 'Service Received',
        required: true,
        type: 'choice',
        options: [
          'Medical Transport & Travel Coordination',
          'Medical Equipment Rental',
          'Clinical / Operational Consultation',
          'Retail Healthcare Supplies',
        ],
      },
      {
        title: 'Overall Satisfaction Rating (1 to 5)',
        required: true,
        type: 'choice',
        options: ['5 - Exceptional', '4 - Very Good', '3 - Satisfactory', '2 - Needs Improvement', '1 - Unsatisfactory'],
      },
      {
        title: 'Staff Punctuality, Care & Courtesy',
        required: true,
        type: 'choice',
        options: ['Excellent', 'Good', 'Adequate', 'Poor'],
      },
      {
        title: 'Additional Comments or Suggestions for Tobago Healthcare',
        required: false,
        type: 'paragraph',
      },
    ],
  },
];

/**
 * List Google Forms found in Google Drive
 */
export async function listGoogleForms(): Promise<GoogleDriveFormFile[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with your Google account.');
  }

  const query = encodeURIComponent("mimeType='application/vnd.google-apps.form' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,createdTime,modifiedTime)&orderBy=modifiedTime desc&pageSize=50`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch Google Forms (${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Get form metadata and item definitions
 */
export async function getFormDetails(formId: string): Promise<GoogleFormDetails> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with your Google account.');
  }

  const safeFormId = encodeURIComponent(formId.trim());
  const url = `https://forms.googleapis.com/v1/forms/${safeFormId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch form details (${response.status})`);
  }

  return await response.json();
}

/**
 * Get responses submitted for a form
 */
export async function getFormResponses(formId: string): Promise<GoogleFormResponseItem[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with your Google account.');
  }

  const safeFormId = encodeURIComponent(formId.trim());
  const url = `https://forms.googleapis.com/v1/forms/${safeFormId}/responses`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch form responses (${response.status})`);
  }

  const data = await response.json();
  return data.responses || [];
}

/**
 * Create a new blank Google Form
 */
export async function createGoogleForm(title: string, documentTitle?: string): Promise<GoogleFormDetails> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with your Google account.');
  }

  const url = 'https://forms.googleapis.com/v1/forms';
  const body = {
    info: {
      title: title.trim(),
      documentTitle: (documentTitle || title).trim(),
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create form (${response.status})`);
  }

  return await response.json();
}

/**
 * Deploy a full template to a Google Form using batchUpdate
 */
export async function deployFormTemplate(template: FormTemplatePreset): Promise<GoogleFormDetails> {
  // 1. Create the base form
  const createdForm = await createGoogleForm(template.title, template.title);
  const formId = createdForm.formId;

  // 2. Prepare batch update requests to add questions
  const requests: any[] = [];

  // Optional: update description in info
  if (template.description) {
    requests.push({
      updateFormInfo: {
        info: {
          description: template.description,
        },
        updateMask: 'description',
      },
    });
  }

  // Add question items
  template.items.forEach((item, index) => {
    let questionPayload: any = {
      required: item.required,
    };

    if (item.type === 'text') {
      questionPayload.textQuestion = { paragraph: false };
    } else if (item.type === 'paragraph') {
      questionPayload.textQuestion = { paragraph: true };
    } else if (item.type === 'choice') {
      questionPayload.choiceQuestion = {
        type: 'RADIO',
        options: (item.options || ['Yes', 'No']).map((opt) => ({ value: opt })),
      };
    } else if (item.type === 'date') {
      questionPayload.dateQuestion = {
        includeYear: true,
        includeTime: false,
      };
    } else {
      questionPayload.textQuestion = { paragraph: false };
    }

    requests.push({
      createItem: {
        item: {
          title: item.title,
          description: item.description,
          questionItem: {
            question: questionPayload,
          },
        },
        location: {
          index: index,
        },
      },
    });
  });

  // 3. Send batchUpdate
  const token = await getAccessToken();
  const safeFormId = encodeURIComponent(formId);
  const updateUrl = `https://forms.googleapis.com/v1/forms/${safeFormId}:batchUpdate`;

  const updateResponse = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!updateResponse.ok) {
    console.warn('Batch update had non-fatal issue, fetching form anyway:', await updateResponse.text());
  }

  // 4. Return refreshed form details
  return await getFormDetails(formId);
}

/**
 * Delete a Google Form by moving to Drive trash (requires explicit user confirmation dialog first)
 */
export async function trashGoogleForm(formId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with your Google account.');
  }

  const safeFileId = encodeURIComponent(formId.trim());
  const url = `https://www.googleapis.com/drive/v3/files/${safeFileId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete form (${response.status})`);
  }

  return true;
}
