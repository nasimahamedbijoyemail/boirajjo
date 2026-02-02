// Nilkhet book categories structure

export interface NilkhetSubcategory {
  id: string;
  name: string;
}

export interface NilkhetCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: NilkhetSubcategory[];
}

export const NILKHET_CATEGORIES: NilkhetCategory[] = [
  {
    id: 'bengali_books',
    name: 'Bengali Books',
    icon: '🔹',
    subcategories: [
      { id: 'bengali_novels', name: 'উপন্যাস (Novels)' },
      { id: 'bengali_short_stories', name: 'গল্প (Short Stories)' },
      { id: 'bengali_poetry', name: 'কবিতা (Poetry)' },
      { id: 'bengali_essays', name: 'প্রবন্ধ (Essays)' },
      { id: 'bengali_drama', name: 'নাটক (Drama)' },
      { id: 'bengali_children_teen', name: 'শিশু-কিশোর (Children & Teen)' },
      { id: 'bengali_liberation_war', name: 'মুক্তিযুদ্ধ (Liberation War)' },
      { id: 'bengali_history_heritage', name: 'ইতিহাস ও ঐতিহ্য (History & Heritage)' },
      { id: 'bengali_biography_memoir', name: 'জীবনী ও স্মৃতিকথা (Biography & Memoir)' },
      { id: 'bengali_religious', name: 'ধর্মীয় বই (Religious)' },
      { id: 'bengali_translated', name: 'অনুবাদ (Translated Books)' },
      { id: 'bengali_science_tech', name: 'বিজ্ঞান ও প্রযুক্তি (Science & Technology)' },
      { id: 'bengali_politics_social', name: 'রাজনীতি ও সমাজবিজ্ঞান (Politics & Social Science)' },
      { id: 'bengali_language_grammar', name: 'ভাষা ও ব্যাকরণ (Language & Grammar)' },
    ],
  },
  {
    id: 'english_books',
    name: 'English Books',
    icon: '🔹',
    subcategories: [
      { id: 'english_fiction', name: 'Fiction' },
      { id: 'english_non_fiction', name: 'Non-Fiction' },
      { id: 'english_academic_textbooks', name: 'Academic & Textbooks' },
      { id: 'english_business_economics', name: 'Business & Economics' },
      { id: 'english_self_help', name: 'Self-Help & Motivation' },
      { id: 'english_science_tech', name: 'Science & Technology' },
      { id: 'english_history_politics', name: 'History & Politics' },
      { id: 'english_biography_memoir', name: 'Biography & Memoir' },
      { id: 'english_religion_philosophy', name: 'Religion & Philosophy' },
      { id: 'english_children_ya', name: 'Children & Young Adult' },
      { id: 'english_comics_graphic', name: 'Comics & Graphic Novels' },
      { id: 'english_language_learning', name: 'Language Learning' },
    ],
  },
  {
    id: 'academic_study_books',
    name: 'Academic / Study Books',
    icon: '🔹',
    subcategories: [
      { id: 'academic_school', name: 'School (SSC / HSC)' },
      { id: 'academic_university', name: 'University Textbooks' },
      { id: 'academic_engineering', name: 'Engineering' },
      { id: 'academic_medical', name: 'Medical' },
      { id: 'academic_law', name: 'Law' },
      { id: 'academic_bcs_govt', name: 'BCS / Govt Job Preparation' },
      { id: 'academic_ielts_gre', name: 'IELTS / GRE / GMAT / SAT' },
      { id: 'academic_admission', name: 'Admission Test Guides' },
    ],
  },
  {
    id: 'religious_books',
    name: 'Religious Books',
    icon: '🔹',
    subcategories: [
      { id: 'religion_islam', name: 'Islam' },
      { id: 'religion_hinduism', name: 'Hinduism' },
      { id: 'religion_buddhism', name: 'Buddhism' },
      { id: 'religion_christianity', name: 'Christianity' },
      { id: 'religion_comparative', name: 'Comparative Religion' },
    ],
  },
  {
    id: 'children_books',
    name: 'Children & Young Readers',
    icon: '🔹',
    subcategories: [
      { id: 'children_picture', name: 'Picture Books' },
      { id: 'children_story', name: 'Story Books' },
      { id: 'children_rhymes', name: 'Rhymes' },
      { id: 'children_comics', name: 'Comics' },
      { id: 'children_educational', name: 'Educational Books' },
      { id: 'children_activity', name: 'Activity Books' },
    ],
  },
  {
    id: 'others_special',
    name: 'Others / Special',
    icon: '🔹',
    subcategories: [
      { id: 'special_best_sellers', name: 'Best Sellers' },
      { id: 'special_new_arrivals', name: 'New Arrivals' },
      { id: 'special_award_winning', name: 'Award-Winning Books' },
      { id: 'special_box_sets', name: 'Box Sets' },
      { id: 'special_journals', name: 'Journals & Diaries' },
      { id: 'special_stationery', name: 'Stationery (non-book items)' },
    ],
  },
];

// Flat list of all subcategories for easy lookup
export const ALL_NILKHET_SUBCATEGORIES = NILKHET_CATEGORIES.flatMap(
  (category) => category.subcategories
);

// Get label for a subcategory value
export const getNilkhetSubcategoryLabel = (id: string): string => {
  const item = ALL_NILKHET_SUBCATEGORIES.find((item) => item.id === id);
  return item?.name || id;
};

// Nilkhet book condition types
export const NILKHET_BOOK_CONDITIONS = [
  { value: 'old', label: 'Old Books' },
  { value: 'new', label: 'New Books' },
] as const;

export type NilkhetBookConditionType = 'old' | 'new';
