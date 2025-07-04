export type StaticPage = {
  id: string;
  static_page_type: string;
  content_ar: string;
  content_en: string;
  image: string;
  created_at: string;
  updated_at: string;
};

export interface StaticPageReqBody {
  static_page_type: string;
  content_ar: string;
  content_en: string;
  image?: string | File;
}
