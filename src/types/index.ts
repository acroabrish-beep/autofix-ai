import { Models } from 'appwrite';

export type UserRole = 'student' | 'mechanic' | 'teacher' | 'vehicle_owner' | 'admin';

export interface User extends Models.User<Models.Preferences> {
  role?: UserRole;
}

export interface UserProfile extends Models.Document {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  avatarFileId?: string;
  preferredLanguage: string;
  institutionId?: string;
  garageId?: string;
  phone?: string;
  specialization?: string;
  status?: string;
}

export interface Department extends Models.Document {
  name: string;
  institutionId: string;
  headId: string;
}

export interface Program extends Models.Document {
  name: string;
  departmentId: string;
  institutionId: string;
  level: string;
}

export interface LearningModule extends Models.Document {
  programId?: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  content?: string;
  /** Duration label stored in the `duration` attribute, e.g. "45 min". */
  duration?: string;
  /** Legacy fallback used when `duration` is absent. */
  estimatedMinutes?: number;
  /** Optional — the current collection has no publish flag. */
  isPublished?: boolean;
  /** JSON string containing translations for all languages: { en: { title, description, content }, am: { ... }, om: { ... }, sid: { ... } } */
  translations?: string;
}

export interface LearningProgress extends Models.Document {
  userId: string;
  moduleId: string;
  progressPercent: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface VehicleProfile extends Models.Document {
  userId: string;
  make: string;
  model: string;
  /** Stored as a string in the `vehicles` collection. */
  year: number | string;
  engine?: string;
  /** Not stored by the current `vehicles` collection; kept optional for legacy UI. */
  fuelType?: string;
  /** Not stored by the current `vehicles` collection; kept optional for legacy UI. */
  mileage?: number;
  notes?: string;
  imageFileId?: string;
}

/**
 * Vehicle saved from the free-text "Add Vehicle" form.
 * Stored in the `vehicles` collection.
 */
export interface UserVehicle extends Models.Document {
  userId: string;
  make: string;
  model: string;
  year: string;
  engine?: string;
}

export interface PossibleCause {
  title: string;
  description: string;
  probability: number;
}

export interface RecommendedCheck {
  title: string;
  description: string;
  toolsRequired?: string[];
}

export interface DiagnosticResponse {
  summary: string;
  possibleCauses: PossibleCause[];
  recommendedChecks: RecommendedCheck[];
  nextSteps: string[];
  safetyNotes: string[];
  confidence: number;
  disclaimer: string;
}

export interface DiagnosticRequest {
  vehicleId: string;
  description: string;
  symptoms: string[];
  timing: string;
  warningLights: string[];
  recentRepairs?: string;
}

export interface DiagnosticSession extends Models.Document {
  userId: string;
  vehicleId: string;
  description: string;
  aiResponse: string;
  // Parsed/client-side fields (derived from the stored attributes above)
  userInput: string;
  requestData: DiagnosticRequest;
  result: DiagnosticResponse;
  status: 'active' | 'resolved';
}

export interface School extends Models.Document {
  name: string;
  location: string;
  adminId: string;
  status: string;
}

export interface Garage extends Models.Document {
  name: string;
  location: string;
  ownerId: string;
  status: string;
}

export interface Assignment extends Models.Document {
  title: string;
  description: string;
  courseId: string;
  instructorId: string;
  institutionId?: string;
  dueDate: string;
}

export interface ServiceRequest extends Models.Document {
  title: string;
  description: string;
  vehicleId: string;
  garageId: string;
  status: string;
  createdAt: string;
  assignedMechanicId?: string;
  finalCost?: string;
  notes?: string;
}

export interface AuditLog extends Models.Document {
  actorId: string;
  action: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface Application extends Models.Document {
  type: 'school' | 'garage';
  applicantId: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RepairGuide extends Models.Document {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  steps: string[]; // JSONB-like array of steps
  safetyNotes?: string;
  requiredTools?: string[];
  /** Optional estimated time to complete the procedure; UI falls back to 30 when absent. */
  estimatedMinutes?: number;
}

export interface ServiceRecord extends Models.Document {
  userId: string;
  vehicleId: string;
  serviceType: string;
  description?: string;
  mileage?: number;
  cost?: number;
  provider?: string;
  date: string;
  notes?: string;
  attachmentFileId?: string;
}

export interface ChatRecord extends Models.Document {
  userId: string;
  userMessage: string;
  aiResponse: string;
}

export interface DiagnosticResult {
  symptoms: string[];
  possible_causes: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'electrical' | 'mechanical' | 'diagnostics' | 'electronics';
  level: 'beginner' | 'intermediate' | 'advanced';
}
