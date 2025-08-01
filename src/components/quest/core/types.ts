// Quest-specific type definitions

// Question difficulty levels
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

// HonestyTag type definition (update as needed)
export type HonestyTag = 'Honest' | 'Sarcastic' | 'Unsure' | 'Avoiding';

// Question type
export interface Question {
  id: string;
  text: string;
  difficulty: QuestionDifficulty;
  type: 'multiple_choice' | 'text_input' | 'scale_rating' | 'image_choice' | 'date_input' | 'ranking';
  options?: string[];
  imageOptions?: string[];
  minScale?: number;
  maxScale?: number;
  tags?: string[];
  category?: string;
  sectionId?: string;
  allowTags?: boolean;
  placeholder?: string;
  additionalInput?: {
    type: string;
    label: string;
  };
  minLength?: number;       // Add this property
  maxLength?: number;       // Add this property
  hint?: string;            // Add this property
  labels?: Record<number, string>; // Add this property
}

// Response type
export interface QuestionResponse {
  questionId: string;
  response: string;
  tags?: HonestyTag[];
  timestamp: string;
}

// Session status
export type QuestSessionStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';

// Quest session
export interface QuestSession {
  id: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  status: QuestSessionStatus;
  currentQuestionIndex?: number;
  responses?: Record<string, QuestionResponse>;
  durationMinutes?: number;
  sectionId?: string;
  allowSkip?: boolean;
  visitedQuestions?: string[];  // Changed from Set to array for JSON serialization
  questionProgress?: Record<string, 'skipped' | 'answered'>;
}

// Quest result
export interface QuestResult {
  sessionId: string;
  userId: string;
  analysisData: any; // Will be replaced with specific AI analysis structure
  generatedAt: string;
}

// Context state
export interface QuestContextState {
  session: QuestSession | null;
  currentQuestion: Question | null;
  questions: Question[];
  isLoading: boolean;
  isSubmitting: boolean;
  progress: number;
  error: Error | null;
}

// Context actions
export interface QuestContextActions {
  startQuest: () => Promise<QuestSession | null>;
  submitResponse: (questionId: string, response: string, tags?: HonestyTag[]) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  finishQuest: (submissionData: any) => Promise<QuestResult | null>;
  resetQuest: () => void;
  skipQuestion: () => void;
  goToQuestion: (questionIndex: number) => void;
  editResponse: (questionId: string) => void;
}

export interface QuestionSection {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

// Full context type
export interface QuestContextValue extends QuestContextState, QuestContextActions {
  sections: QuestionSection[];
  currentSection: QuestionSection;
  currentSectionId: string;
  allQuestions: Question[];
  changeSection: (sectionId: string) => void;
  finishSection: () => boolean;
}