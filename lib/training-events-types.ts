export type TrainingFormat = "Hands-on" | "Seminer" | "Teorik + Uygulama";

export type Speaker = {
  name: string;
  /** Opsiyonel portre URL (https) */
  photoUrl?: string;
  /** Üniversite / eğitim satırları (çoğaltılabilir) */
  education: string[];
  /** Uzmanlık alanları */
  specialties: string[];
  /** Kısa biyografi */
  bio: string;
};

export type CurriculumItem = {
  time: string;
  topic: string;
  speaker?: string;
};

export type TrainingEvent = {
  slug: string;
  title: string;
  /** Liste / kart kapak görseli (https) */
  coverUrl?: string;
  /** Detay sayfası afiş / poster (https) */
  posterUrl?: string;
  dateISO: string;
  slotStart: string;
  slotEnd: string;
  dateDisplay: string;
  timeRange?: string;
  city: string;
  venue: string;
  venueAddress?: string;
  format: TrainingFormat;
  instructors: string[];
  excerpt: string;
  highlights?: string[];
  speakers?: Speaker[];
  curriculum?: CurriculumItem[];
};
