export type FaqCategory = {
  id: string;
  name_ar: string;
  name_en: string;
};
export type CategoryQuestion = {
  id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  order: number;
  faq_category: {
    id: string;
    name_ar: string;
    name_en: string;
  };
};
