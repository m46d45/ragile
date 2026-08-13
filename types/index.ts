export type ContractorQualification =
  | "K1"
  | "K2"
  | "K3"
  | "Perorangan"
  | "Belum SBU"
  | "Lainnya";

export type PreferredChannel = "whatsapp" | "email" | "both";

export interface Member {
  id: string;
  name: string;
  company_name?: string | null;
  contractor_qualification?: ContractorQualification | null;
  main_field?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  preferred_channel: PreferredChannel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expert {
  id: string;
  name: string;
  field?: string | null;
  bio?: string | null;
  email?: string | null; // internal only
  phone?: string | null; // internal only
  is_available: boolean;
  practice_hours?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type QuestionStatus = "open" | "answered" | "closed";
export type QuestionSource = "web" | "whatsapp" | "diagnosa" | "lainnya";

export interface Question {
  id: string;
  member_id?: string | null;
  category_id?: number | null;
  sub_category_id?: number | null;
  content: string;
  is_public: boolean;
  status: QuestionStatus;
  source: QuestionSource;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
}

export type AnsweredByType = "ai" | "expert" | "team";

export interface Answer {
  id: string;
  question_id: string;
  answered_by_type: AnsweredByType;
  expert_id?: string | null;
  content: string;
  is_final: boolean;
  created_at: string;
}

export type ContentType =
  | "artikel"
  | "sop"
  | "template"
  | "checklist"
  | "video"
  | "lainnya";

export interface KnowledgeItem {
  id: string;
  title: string;
  slug: string;
  content_type: ContentType;
  content_text?: string | null;
  content_url?: string | null;
  category_id?: number | null;
  sub_category_id?: number | null;
  tags?: string[] | null;
  is_published: boolean;
  view_count: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export type ConversationStatus = "active" | "closed" | "escalated";
export type ConversationChannel = "web" | "whatsapp";

export interface Conversation {
  id: string;
  member_id?: string | null;
  session_id?: string | null;
  channel: ConversationChannel;
  status: ConversationStatus;
  escalated_to?: string | null;
  started_at: string;
  closed_at?: string | null;
}

export type MessageRole = "user" | "assistant" | "system" | "expert";

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata?: any;
  created_at: string;
}
