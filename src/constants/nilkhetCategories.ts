// Nilkhet book categories structure

export const NILKHET_CATEGORIES = {
  bengaliBooks: {
    label: '🔹 Bengali Books',
    items: [
      { value: 'bengali_novels', label: 'উপন্যাস (Novels)' },
      { value: 'bengali_short_stories', label: 'গল্প (Short Stories)' },
      { value: 'bengali_poetry', label: 'কবিতা (Poetry)' },
      { value: 'bengali_essays', label: 'প্রবন্ধ (Essays)' },
      { value: 'bengali_drama', label: 'নাটক (Drama)' },
      { value: 'bengali_children_teen', label: 'শিশু-কিশোর (Children & Teen)' },
      { value: 'bengali_liberation_war', label: 'মুক্তিযুদ্ধ (Liberation War)' },
      { value: 'bengali_history_heritage', label: 'ইতিহাস ও ঐতিহ্য (History & Heritage)' },
      { value: 'bengali_biography_memoir', label: 'জীবনী ও স্মৃতিকথা (Biography & Memoir)' },
      { value: 'bengali_religious', label: 'ধর্মীয় বই (Religious)' },
      { value: 'bengali_translated', label: 'অনুবাদ (Translated Books)' },
      { value: 'bengali_science_tech', label: 'বিজ্ঞান ও প্রযুক্তি (Science & Technology)' },
      { value: 'bengali_politics_social', label: 'রাজনীতি ও সমাজবিজ্ঞান (Politics & Social Science)' },
      { value: 'bengali_language_grammar', label: 'ভাষা ও ব্যাকরণ (Language & Grammar)' },
    ],
  },
  englishBooks: {
    label: '🔹 English Books',
    items: [
      { value: 'english_fiction', label: 'Fiction' },
      { value: 'english_non_fiction', label: 'Non-Fiction' },
      { value: 'english_academic_textbooks', label: 'Academic & Textbooks' },
      { value: 'english_business_economics', label: 'Business & Economics' },
      { value: 'english_self_help', label: 'Self-Help & Motivation' },
      { value: 'english_science_tech', label: 'Science & Technology' },
      { value: 'english_history_politics', label: 'History & Politics' },
      { value: 'english_biography_memoir', label: 'Biography & Memoir' },
      { value: 'english_religion_philosophy', label: 'Religion & Philosophy' },
      { value: 'english_children_ya', label: 'Children & Young Adult' },
      { value: 'english_comics_graphic', label: 'Comics & Graphic Novels' },
      { value: 'english_language_learning', label: 'Language Learning' },
    ],
  },
  academicStudyBooks: {
    label: '🔹 Academic / Study Books',
    items: [
      { value: 'academic_school', label: 'School (SSC / HSC)' },
      { value: 'academic_university', label: 'University Textbooks' },
      { value: 'academic_engineering', label: 'Engineering' },
      { value: 'academic_medical', label: 'Medical' },
      { value: 'academic_law', label: 'Law' },
      { value: 'academic_bcs_govt', label: 'BCS / Govt Job Preparation' },
      { value: 'academic_ielts_gre', label: 'IELTS / GRE / GMAT / SAT' },
      { value: 'academic_admission', label: 'Admission Test Guides' },
    ],
  },
  religiousBooks: {
    label: '🔹 Religious Books',
    items: [
      { value: 'religion_islam', label: 'Islam' },
      { value: 'religion_hinduism', label: 'Hinduism' },
      { value: 'religion_buddhism', label: 'Buddhism' },
      { value: 'religion_christianity', label: 'Christianity' },
      { value: 'religion_comparative', label: 'Comparative Religion' },
    ],
  },
  childrenBooks: {
    label: '🔹 Children & Young Readers',
    items: [
      { value: 'children_picture', label: 'Picture Books' },
      { value: 'children_story', label: 'Story Books' },
      { value: 'children_rhymes', label: 'Rhymes' },
      { value: 'children_comics', label: 'Comics' },
      { value: 'children_educational', label: 'Educational Books' },
      { value: 'children_activity', label: 'Activity Books' },
    ],
  },
  othersSpecial: {
    label: '🔹 Others / Special',
    items: [
      { value: 'special_best_sellers', label: 'Best Sellers' },
      { value: 'special_new_arrivals', label: 'New Arrivals' },
      { value: 'special_award_winning', label: 'Award-Winning Books' },
      { value: 'special_box_sets', label: 'Box Sets' },
      { value: 'special_journals', label: 'Journals & Diaries' },
      { value: 'special_stationery', label: 'Stationery (non-book items)' },
    ],
  },
};

// Flat list of all categories for easy lookup
export const ALL_NILKHET_SUBCATEGORIES = Object.values(NILKHET_CATEGORIES).flatMap(
  (category) => category.items
);

// Get label for a subcategory value
export const getNilkhetSubcategoryLabel = (value: string): string => {
  const item = ALL_NILKHET_SUBCATEGORIES.find((item) => item.value === value);
  return item?.label || value;
};

// Nilkhet book condition types
export const NILKHET_BOOK_CONDITIONS = [
  { value: 'old', label: 'Old Books' },
  { value: 'new', label: 'New Books' },
] as const;

export type NilkhetBookConditionType = 'old' | 'new';
