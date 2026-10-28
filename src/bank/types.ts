export type Domain = 'verbal' | 'quantitative';

export type OptionNumber = 1 | 2 | 3 | 4;

// hebrew text with math as inline latex between $ signs, e.g. "אם $x^2 = 9$ אז"
export type RichText = string;

// image paths are relative to the exam's folder in bank/
export type ImagePath = string;

export type Option = { text: RichText } | { image: ImagePath };

export type Question = {
  id: string;
  number: number;
  questionType: string;
  topic?: string;
  stem: RichText;
  options: Option[];
  correctOption: OptionNumber;
  figure?: ImagePath;
  questionSetId?: string;
};

export type Section = {
  number: number;
  domain: Domain;
  questions: Question[];
};

// offset is the character index in the passage text where that original line begins
export type LineMarker = { line: number; offset: number };

export type PassageSet = {
  id: string;
  kind: 'passage';
  questionIds: string[];
  text: string;
  lineMarkers: LineMarker[];
};

export type ChartSet = {
  id: string;
  kind: 'chart';
  questionIds: string[];
  image: ImagePath;
  intro?: RichText;
};

export type QuestionSet = PassageSet | ChartSet;

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type Exam = {
  id: string;
  season: Season;
  year: number;
  sample?: boolean;
  formulaSheet?: ImagePath;
  sections: Section[];
  questionSets: QuestionSet[];
};

export type QuestionBank = Exam[];
