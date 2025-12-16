import * as React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Category, MenuItem, CartItem, ViewState } from './types';
import { MENU_ITEMS, SAUCE_OPTIONS, DRINK_OPTIONS, SNACK_OPTIONS, FRIES_OPTIONS, STRIPS_OPTIONS, SANDWICH_MODIFICATIONS, CLASSIC_MODIFICATIONS, BEE_MODIFICATIONS, FLUFFY_MODIFICATIONS, CHILLI_MODIFICATIONS, CRUNCHY_MODIFICATIONS } from './data';
import { MenuCard } from './components/MenuCard';
import { CartView } from './components/CartView';
import * as emailjs from '@emailjs/browser';
import type { EmailJSResponseStatus } from '@emailjs/browser'; // Make sure to run: npm install @emailjs/browser

const MEAL_UPCHARGE = 1.25; // Difference between Sandwich and Meal price for regular burgers

// Types for Checkout Flow
type CheckoutStep = 'method' | 'branch' | 'info' | 'payment' | 'processing' | 'success' | null;
type OrderType = 'delivery' | 'pickup';
type PaymentMethod = 'visa' | 'click';

interface OrderData {
  id: string | null; // Added Order ID
  timestamp: string | null; // Added Timestamp
  type: OrderType | null;
  branch: string | null;
  area: string | null; // Added area for delivery routing
  name: string;
  phone: string;
  address: string;
  payment: PaymentMethod | null;
  total: string; // Added to persist total amount after cart clear
}

// Delivery Areas Mapping
const DELIVERY_ZONES = [
  // Zarqa Areas
  { name: 'الزرقاء الجديدة', branch: 'الزرقاء - الزرقاء الجديدة', code: 'ZAR' },
  { name: 'مدينة الزرقاء', branch: 'الزرقاء - الزرقاء الجديدة', code: 'ZAR' },
  { name: 'شارع الجيش', branch: 'الزرقاء - الزرقاء الجديدة', code: 'ZAR' },
  { name: 'حي معصوم', branch: 'الزرقاء - الزرقاء الجديدة', code: 'ZAR' },
  
  // Rabieh Branch Areas
  { name: 'الرابية', branch: 'عمان - الرابية', code: 'RAB' },
  { name: 'تلاع العلي', branch: 'عمان - الرابية', code: 'RAB' },
  { name: 'أم أذينة', branch: 'عمان - الرابية', code: 'RAB' },
  { name: 'الشميساني', branch: 'عمان - الرابية', code: 'RAB' },
  { name: 'الجاردنز', branch: 'عمان - الرابية', code: 'RAB' },

  // Jubaiha Branch Areas
  { name: 'الجبيهة', branch: 'عمان - الجبيهة', code: 'JUB' },
  { name: 'الجامعة الأردنية', branch: 'عمان - الجبيهة', code: 'JUB' },
  { name: 'شفا بدران', branch: 'عمان - الجبيهة', code: 'JUB' },
  { name: 'أبو نصير', branch: 'عمان - الجبيهة', code: 'JUB' },
  { name: 'ضاحية الرشيد', branch: 'عمان - الجبيهة', code: 'JUB' },
];

// --- Toast Component ---
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-dark/95 backdrop-blur-md text-white px-8 py-6 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-[100] flex flex-col items-center justify-center gap-4 animate-fade-in border-4 border-brand-green font-sans w-[85%] max-w-sm text-center">
      <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30 animate-bounce">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
         </svg>
      </div>
      <div className="flex flex-col gap-1">
         <span className="font-black text-2xl text-brand-yellow">رائع!</span>
         <span className="font-bold text-lg leading-snug text-gray-100">{message}</span>
      </div>
    </div>
  );
};

// --- Hero Slider Component ---
const HeroSlider = ({ items, onOrderNow }: { items: MenuItem[], onOrderNow: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000); // Change slide every 4 seconds
    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden group shadow-2xl mb-12 font-sans rounded-b-[3rem] md:rounded-none">
      {/* Background Slides */}
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Image Background with Gradient Overlay */}
          <div className="absolute inset-0 bg-brand-dark">
             <img 
               src={item.image} 
               alt={item.name} 
               className="w-full h-full object-cover opacity-70 mix-blend-normal"
             />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          
          {/* Content */}
          <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-center items-start text-white">
             <div className="max-w-3xl space-y-4 md:space-y-6 animate-fade-in-up pt-10">
                <span className="inline-block bg-brand-orange text-white px-4 py-1 rounded-full text-xs md:text-sm font-bold tracking-widest uppercase mb-2">
                  مميز {item.category === Category.SANDWICH ? 'ساندوتش' : item.category === Category.DRINK ? 'مشروب' : item.category === Category.APPETIZER ? 'مقبلات' : 'صوص'}
                </span>
                
                <h2 className="text-5xl md:text-8xl font-heading font-black leading-tight drop-shadow-lg text-white">
                  {item.name}
                </h2>
                <p className="text-lg md:text-3xl text-gray-100 font-medium max-w-lg leading-relaxed drop-shadow-md">
                  {item.description}
                </p>
                <div className="flex items-center gap-4 md:gap-6 pt-4">
                  <button 
                    onClick={onOrderNow}
                    className="px-6 md:px-8 py-3 md:py-4 bg-brand-red hover:bg-white hover:text-brand-red text-white rounded-full font-black text-lg md:text-xl transition-all transform hover:scale-105 shadow-lg shadow-red-900/50"
                  >
                    اطلب الآن
                  </button>
                  <span className="text-3xl md:text-4xl font-heading font-black text-brand-yellow drop-shadow-md">
                    {item.price} JD
                  </span>
                </div>
             </div>
          </div>
        </div>
      ))}

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-brand-orange w-6 md:w-8' : 'bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// --- Contact View Component ---
// --- Contact View Component ---
interface ContactViewProps {
  onShowToast: (msg: string) => void;
}

const ContactView = ({ onShowToast }: ContactViewProps) => {
  const form = useRef<HTMLFormElement>(null);
  const [isSending, setIsSending] = useState(false);

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.current) return;

    setIsSending(true);

    emailjs
      .sendForm(
        'service_7r5v124',
        'template_d7rbzbr',
        form.current,
        'Fn6M6zQDK99lZQLWk'
      )
      .then(
        (result: EmailJSResponseStatus) => {
          console.log(result.text);
          setIsSending(false);
          onShowToast('تم إرسال رسالتك بنجاح! سنرد عليك قريباً.');
          form.current?.reset();
        },
        (error: unknown) => {
          console.log(error);
          setIsSending(false);
          alert('حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.');
        }
      );
  };

  return (
    <div className="w-full container mx-auto px-4 py-8 animate-fade-in font-sans pb-32">
      <div className="text-center py-8 mb-8">
        <div className="inline-block bg-white/90 backdrop-blur-md px-8 py-4 md:px-10 md:py-6 rounded-[3rem] shadow-xl border-b-8 border-brand-green relative overflow-hidden">
          <h2 className="text-4xl md:text-6xl font-heading font-black text-brand-dark">
            تواصل <span className="text-brand-green">معنا</span>
          </h2>
          <p className="text-gray-500 font-bold mt-2">نحن نحب سماع رأيك!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Left Column: Info & Map */}
        <div className="space-y-8">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg border-l-8 border-brand-orange hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl mb-4">📍</div>
              <h3 className="font-heading font-black text-xl text-brand-dark mb-4">زورونا</h3>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-3 h-3 bg-brand-orange rounded-full mt-1.5 flex-shrink-0"></span>
                  <p className="text-gray-600 font-bold text-sm leading-snug">
                    <span className="text-brand-dark block text-base mb-0.5">الزرقاء</span>
                    الزرقاء الجديدة - شارع الكرامة
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-3 h-3 bg-brand-orange rounded-full mt-1.5 flex-shrink-0"></span>
                  <p className="text-gray-600 font-bold text-sm leading-snug">
                    <span className="text-brand-dark block text-base mb-0.5">عمان - الرابية</span>
                    شارع اسلام اياد
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-3 h-3 bg-brand-orange rounded-full mt-1.5 flex-shrink-0"></span>
                  <p className="text-gray-600 font-bold text-sm leading-snug">
                    <span className="text-brand-dark block text-base mb-0.5">عمان - الجبيهة</span>
                    بالقرب من اشارات المنهل
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border-l-8 border-brand-green hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl mb-4">📞</div>
              <h3 className="font-heading font-black text-xl text-brand-dark mb-2">اتصل بنا</h3>
              <p className="text-gray-500 text-lg leading-relaxed font-bold font-heading">
                0787218880
              </p>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="bg-brand-dark text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
            <h3 className="text-2xl font-heading font-black mb-6 flex items-center gap-3">
              <span className="text-brand-yellow">⏰</span> ساعات العمل
            </h3>
            <div className="space-y-3 font-medium">
              <div className="flex justify-between pb-2">
                <span>يومياً (السبت - الجمعة)</span>
                <span className="text-brand-yellow" dir="ltr">12:00 PM - 01:30 AM</span>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="h-64 bg-gray-200 rounded-3xl overflow-hidden shadow-lg border-4 border-white relative group">
            <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
              <div className="text-gray-400 font-bold text-xl">الخريطة</div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">
              <div className="text-brand-red text-5xl drop-shadow-lg animate-bounce">📍</div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 h-fit">
          <h3 className="text-3xl font-heading font-black text-brand-dark mb-6"> للشكاوي والاقتراحات 📝</h3>

          <form ref={form} className="space-y-6" onSubmit={sendEmail}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل</label>
              <input
                type="text"
                name="user_name"
                required
                className="w-full px-5 py-4 bg-brand-cream rounded-xl border-2 border-transparent focus:border-brand-orange outline-none transition-all font-medium text-brand-dark placeholder-gray-400"
                placeholder="الاسم"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                name="user_email"
                required
                className="w-full px-5 py-4 bg-brand-cream rounded-xl border-2 border-transparent focus:border-brand-orange outline-none transition-all font-medium text-brand-dark placeholder-gray-400"
                placeholder="example@mail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الرسالة</label>
              <textarea
                rows={4}
                name="message"
                required
                className="w-full px-5 py-4 bg-brand-cream rounded-xl border-2 border-transparent focus:border-brand-orange outline-none transition-all font-medium text-brand-dark placeholder-gray-400 resize-none"
                placeholder="كيف يمكننا مساعدتك؟"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className={`w-full py-4 rounded-xl font-black text-lg shadow-lg shadow-red-200 transition-all transform active:scale-95 ${
                isSending ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-brand-red hover:bg-red-700 text-white hover:-translate-y-1'
              }`}
            >
              {isSending ? 'جاري الإرسال...' : 'إرسال'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Meal, Sauce, Snack, Fries, Strips & Sandwich Size Selection State
  const [showMealModal, setShowMealModal] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false); // NEW MODAL
  const [showSauceModal, setShowSauceModal] = useState(false);
  const [showDrinkModal, setShowDrinkModal] = useState(false);
  const [showSnackModal, setShowSnackModal] = useState(false);
  const [showFriesModal, setShowFriesModal] = useState(false);
  const [showStripsModal, setShowStripsModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<'200g' | '300g' | 'standard'>('200g'); // Added 'standard' for items without weights
  const [isMealSelected, setIsMealSelected] = useState(false); // New state to store meal choice
  const [selectedModifications, setSelectedModifications] = useState<string[]>([]); // New state for customizations

  // Menu Category Filter State (Replaces ScrollSpy)
  const [activeCategory, setActiveCategory] = useState<Category>(Category.SANDWICH);

  // Checkout Flow State
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(null);
  const [orderData, setOrderData] = useState<OrderData>({
    id: null,
    timestamp: null,
    type: null,
    branch: null,
    area: null,
    name: '',
    phone: '',
    address: '',
    payment: null,
    total: '0.00'
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = cartTotal.toFixed(2); // Prices are inclusive of tax

  // --- Cart Actions ---
  const handleAddToCartClick = (item: MenuItem) => {
    // Reset modifications whenever a new item is selected
    setSelectedModifications([]);
    setIsMealSelected(false);

    if (item.category === Category.SANDWICH) {
      setPendingItem(item);
      // Check if it's the Crunchy Wrap which skips weight selection
      if (item.id === 's5-wrap') {
        setSelectedSize('standard');
        setShowMealModal(true);
      } else {
        setShowSizeModal(true); // Standard burgers with weights
      }
    } else if (item.category === Category.SAUCE) {
      setShowSauceModal(true);
    } else if (item.category === Category.DRINK) {
      setShowDrinkModal(true);
    } else if (item.id === 'snacks-main') {
      setShowSnackModal(true);
    } else if (item.id === 'fries-main') {
      setShowFriesModal(true);
    } else if (item.id === 'strips-main') {
      setShowStripsModal(true); // Open Strips Modal
    } else {
      addToCartDirectly(item);
      showToast(`تمت إضافة ${item.name} لطلبك!`);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  // Step 2: Handle Size Selection
  const handleSizeSelect = (size: '200g' | '300g') => {
    setSelectedSize(size);
    setShowSizeModal(false);
    setShowMealModal(true); // Step 3: Open Meal Modal
  };

  // Determine current modification list based on item
  const currentModifications = useMemo(() => {
    if (pendingItem?.id === 's1') return CLASSIC_MODIFICATIONS;
    if (pendingItem?.id === 's2') return BEE_MODIFICATIONS;
    if (pendingItem?.id === 's3') return FLUFFY_MODIFICATIONS;
    if (pendingItem?.id === 's4') return CHILLI_MODIFICATIONS;
    if (pendingItem?.id === 's5-wrap') return CRUNCHY_MODIFICATIONS;
    return SANDWICH_MODIFICATIONS;
  }, [pendingItem]);

  // Toggle Modification
  const toggleModification = (modId: string) => {
    setSelectedModifications(prev => {
      if (prev.includes(modId)) {
        return prev.filter(id => id !== modId);
      } else {
        return [...prev, modId];
      }
    });
  };

  // Calculate Extra Price for Add-ons
  const getAddonsPrice = () => {
    return selectedModifications.reduce((total, modId) => {
      const mod = currentModifications.find(m => m.id === modId);
      return total + (mod?.price || 0);
    }, 0);
  };

  // Helper to calculate prices for the modal display
  const getSandwichPrice = (size: '200g' | '300g' | 'standard') => {
    if (!pendingItem) return 0;
    
    let base = 0;
    if (size === 'standard') {
       base = pendingItem.price;
    } else {
       base = size === '300g' ? pendingItem.price + 1.00 : pendingItem.price;
    }
    return base;
  };

  const getMealPrice = (size: '200g' | '300g' | 'standard') => {
    if (pendingItem?.id === 's5-wrap') return 4.25; 
    return getSandwichPrice(size) + MEAL_UPCHARGE;
  };

  // Step 3: Choose Meal vs Sandwich (Does NOT add to cart yet)
  const handleMealChoice = (isMeal: boolean) => {
    setIsMealSelected(isMeal);
    setShowMealModal(false);
    setShowCustomizationModal(true); // Move to Step 4
  };

  // Step 4: Finalize Order with Customizations
  const confirmCustomizationAndAdd = () => {
    if (!pendingItem) return;

    const basePrice = isMealSelected ? getMealPrice(selectedSize) : getSandwichPrice(selectedSize);
    const addonsCost = getAddonsPrice();
    const finalPrice = basePrice + addonsCost;
    
    let nameSuffix = '';
    // Only add size to name if it's 200g or 300g
    if (selectedSize !== 'standard') {
      nameSuffix = `(${selectedSize})`;
    }

    if (isMealSelected) {
      nameSuffix += ' - وجبة';
    } else {
      nameSuffix += ' - ساندوتش';
    }

    // Prepare list of customization names for display
    const selectedModNames = selectedModifications.map(id => {
       const mod = currentModifications.find(m => m.id === id);
       return mod ? mod.name : '';
    }).filter(Boolean);

    const cartItem: CartItem = {
      ...pendingItem,
      id: `${pendingItem.id}-${selectedSize}-${isMealSelected ? 'meal' : 'solo'}-${Date.now()}`, // Unique ID for every custom burger
      name: `${pendingItem.name} ${nameSuffix}`,
      price: finalPrice,
      quantity: 1,
      customizations: selectedModNames // Save selected mods
    };

    addToCartDirectly(cartItem);
    
    // Customized professional toast message
    let msg = `تم إضافة ${pendingItem.name} لطلبك! اختيار مميز 👌`;
    showToast(msg);
    setShowCustomizationModal(false);
    setPendingItem(null);
  };

  const addToCartDirectly = (item: MenuItem | CartItem) => {
    setCart(prev => {
      // For items with customizations, we always add as new line item to preserve specific mods
      if ('customizations' in item && item.customizations && item.customizations.length > 0) {
         return [...prev, { ...item, quantity: 1 } as CartItem];
      }
      
      // For simple items, stack them
      const existing = prev.find(i => i.name === item.name && (!i.customizations || i.customizations.length === 0)); 
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 } as CartItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        return { ...i, quantity: Math.max(1, i.quantity + delta) };
      }
      return i;
    }));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // --- Checkout Flow Handlers ---

  const startCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutStep('method');
  };

  const handleMethodSelect = (type: OrderType) => {
    if (type === 'pickup') {
      setOrderData({ ...orderData, type, address: 'استلام من الفرع' });
      setCheckoutStep('branch');
    } else {
      setOrderData({ ...orderData, type, branch: null, area: null });
      setCheckoutStep('info');
    }
  };

  const handleBranchSelect = (branchName: string) => {
    setOrderData({ ...orderData, branch: branchName });
    setCheckoutStep('info');
  };

  // Handle Delivery Area Selection
  const handleAreaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAreaName = e.target.value;
    const selectedZone = DELIVERY_ZONES.find(z => z.name === selectedAreaName);
    
    if (selectedZone) {
      setOrderData({ 
        ...orderData, 
        area: selectedAreaName,
        branch: selectedZone.branch 
      });
    }
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('payment');
  };

  // Generate a unique Order ID based on branch
  const generateOrderId = (branchName: string | null) => {
    let code = 'GEN'; // Generic default
    if (branchName) {
      if (branchName.includes('الزرقاء')) code = 'ZAR';
      if (branchName.includes('الرابية')) code = 'RAB';
      if (branchName.includes('الجبيهة')) code = 'JUB';
    }
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    return `${code}-${randomNum}`;
  };

  const handlePaymentSelect = (payment: PaymentMethod) => {
    // Generate Order Details
    const finalOrderId = generateOrderId(orderData.branch);
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString('en-GB');

    setOrderData({ 
      ...orderData, 
      payment, 
      id: finalOrderId,
      timestamp: `${dateString} - ${timeString}`,
      total: finalTotal // SAVE THE TOTAL HERE BEFORE CLEARING CART
    });
    setCheckoutStep('processing');
    
    // Simulate Payment Processing
    setTimeout(() => {
      setCheckoutStep('success');
      // Clear cart after success
      setCart([]);
    }, 2500);
  };

  const closeCheckout = () => {
    setCheckoutStep(null);
    setOrderData({ id: null, timestamp: null, type: null, branch: null, area: null, name: '', phone: '', address: '', payment: null, total: '0.00' });
  };

  const sandwiches = MENU_ITEMS.filter(item => item.category === Category.SANDWICH);
  const appetizers = MENU_ITEMS.filter(item => item.category === Category.APPETIZER);
  const drinks = MENU_ITEMS.filter(item => item.category === Category.DRINK);

  const featuredItems: MenuItem[] = [];
  if (sandwiches.length > 0) featuredItems.push(sandwiches[0]);
  if (drinks.length > 0) featuredItems.push(drinks[0]); 
  if (appetizers.length > 0) featuredItems.push(appetizers[0]);

  // Filter items based on active category
  const getFilteredItems = () => {
    return MENU_ITEMS.filter(item => item.category === activeCategory);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative pb-24 md:pb-0">
      
      {/* Toast Notification */}
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* FIXED BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-brand-orange">
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 1440 900" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Layer 1 - Red - Middle Wave */}
          <path 
            fill="#E43428" 
            fillOpacity="1" 
            d="M0 320 C 400 200, 900 450, 1440 280 V 900 H 0 Z" 
          />
          
          {/* Layer 2 - Green - Right/Bottom Wave */}
          <path 
            fill="#8BC53F" 
            fillOpacity="1" 
            d="M1440 400 C 1000 550, 700 500, 500 900 H 1440 Z" 
          />
          
          {/* Layer 3 - Yellow - Left/Bottom Wave */}
          <path 
            fill="#F7C443" 
            fillOpacity="1" 
            d="M0 600 C 400 500, 600 700, 800 900 H 0 Z" 
          />
        </svg>
      </div>

      {/* Navbar */}
      <nav className="bg-white sticky top-0 z-40 rounded-b-[1.5rem] md:rounded-b-[2.5rem] border-b-4 md:border-b-8 border-brand-yellow shadow-2xl shadow-brand-orange/20 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20 md:h-24">
            
            <div 
              className="flex items-center gap-3 cursor-pointer group hover:scale-105 transition-transform" 
              onClick={() => setActiveView('home')}
            >
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden flex items-center justify-center">
                  <img src="/imeges/logo2.png" alt="Fluffy Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col -space-y-2 justify-center">
                <h1 className="text-2xl md:text-3xl text-black font-black tracking-wide font-logo leading-none uppercase">
                  𝐅𝐋𝐔𝐅𝐅𝐘 
                </h1>
                <span className="text-2xl md:text-3xl text-black font-black tracking-wide font-logo leading-none uppercase">
                  𝐁𝐔𝐑𝐆𝐄𝐑
                </span>
              </div>
            </div>

            <div className="hidden md:flex bg-orange-50/50 p-2 rounded-full border border-orange-100 gap-2 font-sans">
              <button
                onClick={() => setActiveView('home')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 transform ${
                  activeView === 'home' 
                    ? 'bg-brand-red text-white shadow-lg shadow-red-200 scale-105' 
                    : 'text-brand-brown hover:text-brand-orange hover:bg-orange-100/50'
                }`}
              >
                🏠 الرئيسية
              </button>
              <button
                onClick={() => setActiveView('menu')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 transform ${
                  activeView === 'menu' 
                    ? 'bg-brand-red text-white shadow-lg shadow-red-200 scale-105' 
                    : 'text-brand-brown hover:text-brand-orange hover:bg-orange-100/50'
                }`}
              >
                🍽️ المنيو
              </button>
              <button
                onClick={() => setActiveView('contact')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 transform ${
                  activeView === 'contact' 
                    ? 'bg-brand-green text-white shadow-lg shadow-green-200 scale-105' 
                    : 'text-brand-brown hover:text-brand-orange hover:bg-orange-100/50'
                }`}
              >
                📞 تواصل
              </button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => setActiveView('cart')}
                className={`relative p-3 rounded-2xl transition-all duration-300 group border-4 border-transparent ${
                  activeView === 'cart' 
                    ? 'bg-brand-green text-white shadow-lg shadow-green-200 rotate-3' 
                    : 'bg-brand-green text-white hover:bg-green-600 hover:scale-110 shadow-md'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-yellow text-brand-brown border-2 border-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full animate-bounce-slow shadow-sm font-sans">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* Mobile Header Icons: Just Cart Status if wanted, but clean is better */}
            <div className="md:hidden">
                <div className={`text-xs font-bold px-3 py-1 rounded-full ${cartCount > 0 ? 'bg-brand-green text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                    {cartCount > 0 ? `${cartCount} وجبات` : 'لا توجد طلبات'}
                </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`flex-grow relative z-10 ${activeView === 'cart' || activeView === 'contact' ? 'container mx-auto px-4 py-8' : 'w-full'}`}>
        {/* VIEW COMPONENTS */}
        {activeView === 'home' && (
          <div className="w-full animate-fade-in font-sans">
             <HeroSlider items={featuredItems} onOrderNow={() => setActiveView('menu')} />
             <div className="container mx-auto px-4 pb-20">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-8 md:h-10 w-2 md:w-3 bg-brand-orange rounded-full shadow-md border-2 border-white"></div>
                    <h2 className="text-3xl md:text-4xl font-heading font-black text-white drop-shadow-md">الأكثر طلباً</h2>
                  </div>
                  <button onClick={() => setActiveView('menu')} className="bg-white px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-full text-brand-orange font-bold hover:bg-brand-dark hover:text-white transition-all shadow-lg">عرض الكل &rarr;</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[sandwiches[0], appetizers[1], drinks[0], sandwiches[2]].map(item => (
                   item && <MenuCard key={item.id} item={item} onAdd={handleAddToCartClick} />
                 ))}
               </div>
             </div>
          </div>
        )}

        {activeView === 'menu' && (
          <div className="animate-fade-in flex flex-col w-full font-sans">
            <div className="text-center py-8 md:py-12">
              <div className="inline-block bg-white/95 backdrop-blur-md px-6 py-6 md:px-10 md:py-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl border-b-8 border-brand-orange relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-brand-yellow"></div>
                <span className="text-brand-red font-black tracking-widest uppercase text-xs md:text-sm mb-2 block">لذيذ وطازج</span>
                <h2 className="text-4xl md:text-7xl font-heading font-black text-brand-dark">
                  قائمة <span className="text-brand-orange relative inline-block">
                    الطعام
                    <svg className="absolute w-full h-2 md:h-3 -bottom-1 left-0 text-brand-yellow" viewBox="0 0 100 10" preserveAspectRatio="none">
                       <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                    </svg>
                  </span>
                </h2>
              </div>
            </div>

            {/* TABBED NAVIGATION */}
            <div className="sticky top-20 md:top-24 z-30 bg-white/90 backdrop-blur-md border-b-4 border-brand-yellow/50 py-3 mb-8 shadow-lg transition-all">
              <div className="container mx-auto flex justify-center gap-2 px-2">
                <button 
                  onClick={() => setActiveCategory(Category.SANDWICH)} 
                  className={`flex-1 md:flex-none md:w-32 px-1 py-3 rounded-2xl md:rounded-full font-bold transition-all duration-300 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 ${
                    activeCategory === Category.SANDWICH 
                      ? 'bg-brand-orange text-white shadow-lg scale-105' 
                      : 'text-brand-dark hover:bg-orange-100 bg-gray-50'
                  }`}
                >
                  <span className="text-2xl md:text-xl">🍔</span>
                  <span className="text-xs md:text-lg">ساندوتش</span>
                </button>
                <button 
                  onClick={() => setActiveCategory(Category.APPETIZER)} 
                  className={`flex-1 md:flex-none md:w-32 px-1 py-3 rounded-2xl md:rounded-full font-bold transition-all duration-300 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 ${
                    activeCategory === Category.APPETIZER 
                      ? 'bg-brand-green text-white shadow-lg scale-105' 
                      : 'text-brand-dark hover:bg-green-100 bg-gray-50'
                  }`}
                >
                   <span className="text-2xl md:text-xl">🍟</span>
                   <span className="text-xs md:text-lg">مقبلات</span>
                </button>
                <button 
                  onClick={() => setActiveCategory(Category.DRINK)} 
                  className={`flex-1 md:flex-none md:w-32 px-1 py-3 rounded-2xl md:rounded-full font-bold transition-all duration-300 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 ${
                    activeCategory === Category.DRINK 
                      ? 'bg-brand-yellow text-brand-brown shadow-lg scale-105' 
                      : 'text-brand-dark hover:bg-yellow-100 bg-gray-50'
                  }`}
                >
                   <span className="text-2xl md:text-xl">🥤</span>
                   <span className="text-xs md:text-lg">مشروبات</span>
                </button>
                <button 
                  onClick={() => setActiveCategory(Category.SAUCE)} 
                  className={`flex-1 md:flex-none md:w-32 px-1 py-3 rounded-2xl md:rounded-full font-bold transition-all duration-300 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 ${
                    activeCategory === Category.SAUCE 
                      ? 'bg-brand-red text-white shadow-lg scale-105' 
                      : 'text-brand-dark hover:bg-red-100 bg-gray-50'
                  }`}
                >
                   <span className="text-2xl md:text-xl">🥣</span>
                   <span className="text-xs md:text-lg">صوصات</span>
                </button>
              </div>
            </div>

            {/* Filtered Content Area */}
            <div className="container mx-auto px-4 pb-20 min-h-[500px]">
              <div className="animate-fade-in" key={activeCategory}>
                <div className="flex items-center gap-4 mb-8 justify-center md:justify-start">
                  <div className={`bg-white p-3 rounded-2xl shadow-lg flex items-center gap-3 pr-6 border-l-8 ${
                    activeCategory === Category.SANDWICH ? 'border-brand-orange' :
                    activeCategory === Category.APPETIZER ? 'border-brand-green' :
                    activeCategory === Category.DRINK ? 'border-brand-yellow' : 'border-brand-red'
                  }`}>
                    <div className={`h-10 w-10 md:h-14 md:w-14 rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-inner ${
                      activeCategory === Category.SANDWICH ? 'bg-orange-100 text-brand-orange' :
                      activeCategory === Category.APPETIZER ? 'bg-green-100 text-brand-green' :
                      activeCategory === Category.DRINK ? 'bg-yellow-100 text-brand-yellow' : 'bg-red-100 text-brand-red'
                    }`}>
                      {activeCategory === Category.SANDWICH ? '🍔' : 
                       activeCategory === Category.APPETIZER ? '🍟' :
                       activeCategory === Category.DRINK ? '🥤' : '🥣'}
                    </div>
                    <h3 className="text-2xl md:text-4xl font-heading font-black text-brand-dark">
                      {activeCategory === Category.SANDWICH ? 'الساندوتشات' : 
                       activeCategory === Category.APPETIZER ? 'المقبلات' :
                       activeCategory === Category.DRINK ? 'المشروبات' : 'الصوصات'}
                    </h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {getFilteredItems().map((item) => (
                    <MenuCard key={item.id} item={item} onAdd={handleAddToCartClick} />
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {activeView === 'cart' && (
          <CartView 
            cart={cart} 
            onRemove={removeFromCart} 
            onUpdateQuantity={updateQuantity}
            onCheckout={startCheckout}
          />
        )}

        {activeView === 'contact' && <ContactView onShowToast={showToast} />}
      </main>

      {/* Footer */}
      <footer className="bg-brand-brown text-brand-yellow py-8 md:py-12 mt-auto relative z-10 border-t-8 border-brand-orange font-sans pb-28 md:pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-logo text-white mb-2">FLUFFY <span className="text-brand-orange">BURGER</span></h2>
              <p className="text-brand-yellow/80 text-sm font-medium">The authentic burger taste, fluffy and delicious.</p>
            </div>
            
            <div className="flex gap-8 font-bold text-lg flex-wrap justify-center">
              <a href="#" className="text-white hover:text-brand-orange transition-colors">About Us</a>
              <a href="#" className="text-white hover:text-brand-orange transition-colors">Branches</a>
              <a href="#" onClick={() => setActiveView('contact')} className="text-white hover:text-brand-orange transition-colors">Contact</a>
            </div>
            
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/fluffyburgerjo/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-orange transition-colors text-white hover:scale-110 transform duration-300"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-white/10 mt-10 pt-8 text-center text-white/40 text-sm flex flex-col gap-2">
            <p>© 2026 𝐅𝐋𝐔𝐅𝐅𝐘 𝐁𝐔𝐑𝐆𝐄𝐑. All rights reserved.</p>
            <p className="font-medium text-white/20 hover:text-white/60 transition-colors cursor-default">
              Designed & Developed by Sami Faraj
            </p>
          </div>
        </div>
      </footer>

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-[0_-5px_25px_rgba(0,0,0,0.1)] rounded-t-[2rem] z-50 border-t border-gray-100/50 pb-safe">
        <div className="flex justify-between items-end px-6 py-3 pb-5">
           
           {/* Home Button */}
           <button 
             onClick={() => setActiveView('home')}
             className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 ${
               activeView === 'home' ? 'text-brand-red -translate-y-1' : 'text-gray-400 hover:text-brand-orange'
             }`}
           >
              <div className={`p-1 rounded-xl transition-all ${activeView === 'home' ? 'bg-red-50' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={activeView === 'home' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeView === 'home' ? 0 : 2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-[10px] font-bold">الرئيسية</span>
           </button>

           {/* Menu Button (Prominent) */}
           <button 
             onClick={() => setActiveView('menu')}
             className="flex flex-col items-center gap-1 -mt-8 group"
           >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-4 border-white ${
                activeView === 'menu' ? 'bg-brand-red text-white scale-110 shadow-red-200' : 'bg-brand-dark text-white hover:bg-brand-orange'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className={`text-xs font-black transition-colors ${activeView === 'menu' ? 'text-brand-red' : 'text-gray-500'}`}>المنيو</span>
           </button>

           {/* Cart Button */}
           <button 
             onClick={() => setActiveView('cart')}
             className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 relative ${
               activeView === 'cart' ? 'text-brand-green -translate-y-1' : 'text-gray-400 hover:text-brand-green'
             }`}
           >
              <div className={`p-1 rounded-xl transition-all ${activeView === 'cart' ? 'bg-green-50' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={activeView === 'cart' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeView === 'cart' ? 0 : 2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold">طلباتي</span>
              {cartCount > 0 && (
                <span className="absolute top-0 right-2 w-4 h-4 bg-brand-red text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
           </button>

           {/* Contact Button (GREEN) */}
           <button 
             onClick={() => setActiveView('contact')}
             className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 ${
               activeView === 'contact' ? 'text-brand-green -translate-y-1' : 'text-gray-400 hover:text-brand-green'
             }`}
           >
              <div className={`p-1 rounded-xl transition-all ${activeView === 'contact' ? 'bg-green-50' : ''}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={activeView === 'contact' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeView === 'contact' ? 0 : 2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                 </svg>
              </div>
              <span className="text-[10px] font-bold">تواصل</span>
           </button>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Size Selection Modal (Step 1) */}
      {showSizeModal && pendingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-100 border-4 border-brand-orange">
             <div className="text-center mb-6">
                <div className="w-20 h-20 bg-brand-yellow rounded-full mx-auto flex items-center justify-center text-4xl shadow-lg mb-4">🍔</div>
                <h3 className="text-3xl font-heading font-black text-brand-dark mb-2">اختر حجم الساندوتش</h3>
                <p className="text-gray-500 font-medium">ما هو حجم جوعك اليوم؟</p>
             </div>
             
             <div className="space-y-4">
               <button 
                 onClick={() => handleSizeSelect('200g')}
                 className="w-full p-4 border-2 border-brand-orange/20 hover:border-brand-orange bg-white hover:bg-orange-50 rounded-2xl flex justify-between items-center transition-all duration-300 shadow-sm hover:shadow-lg group"
               >
                  <div className="text-left">
                    <span className="block font-black text-brand-dark text-xl group-hover:text-brand-orange">200 جرام</span>
                    <span className="text-sm font-medium text-gray-500">الحجم العادي</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-brand-red text-lg">{getSandwichPrice('200g').toFixed(2)} JD</span>
                  </div>
               </button>

               <button 
                 onClick={() => handleSizeSelect('300g')}
                 className="w-full p-4 border-2 border-brand-orange/20 hover:border-brand-orange bg-white hover:bg-orange-50 rounded-2xl flex justify-between items-center transition-all duration-300 shadow-sm hover:shadow-lg group"
               >
                  <div className="text-left">
                    <span className="block font-black text-brand-dark text-xl group-hover:text-brand-orange">300 جرام</span>
                    <span className="text-sm font-medium text-gray-500">الحجم الكبير</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-brand-red text-lg">{getSandwichPrice('300g').toFixed(2)} JD</span>
                  </div>
               </button>
             </div>
             
             <button 
              onClick={() => { setShowSizeModal(false); setPendingItem(null); }} 
              className="mt-6 w-full py-3 bg-white border-2 border-gray-200 text-gray-500 hover:text-brand-red hover:border-brand-red rounded-xl font-bold transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Meal Selection Modal (Step 2 - No Customizations here anymore) */}
      {showMealModal && pendingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-100 border-4 border-brand-green max-h-[90vh] overflow-y-auto custom-scrollbar">
             <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center text-3xl shadow-lg mb-4 text-brand-green">🍟</div>
                <h3 className="text-2xl font-heading font-black text-brand-dark mb-1">حولها إلى وجبة؟</h3>
                <p className="text-gray-500 text-sm font-medium">
                  {selectedSize === 'standard' 
                    ? `هل ترغب في إضافة بطاطس ومشروب إلى ${pendingItem.name}؟`
                    : <>اخترت حجم <span className="font-bold text-brand-dark">{selectedSize}</span>. هل تريد إضافة بطاطس ومشروب؟</>}
                </p>
             </div>

             <div className="space-y-3">
               <button 
                 onClick={() => handleMealChoice(true)}
                 className="w-full p-4 border-2 border-brand-green bg-green-50 hover:bg-brand-green group rounded-2xl flex justify-between items-center transition-all duration-300 shadow-sm hover:shadow-lg"
               >
                  <div className="text-left">
                    <span className="block font-black text-brand-dark group-hover:text-white text-lg">نعم، وجبة كاملة</span>
                    <span className="text-xs font-medium text-brand-green group-hover:text-green-100">+ بطاطس ومشروب</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-brand-dark group-hover:text-white text-lg">
                      {getMealPrice(selectedSize).toFixed(2)} JD
                    </span>
                  </div>
               </button>

               <button 
                 onClick={() => handleMealChoice(false)}
                 className="w-full p-4 border-2 border-gray-100 hover:border-gray-300 bg-white hover:bg-gray-50 rounded-2xl flex justify-between items-center transition-all duration-300"
               >
                  <span className="font-bold text-gray-600 text-lg">ساندوتش فقط</span>
                  <span className="block font-black text-brand-dark text-lg">
                    {getSandwichPrice(selectedSize).toFixed(2)} JD
                  </span>
               </button>
             </div>
             
             {selectedSize !== 'standard' ? (
                <button 
                  onClick={() => { setShowMealModal(false); setShowSizeModal(true); }} // Go back to size
                  className="mt-6 w-full py-3 bg-white border-2 border-gray-200 text-gray-500 hover:text-brand-orange hover:border-brand-orange rounded-xl font-bold transition-all"
                >
                  &larr; تغيير الحجم
                </button>
             ) : (
                <button 
                  onClick={() => { setShowMealModal(false); setPendingItem(null); }} 
                  className="mt-6 w-full py-3 bg-white border-2 border-gray-200 text-gray-500 hover:text-brand-red hover:border-brand-red rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
             )}
          </div>
        </div>
      )}

      {/* Customization Modal (Step 3 - NEW) */}
      {showCustomizationModal && pendingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-100 border-4 border-brand-orange max-h-[90vh] overflow-y-auto custom-scrollbar relative">
             <button 
               onClick={() => { setShowCustomizationModal(false); setShowMealModal(true); }} // Back to Meal
               className="absolute top-4 right-4 bg-gray-100 text-gray-500 hover:text-brand-red w-8 h-8 rounded-full flex items-center justify-center font-bold"
             >
               ✕
             </button>
             
             <div className="text-center mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto flex items-center justify-center text-3xl shadow-lg mb-3 text-brand-orange">✏️</div>
                <h3 className="text-2xl font-heading font-black text-brand-dark mb-1">تعديلات وإضافات</h3>
                <p className="text-gray-500 text-sm font-medium">عدل وجبتك كما تحب!</p>
             </div>
             
             {/* Customization Options */}
             <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
               <div className="grid grid-cols-2 gap-2">
                 {currentModifications.map(mod => (
                    <label key={mod.id} className={`flex items-center gap-2 cursor-pointer p-3 rounded-xl border transition-all ${
                      selectedModifications.includes(mod.id) 
                        ? 'bg-white border-brand-orange shadow-md' 
                        : 'bg-white border-transparent hover:bg-gray-100 shadow-sm'
                    }`}>
                       <input 
                         type="checkbox" 
                         checked={selectedModifications.includes(mod.id)}
                         onChange={() => toggleModification(mod.id)}
                         className="w-5 h-5 accent-brand-orange rounded cursor-pointer"
                       />
                       <div className="flex flex-col leading-none">
                          <span className="text-sm font-bold text-brand-dark mb-1">{mod.name}</span>
                          {mod.price > 0 
                            ? <span className="text-[10px] font-bold text-brand-red bg-red-50 px-2 py-0.5 rounded-full w-fit">+{mod.price.toFixed(2)} JD</span>
                            : <span className="text-[10px] font-bold text-gray-400">مجاني</span>
                          }
                       </div>
                    </label>
                 ))}
               </div>
             </div>

             {/* Footer Total & Add */}
             <div className="space-y-3">
               <div className="flex justify-between items-center px-2 pb-2">
                 <span className="text-gray-500 font-bold">المجموع النهائي:</span>
                 <span className="text-2xl font-black text-brand-red">
                   {((isMealSelected ? getMealPrice(selectedSize) : getSandwichPrice(selectedSize)) + getAddonsPrice()).toFixed(2)} JD
                 </span>
               </div>
               
               <button 
                 onClick={confirmCustomizationAndAdd}
                 className="w-full py-4 bg-brand-orange hover:bg-orange-600 text-white rounded-xl font-black text-lg shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-2"
               >
                 <span>إضافة للطلب</span>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                 </svg>
               </button>
               
               <button 
                  onClick={() => { setShowCustomizationModal(false); setShowMealModal(true); }} 
                  className="w-full py-3 bg-white border-2 border-gray-200 text-gray-500 hover:text-brand-orange hover:border-brand-orange rounded-xl font-bold transition-all"
                >
                  &larr; رجوع
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Sauce Selection Modal */}
      {showSauceModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
           <div className="bg-white rounded-[2rem] p-6 w-full max-w-2xl shadow-2xl h-[80vh] flex flex-col border-4 border-brand-red relative">
             <button 
               onClick={() => setShowSauceModal(false)} 
               className="absolute top-4 right-4 bg-red-100 text-brand-red hover:bg-brand-red hover:text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
             >
               ✕
             </button>
             
             <div className="text-center mb-6 pt-4">
               <div className="inline-block p-3 rounded-full bg-red-100 mb-3">
                 <span className="text-4xl">🥣</span>
               </div>
               <h3 className="text-3xl font-heading font-black text-brand-dark">اختر الصوص المفضل</h3>
               <p className="text-gray-500 font-medium mt-1">أضف لمسة سحرية لوجبتك</p>
             </div>

             <div className="overflow-y-auto pr-2 space-y-3 flex-grow custom-scrollbar">
                {SAUCE_OPTIONS.map((sauce) => (
                  <div key={sauce.id} className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow group">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                       <img src={sauce.image} alt={sauce.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-brand-dark text-lg">{sauce.name}</h4>
                      <p className="text-gray-400 text-xs">{sauce.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="font-black text-brand-orange text-lg">{sauce.price.toFixed(2)} JD</span>
                       <button 
                         onClick={() => {
                           addToCartDirectly(sauce);
                           showToast(`تمت إضافة ${sauce.name} لطلبك!`);
                         }}
                         className="px-4 py-1.5 bg-brand-cream text-brand-dark text-sm font-bold rounded-lg hover:bg-brand-red hover:text-white transition-colors border border-brand-red/10"
                       >
                         إضافة +
                       </button>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="pt-4 mt-2 border-t border-gray-100">
               <button 
                 onClick={() => setShowSauceModal(false)}
                 className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-black transition-colors"
               >
                 إغلاق القائمة
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Drink Selection Modal */}
      {showDrinkModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
           <div className="bg-white rounded-[2rem] p-6 w-full max-w-2xl shadow-2xl h-[80vh] flex flex-col border-4 border-brand-yellow relative">
             <button 
               onClick={() => setShowDrinkModal(false)} 
               className="absolute top-4 right-4 bg-red-100 text-brand-red hover:bg-brand-red hover:text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
             >
               ✕
             </button>
             
             <div className="text-center mb-6 pt-4">
               <div className="inline-block p-3 rounded-full bg-yellow-100 mb-3">
                 <span className="text-4xl">🥤</span>
               </div>
               <h3 className="text-3xl font-heading font-black text-brand-dark">اختر مشروبك</h3>
               <p className="text-gray-500 font-medium mt-1">انتعاش في كل رشفة</p>
             </div>

             <div className="overflow-y-auto pr-2 space-y-3 flex-grow custom-scrollbar">
                {DRINK_OPTIONS.map((drink) => (
                  <div key={drink.id} className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow group">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                       <img src={drink.image} alt={drink.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-brand-dark text-lg">{drink.name}</h4>
                      <p className="text-gray-400 text-xs">{drink.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="font-black text-brand-orange text-lg">{drink.price.toFixed(2)} JD</span>
                       <button 
                         onClick={() => {
                           addToCartDirectly(drink);
                           showToast(`تمت إضافة ${drink.name} لطلبك!`);
                         }}
                         className="px-4 py-1.5 bg-brand-cream text-brand-dark text-sm font-bold rounded-lg hover:bg-brand-yellow hover:text-brand-brown transition-colors border border-brand-yellow/30"
                       >
                         إضافة +
                       </button>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="pt-4 mt-2 border-t border-gray-100">
               <button 
                 onClick={() => setShowDrinkModal(false)}
                 className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-black transition-colors"
               >
                 إغلاق القائمة
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Snack Selection Modal */}
      {showSnackModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
           <div className="bg-white rounded-[2rem] p-6 w-full max-w-2xl shadow-2xl h-[80vh] flex flex-col border-4 border-brand-green relative">
             <button 
               onClick={() => setShowSnackModal(false)} 
               className="absolute top-4 right-4 bg-red-100 text-brand-red hover:bg-brand-red hover:text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
             >
               ✕
             </button>
             
             <div className="text-center mb-6 pt-4">
               <div className="inline-block p-3 rounded-full bg-green-100 mb-3">
                 <span className="text-4xl">🥨</span>
               </div>
               <h3 className="text-3xl font-heading font-black text-brand-dark">اختر السناك المفضل</h3>
               <p className="text-gray-500 font-medium mt-1">مقرمشات لذيذة لأوقات ممتعة</p>
             </div>

             <div className="overflow-y-auto pr-2 space-y-3 flex-grow custom-scrollbar">
                {SNACK_OPTIONS.map((snack) => (
                  <div key={snack.id} className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow group">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                       <img src={snack.image} alt={snack.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-brand-dark text-lg">{snack.name}</h4>
                      <p className="text-gray-400 text-xs">{snack.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="font-black text-brand-orange text-lg">{snack.price.toFixed(2)} JD</span>
                       <button 
                         onClick={() => {
                           addToCartDirectly(snack);
                           showToast(`تمت إضافة ${snack.name} لطلبك!`);
                         }}
                         className="px-4 py-1.5 bg-brand-cream text-brand-dark text-sm font-bold rounded-lg hover:bg-brand-green hover:text-white transition-colors border border-brand-green/30"
                       >
                         إضافة +
                       </button>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="pt-4 mt-2 border-t border-gray-100">
               <button 
                 onClick={() => setShowSnackModal(false)}
                 className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-black transition-colors"
               >
                 إغلاق القائمة
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Fries Selection Modal */}
      {showFriesModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
           <div className="bg-white rounded-[2rem] p-6 w-full max-w-2xl shadow-2xl h-[80vh] flex flex-col border-4 border-brand-green relative">
             <button 
               onClick={() => setShowFriesModal(false)} 
               className="absolute top-4 right-4 bg-red-100 text-brand-red hover:bg-brand-red hover:text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
             >
               ✕
             </button>
             
             <div className="text-center mb-6 pt-4">
               <div className="inline-block p-3 rounded-full bg-green-100 mb-3">
                 <span className="text-4xl">🍟</span>
               </div>
               <h3 className="text-3xl font-heading font-black text-brand-dark">اختر نوع البطاطس</h3>
               <p className="text-gray-500 font-medium mt-1">مقرمشة، ذهبية، ولذيذة جداً</p>
             </div>

             <div className="overflow-y-auto pr-2 space-y-3 flex-grow custom-scrollbar">
                {FRIES_OPTIONS.map((fry) => (
                  <div key={fry.id} className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow group">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                       <img src={fry.image} alt={fry.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-brand-dark text-lg">{fry.name}</h4>
                      <p className="text-gray-400 text-xs">{fry.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="font-black text-brand-orange text-lg">{fry.price.toFixed(2)} JD</span>
                       <button 
                         onClick={() => {
                           addToCartDirectly(fry);
                           showToast(`تمت إضافة ${fry.name} لطلبك!`);
                         }}
                         className="px-4 py-1.5 bg-brand-cream text-brand-dark text-sm font-bold rounded-lg hover:bg-brand-green hover:text-white transition-colors border border-brand-green/30"
                       >
                         إضافة +
                       </button>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="pt-4 mt-2 border-t border-gray-100">
               <button 
                 onClick={() => setShowFriesModal(false)}
                 className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-black transition-colors"
               >
                 إغلاق القائمة
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Chicken Strips Selection Modal (NEW) */}
      {showStripsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
           <div className="bg-white rounded-[2rem] p-6 w-full max-w-2xl shadow-2xl h-[80vh] flex flex-col border-4 border-brand-orange relative">
             <button 
               onClick={() => setShowStripsModal(false)} 
               className="absolute top-4 right-4 bg-red-100 text-brand-red hover:bg-brand-red hover:text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
             >
               ✕
             </button>
             
             <div className="text-center mb-6 pt-4">
               <div className="inline-block p-3 rounded-full bg-orange-100 mb-3">
                 <span className="text-4xl">🍗</span>
               </div>
               <h3 className="text-3xl font-heading font-black text-brand-dark">كريسبي ستريبس</h3>
               <p className="text-gray-500 font-medium mt-1">وجبات مقرمشة تناسب الجميع</p>
             </div>

             <div className="overflow-y-auto pr-2 space-y-3 flex-grow custom-scrollbar">
                {STRIPS_OPTIONS.map((strip) => (
                  <div key={strip.id} className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow group">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                       <img src={strip.image} alt={strip.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-brand-dark text-lg">{strip.name}</h4>
                      <p className="text-gray-400 text-xs font-bold text-brand-orange">{strip.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="font-black text-brand-red text-lg">{strip.price.toFixed(2)} JD</span>
                       <button 
                         onClick={() => {
                           addToCartDirectly(strip);
                           showToast(`تمت إضافة ${strip.name} لطلبك!`);
                         }}
                         className="px-4 py-1.5 bg-brand-cream text-brand-dark text-sm font-bold rounded-lg hover:bg-brand-orange hover:text-white transition-colors border border-brand-orange/30"
                       >
                         إضافة +
                       </button>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="pt-4 mt-2 border-t border-gray-100">
               <button 
                 onClick={() => setShowStripsModal(false)}
                 className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-black transition-colors"
               >
                 إغلاق القائمة
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Checkout: Step 1 - Method */}
      {checkoutStep === 'method' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border-4 border-brand-yellow relative">
             <button onClick={closeCheckout} className="absolute top-4 right-4 text-gray-400 hover:text-brand-red p-2 font-bold">✕</button>
             <h3 className="text-3xl font-heading font-black text-brand-dark text-center mb-8">كيف تفضل استلام طلبك؟</h3>
             
             <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={() => handleMethodSelect('delivery')}
                  className="bg-brand-cream text-brand-dark hover:bg-brand-orange hover:text-white p-6 rounded-3xl border-2 border-transparent hover:border-brand-orange transition-all group flex flex-col items-center gap-4 shadow-lg"
                >
                  <div className="w-20 h-20 bg-white text-brand-dark rounded-full flex items-center justify-center text-4xl shadow-md group-hover:scale-110 transition-transform">🛵</div>
                  <span className="font-black text-xl">توصيل</span>
                </button>

                <button 
                  onClick={() => handleMethodSelect('pickup')}
                  className="bg-brand-cream text-brand-dark hover:bg-brand-green hover:text-white p-6 rounded-3xl border-2 border-transparent hover:border-brand-green transition-all group flex flex-col items-center gap-4 shadow-lg"
                >
                  <div className="w-20 h-20 bg-white text-brand-dark rounded-full flex items-center justify-center text-4xl shadow-md group-hover:scale-110 transition-transform">🏪</div>
                  <span className="font-black text-xl">استلام من الفرع</span>
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Checkout: Step 1.5 - Branch Selection (Only for Pickup) */}
      {checkoutStep === 'branch' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border-4 border-brand-green relative">
             <button onClick={closeCheckout} className="absolute top-4 right-4 text-gray-400 hover:text-brand-red p-2 font-bold">✕</button>
             <h3 className="text-3xl font-heading font-black text-brand-dark text-center mb-2">اختر الفرع</h3>
             <p className="text-center text-gray-500 mb-8 font-medium">من أي فرع تود استلام طلبك؟</p>
             
             <div className="space-y-4">
                <button 
                  onClick={() => handleBranchSelect('الزرقاء - الزرقاء الجديدة')}
                  className="w-full p-4 border-2 border-gray-100 hover:border-brand-green bg-white hover:bg-green-50 rounded-2xl flex items-center gap-4 transition-all shadow-sm"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">📍</div>
                  <span className="font-black text-lg text-brand-dark">الزرقاء - الزرقاء الجديدة</span>
                </button>
                <button 
                  onClick={() => handleBranchSelect('عمان - الرابية')}
                  className="w-full p-4 border-2 border-gray-100 hover:border-brand-green bg-white hover:bg-green-50 rounded-2xl flex items-center gap-4 transition-all shadow-sm"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">🏙️</div>
                  <span className="font-black text-lg text-brand-dark">عمان - الرابية</span>
                </button>
                <button 
                  onClick={() => handleBranchSelect('عمان - الجبيهة')}
                  className="w-full p-4 border-2 border-gray-100 hover:border-brand-green bg-white hover:bg-green-50 rounded-2xl flex items-center gap-4 transition-all shadow-sm"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">🚦</div>
                  <span className="font-black text-lg text-brand-dark">عمان - الجبيهة</span>
                </button>
             </div>
             <button onClick={() => setCheckoutStep('method')} className="mt-6 w-full text-center text-gray-400 text-sm font-bold hover:text-brand-orange">
               &larr; العودة
             </button>
          </div>
        </div>
      )}

      {/* Checkout: Step 2 - Info */}
      {checkoutStep === 'info' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border-4 border-brand-orange relative">
             <button onClick={closeCheckout} className="absolute top-4 right-4 text-gray-400 hover:text-brand-red p-2 font-bold">✕</button>
             <h3 className="text-3xl font-heading font-black text-brand-dark text-center mb-6">بياناتك</h3>
             
             <form onSubmit={handleInfoSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">الاسم</label>
                 <input 
                   required
                   type="text" 
                   value={orderData.name}
                   onChange={(e) => setOrderData({...orderData, name: e.target.value})}
                   className="w-full px-5 py-3 bg-brand-cream rounded-xl border-2 border-transparent focus:border-brand-orange outline-none font-medium text-brand-dark placeholder-gray-400"
                   placeholder="الاسم الكريم"
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                 <input 
                   required
                   type="tel" 
                   value={orderData.phone}
                   onChange={(e) => setOrderData({...orderData, phone: e.target.value})}
                   className="w-full px-5 py-3 bg-brand-cream rounded-xl border-2 border-transparent focus:border-brand-orange outline-none font-medium text-brand-dark placeholder-gray-400"
                   placeholder="05xxxxxxxx"
                 />
               </div>
               
               {/* Delivery Only Fields */}
               {orderData.type === 'delivery' && (
                 <>
                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">اختر المنطقة (لتحديد الفرع الأقرب)</label>
                     <select 
                        required
                        value={orderData.area || ''}
                        onChange={handleAreaSelect}
                        className="w-full px-5 py-3 bg-brand-cream rounded-xl border-2 border-transparent focus:border-brand-orange outline-none font-medium text-brand-dark appearance-none"
                     >
                        <option value="" disabled>اختر منطقتك...</option>
                        {DELIVERY_ZONES.map((zone) => (
                          <option key={zone.name} value={zone.name}>{zone.name}</option>
                        ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">تفاصيل العنوان</label>
                     <textarea 
                       required
                       rows={2}
                       value={orderData.address}
                       onChange={(e) => setOrderData({...orderData, address: e.target.value})}
                       className="w-full px-5 py-3 bg-brand-cream rounded-xl border-2 border-transparent focus:border-brand-orange outline-none font-medium resize-none text-brand-dark placeholder-gray-400"
                       placeholder="اسم الشارع، رقم العمارة، الطابق..."
                     />
                   </div>
                 </>
               )}

               <button type="submit" className="w-full py-4 bg-brand-red hover:bg-red-700 text-white rounded-xl font-black text-lg shadow-lg mt-4 font-sans">
                 المتابعة للدفع
               </button>
             </form>
             
             <button onClick={() => setCheckoutStep(orderData.type === 'pickup' ? 'branch' : 'method')} className="mt-6 w-full text-center text-gray-400 text-sm font-bold hover:text-brand-orange">
               &larr; العودة
             </button>
          </div>
        </div>
      )}

      {/* Checkout: Step 3 - Payment */}
      {checkoutStep === 'payment' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border-4 border-brand-green relative">
             <button onClick={closeCheckout} className="absolute top-4 right-4 text-gray-400 hover:text-brand-red p-2 font-bold">✕</button>
             <h3 className="text-3xl font-heading font-black text-brand-dark text-center mb-2">اختر طريقة الدفع</h3>
             <p className="text-center text-gray-500 mb-6 font-bold">المبلغ الإجمالي: <span className="text-brand-orange text-xl">{finalTotal} JD</span></p>
             
             <div className="space-y-4">
                <button 
                  onClick={() => handlePaymentSelect('visa')}
                  className="w-full p-4 border-2 border-gray-100 hover:border-brand-red bg-white hover:bg-red-50 rounded-2xl flex items-center gap-4 transition-all shadow-sm group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">💳</div>
                  <span className="font-black text-lg text-brand-dark">فيزا / ماستركارد</span>
                </button>

                <button 
                  onClick={() => handlePaymentSelect('click')}
                  className="w-full p-4 border-2 border-gray-100 hover:border-brand-blue bg-white hover:bg-blue-50 rounded-2xl flex items-center gap-4 transition-all shadow-sm"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl">📱</div>
                  <span className="font-black text-lg text-brand-dark">كليك (CliQ)</span>
                </button>
             </div>
             
             <button onClick={() => setCheckoutStep('info')} className="mt-6 w-full text-center text-gray-400 text-sm font-bold hover:text-brand-orange">
               &larr; العودة
             </button>
          </div>
        </div>
      )}

      {/* Checkout: Step 3.5 - Processing */}
      {checkoutStep === 'processing' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
           <div className="flex flex-col items-center">
             <div className="w-20 h-20 border-8 border-brand-cream border-t-brand-orange rounded-full animate-spin mb-6"></div>
             <h2 className="text-3xl font-heading font-black text-white animate-pulse">جاري معالجة الدفع...</h2>
           </div>
        </div>
      )}

      {/* Checkout: Step 4 - Success */}
      {checkoutStep === 'success' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl text-center border-b-8 border-brand-green">
             <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center text-5xl mb-6 shadow-inner text-brand-green animate-bounce">
               ✓
             </div>
             <h2 className="text-4xl font-heading font-black text-brand-dark mb-2">تم استلام الطلب!</h2>
             
             {/* Ticket / Branch Info */}
             <div className="mb-6 flex flex-col gap-2">
                <div className="inline-block bg-brand-dark text-white px-4 py-1 rounded-full text-sm font-black tracking-widest mx-auto">
                   TICKET #{orderData.id}
                </div>
                {orderData.branch && (
                  <p className="text-brand-red font-bold text-sm">
                    تجهيز فرع: {orderData.branch.split('-')[0].trim()}
                  </p>
                )}
                <p className="text-gray-400 text-xs font-bold">{orderData.timestamp}</p>
             </div>

             <p className="text-gray-500 mb-8 font-medium">
               شكراً لك، <span className="text-brand-orange font-bold">{orderData.name}</span>.<br/>
               نحن نجهز وجبتك اللذيذة الآن!
             </p>
             <div className="bg-brand-cream p-4 rounded-2xl mb-8 text-sm text-left space-y-2 text-brand-dark">
               <div className="flex justify-between"><span>نوع الطلب:</span> <span className="font-bold capitalize">{orderData.type === 'delivery' ? 'توصيل' : 'استلام'}</span></div>
               {orderData.area && <div className="flex justify-between"><span>المنطقة:</span> <span className="font-bold">{orderData.area}</span></div>}
               <div className="flex justify-between"><span>الدفع:</span> <span className="font-bold capitalize">{orderData.payment === 'click' ? 'كليك' : 'فيزا'}</span></div>
               <div className="flex justify-between border-t border-gray-200 pt-2 mt-2"><span>المدفوع:</span> <span className="font-black text-brand-red">{orderData.total} JD</span></div>
             </div>

             <div className="flex flex-col gap-3">
               <button 
                 onClick={() => window.print()}
                 className="w-full py-3 bg-gray-100 text-brand-dark hover:bg-gray-200 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 border border-gray-200"
               >
                 <span>🖨️</span>
                 <span>طباعة الفاتورة</span>
               </button>
               
               <button 
                 onClick={closeCheckout}
                 className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black text-lg shadow-lg hover:scale-105 transition-transform"
               >
                 العودة للرئيسية
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;