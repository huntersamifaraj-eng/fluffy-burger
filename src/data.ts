import { Category, MenuItem } from './types';

export const SAUCE_OPTIONS: MenuItem[] = [
  {
    id: 'sc1',
    name: 'مكس صوص (5 أنواع)',
    description: 'مزيج مثالي من 5 صوصات مميزة.',
    price: 1.50,
    image: '/imeges/sauces1.jpg',
    category: Category.SAUCE,
  },
  {
    id: 'sc2',
    name: 'بافلو',
    description: 'صوص بافلو حار كلاسيكي.',
    price: 0.50,
    image: '/imeges/bafa1.jpg',
    category: Category.SAUCE,
  },
  {
    id: 'sc3',
    name: 'تشيلي',
    description: 'صوص فلفل حار.',
    price: 0.50,
    image: '/imeges/tche.jpg',
    category: Category.SAUCE,
  },
  {
    id: 'sc4',
    name: 'سويت تشيلي',
    description: 'صوص حلو وحار.',
    price: 0.50,
    image: '/imeges/swet1.jpg',
    category: Category.SAUCE,
  },
  {
    id: 'sc5',
    name: 'هني ماسترد',
    description: 'صوص الخردل بالعسل الكريمي.',
    price: 0.50,
    image: '/imeges/hane.jpg',
    category: Category.SAUCE,
  },
  {
    id: 'sc6',
    name: 'باربيكيو',
    description: 'صوص الشواء المدخن.',
    price: 0.50,
    image: '/imeges/barbe.jpg',
    category: Category.SAUCE,
  },
  {
    id: 'sc7',
    name: 'فلافي صوص',
    description: 'صوص فلافي السري الخاص.',
    price: 0.50,
    image: '/imeges/flaff.jpg',
    category: Category.SAUCE,
  },
  {
    id: 'sc8',
    name: 'رانش',
    description: 'صوص الرانش الكريمي.',
    price: 0.50,
    image: '/imeges/ran.jpg',
    category: Category.SAUCE,
  },
];

export const DRINK_OPTIONS: MenuItem[] = [
  {
    id: 'd1-opt',
    name: 'بيبسي',
    description: 'مشروب غازي كلاسيكي منعش.',
    price: 0.50,
    image: '/imeges/colo_.png',
    category: Category.DRINK,
  },
  {
    id: 'd2-opt',
    name: 'سفن أب',
    description: 'مشروب الليمون واللايم المنعش.',
    price: 0.50,
    image: '/imeges/siv1.webp',
    category: Category.DRINK,
  },
  {
    id: 'd3-opt',
    name: 'ميرندا برتقال',
    description: 'مشروب غازي بنكهة البرتقال اللذيذة.',
    price: 0.50,
    image: '/imeges/ora.png',
    category: Category.DRINK,
  },
  {
    id: 'd4-opt',
    name: 'مياه معدنية',
    description: 'مياه طبيعية نقية وصحية.',
    price: 0.50,
    image: '/imeges/wat.jpg',
    category: Category.DRINK,
  },
];

export const SNACK_OPTIONS: MenuItem[] = [
  {
    id: 'snack-1',
    name: 'حلقات بصل (6 حلقات)',
    description: 'حلقات بصل ذهبية مقرمشة.',
    price: 1.25,
    image: '/imeges/onion1.png',
    category: Category.APPETIZER,
  },
  {
    id: 'snack-2',
    name: 'موزاريلا ستيكس (4 حبات)',
    description: 'أصابع الجبنة المقلية مع صوص جانبي.',
    price: 1.75,
    image: '/imeges/moza__.png',
    category: Category.APPETIZER,
  },
  {
    id: 'snack-3',
    name: 'كرات تشيلي تشيز (5 حبات)',
    description: 'كرات الجبنة بالفلفل الحار.',
    price: 1.75,
    image: '/imeges/bool_.jpg',
    category: Category.APPETIZER,
  },
];

export const FRIES_OPTIONS: MenuItem[] = [
  {
    id: 'fry-1',
    name: 'فرنش فرايز',
    description: 'بطاطس مقلية كلاسيكية ذهبية ومقرمشة.',
    price: 1.00,
    image: '/imeges/fries.png',
    category: Category.APPETIZER,
  },
  {
    id: 'fry-2',
    name: 'ودجز',
    description: 'شرائح البطاطس المتبلة والمقلية.',
    price: 1.00,
    image: '/imeges/wadg_.png',
    category: Category.APPETIZER,
  },
  {
    id: 'fry-3',
    name: 'كيرلي فرايز',
    description: 'بطاطس لولبية متبلة بنكهة رائعة.',
    price: 1.50,
    image:'/imeges/curly.png',
    category: Category.APPETIZER,
  },
  {
    id: 'fry-4',
    name: 'بطاطا حلوة',
    description: 'بطاطا حلوة مقلية ولذيذة.',
    price: 1.25,
    image: 'https://picsum.photos/id/292/800/600',
    category: Category.APPETIZER,
  },
  {
    id: 'fry-5',
    name: 'بطاطا كرسكت',
    description: 'بطاطس شبكية مقرمشة.',
    price: 1.50,
    image: '/imeges/cres.png',
    category: Category.APPETIZER,
  },
];

export const STRIPS_OPTIONS: MenuItem[] = [
  {
    id: 'str-4',
    name: '4 قطع ستريبس',
    description: 'بطاطا - مشروب - 2 صوص',
    price: 3.75,
    image: '/imeges/crispy4.png',
    category: Category.APPETIZER,
  },
  {
    id: 'str-8',
    name: '8 قطع ستريبس',
    description: 'بطاطا - مشروب - 2 صوص',
    price: 7.50,
    image: '/imeges/crispy4.png',
    category: Category.APPETIZER,
  },
  {
    id: 'str-21',
    name: '21 قطعة ستريبس',
    description: 'بطاطا - مشروب - 2 صوص',
    price: 15.00,
    image: '/imeges/crispy4.png',
    category: Category.APPETIZER,
  },
  {
    id: 'str-1',
    name: 'قطعة واحدة',
    description: 'قطعة دجاج مقرمشة إضافية',
    price: 1.00,
    image: '/imeges/crispy4.png',
    category: Category.APPETIZER,
  },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 's1',
    name: 'Classic Burger - كلاسيك بيرجر',
    description: 'صدر دجاج 200 او 300 غ + بندورة + جرجير + جبنة + صوص رانش + تيركي',
    price: 3.50,
    image: '/imeges/classic.png',
    category: Category.SANDWICH,
  },
  {
    id: 's2',
    name: 'Bee Burger - بي برجر',
    description: 'صدر دجاج 200 او 300 غ + بندورة + خس + جبنة + صوص هني ماسترد',
    price: 3.50,
    image: '/imeges/bee.png',
    category: Category.SANDWICH,
  },
  {
    id: 's3',
    name: 'Fluffy Burger - فلافي برجر',
    description: 'صدر دجاج 200 او 300 غ + خس + جبنة + صوص فلافي',
    price: 3.75,
    image: '/imeges/fluffy.png',
    category: Category.SANDWICH,
  },
  {
    id: 's4',
    name: 'Chilli Burger - تشيلي برجر',
    description: 'صدر دجاج 200 او 300 غ + بندورة + خس + جبنة + صوص تشيلي + روست بيف + مخلل',
    price: 3.50,
    image:'/imeges/chilli.png',
    category: Category.SANDWICH,
  },
  {
    id: 's5-wrap',
    name: 'Crunchy Wrap - كرنشي راب',
    description: 'راب دجاج مقرمش ملفوف بخبز التورتيلا مع خس، جبنة، وصوص خاص.',
    price: 2.75,
    image:'/imeges/Wrap.png',
    category: Category.SANDWICH,
  },
  {
    id: 'cubes-main',
    name: 'Fluffy Cubes - فلافي كيوبس',
    description: 'مخلل + قطع كرسبي + فرايز + صوص',
    price: 4.00,
    image: '/imeges/cubes.png',
    category: Category.APPETIZER,
  },
  {
    id: 'strips-main',
    name: 'Crispy Chicken Strips - كريسبي تشكن ستريبس',
    description: 'قطع دجاج مقرمشة ذهبية مع خيارات وجبات متنوعة.',
    price: 1.00, 
    image: '/imeges/strips1.png',
    category: Category.APPETIZER,
  },
  {
    id: 'fries-main',
    name: 'Fries - البطاطس',
    description: 'تشكيلة متنوعة من البطاطس (فرنش، ودجز، كيرلي، حلوة، وكرسكت).',
    price: 1.00,
    image: '/imeges/fries44.jpg',
    category: Category.APPETIZER,
  },
  {
    id: 'snacks-main',
    name: 'Snacks - السناكات',
    description: 'تشكيلة مميزة من المقرمشات (حلقات بصل، موزاريلا ستيكس، وكرات الجبنة).',
    price: 1.25,
    image: '/imeges/snacks1.jpg',
    category: Category.APPETIZER,
  },
  {
    id: 'drinks-main',
    name: 'Drinks - المشروبات',
    description: 'تشكيلة منعشة من المشروبات الغازية والمياه.',
    price: 0.50,
    image: '/imeges/drinks.png',
    category: Category.DRINK,
  },
  {
    id: 'sauces-main',
    name: 'Sauces - الصوصات',
    description: 'أضف نكهة مميزة لوجبتك مع تشكيلتنا الواسعة من الصوصات.',
    price: 0.50,
    image: '/imeges/sauces1.jpg',
    category: Category.SAUCE,
  },
];

export const SANDWICH_MODIFICATIONS = [
    { id: 'no-pickle', name: 'بدون مخلل', price: 0 },
    { id: 'no-lettuce', name: 'بدون خس', price: 0 },
    { id: 'no-tomato', name: 'بدون بندورة', price: 0 },
    { id: 'no-onion', name: 'بدون بصل', price: 0 },
    { id: 'no-sauce', name: 'بدون صوص', price: 0 },
    { id: 'extra-cheese', name: 'إكسترا جبنة', price: 0.50 },
    { id: 'extra-jalapeno', name: 'إضافة هلابينو', price: 0.25 },
    { id: 'extra-sauce', name: 'إكسترا صوص', price: 0.25 },
];

export const CLASSIC_MODIFICATIONS = [
    { id: 'no-arugula', name: 'بدون جرجير', price: 0 },
    { id: 'no-tomato', name: 'بدون بندورة', price: 0 },
    { id: 'no-turkey', name: 'بدون تيركي', price: 0 },
    { id: 'no-cheese', name: 'بدون جبنة', price: 0 },
    { id: 'extra-turkey', name: 'إضافة تيركي', price: 0.50 },
    { id: 'extra-cheese', name: 'إضافة جبنة', price: 0.50 },
    { id: 'extra-jalapeno', name: 'إضافة هلابينو', price: 0.25 },
];

export const BEE_MODIFICATIONS = [
    { id: 'no-lettuce', name: 'بدون خس', price: 0 },
    { id: 'no-tomato', name: 'بدون بندورة', price: 0 },
    { id: 'no-cheese', name: 'بدون جبنة', price: 0 },
    { id: 'extra-cheese', name: 'إكسترا جبنة', price: 0.50 },
    { id: 'extra-jalapeno', name: 'إضافة هلابينو', price: 0.25 },
];

export const FLUFFY_MODIFICATIONS = [
    { id: 'no-lettuce', name: 'بدون خس', price: 0 },
    { id: 'no-cheese', name: 'بدون جبنة', price: 0 },
    { id: 'extra-cheese', name: 'إكسترا جبنة', price: 0.50 },
    { id: 'extra-jalapeno', name: 'إضافة هلابينو', price: 0.25 },
];

export const CHILLI_MODIFICATIONS = [
    { id: 'no-pickle', name: 'بدون مخلل', price: 0 },
    { id: 'no-lettuce', name: 'بدون خس', price: 0 },
    { id: 'no-tomato', name: 'بدون بندورة', price: 0 },
    { id: 'no-roast-beef', name: 'بدون روست بيف', price: 0 },
    { id: 'extra-cheese', name: 'إكسترا جبنة', price: 0.50 },
    { id: 'extra-roast-beef', name: 'إضافة روست بيف', price: 0.50 },
    { id: 'extra-jalapeno', name: 'إضافة هلابينو', price: 0.25 },
];

export const CRUNCHY_MODIFICATIONS = [
    { id: 'no-pickle', name: 'بدون مخلل', price: 0 },
    { id: 'no-lettuce', name: 'بدون خس', price: 0 },
    { id: 'no-cheese', name: 'بدون جبنة', price: 0 },
    { id: 'extra-cheese', name: 'إكسترا جبنة', price: 0.50 },
    { id: 'extra-jalapeno', name: 'إضافة هلابينو', price: 0.25 },
];