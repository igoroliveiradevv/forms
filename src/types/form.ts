export type QuestionType = 
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'email'
  | 'single_choice'
  | 'multiple_choice'
  | 'dropdown'
  | 'date'
  | 'rating'
  | 'text_only'
  | 'delay'
  | 'end_form';

export interface QuestionOption {
  id: string;
  question_id: string;
  label: string;
  order_index: number;
  created_at: string;
}

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description?: string;
  is_required: boolean;
  order_index: number;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  options?: QuestionOption[];
  // Variable name for this question's answer
  variable_name?: string;
}

export type FormType = 'conversational' | 'simple';

export interface Form {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  slug: string;
  is_active: boolean;
  is_draft: boolean;
  form_type: FormType;
  background_color: string;
  button_color: string;
  text_color: string;
  logo_url?: string;
  theme: string;
  thank_you_message: string;
  created_at: string;
  updated_at: string;
  questions?: Question[];
  response_count?: number;
  // Persona fields
  persona_name: string;
  persona_avatar_url?: string;
  persona_description?: string;
  user_bubble_color: string;
  persona_bubble_color: string;
  font_family: string;
  // Background gradient fields
  background_type: 'solid' | 'gradient';
  background_gradient_start?: string;
  background_gradient_end?: string;
  background_gradient_direction?: string;
}

export interface Response {
  id: string;
  form_id: string;
  submitted_at: string;
  respondent_ip?: string;
  respondent_user_agent?: string;
  answers?: ResponseAnswer[];
}

export interface ResponseAnswer {
  id: string;
  response_id: string;
  question_id: string;
  answer_text?: string;
  answer_options?: string[];
  answer_number?: number;
  answer_date?: string;
  answer_rating?: number;
  created_at: string;
}

export interface FormStyle {
  backgroundColor: string;
  buttonColor: string;
  textColor: string;
  logoUrl?: string;
  theme: string;
  thankYouMessage: string;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text_only: 'Mensagem da Persona',
  short_text: 'Texto Curto',
  long_text: 'Texto Longo',
  number: 'Número',
  email: 'E-mail',
  single_choice: 'Seleção Única',
  multiple_choice: 'Seleção Múltipla',
  dropdown: 'Dropdown',
  date: 'Data',
  rating: 'Avaliação',
  delay: 'Delay (Atraso)',
  end_form: 'Finalizar Formulário',
};

export const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Lato', label: 'Lato' },
] as const;

export const THEME_OPTIONS = [
  { value: 'corporate', label: 'Corporativo' },
  { value: 'modern', label: 'Moderno' },
  { value: 'minimal', label: 'Minimalista' },
  { value: 'elegant', label: 'Elegante' },
  { value: 'bold', label: 'Ousado' },
] as const;
