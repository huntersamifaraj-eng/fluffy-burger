import React from 'react';
import { CartItem } from '../types';

interface CartViewProps {
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

export const CartView: React.FC<CartViewProps> = ({ cart, onRemove, onUpdateQuantity, onCheckout }) => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate if Restaurant is Closed (1:30 AM to 12:00 PM)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Closed Range: > 01:30 AND < 12:00
  let isClosed = false;
  if (currentHour > 1 && currentHour < 12) {
    isClosed = true;
  } else if (currentHour === 1 && currentMinute >= 30) {
    isClosed = true;
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in font-sans">
        <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <span className="text-6xl grayscale opacity-30">🍽️</span>
        </div>
        <h2 className="text-3xl font-heading font-black text-brand-dark mb-2">قائمة طلباتك فارغة</h2>
        <p className="text-gray-500 font-medium text-lg max-w-xs mx-auto">لم تضف أي وجبات لذيذة بعد. تصفح المنيو وأشبع جوعك!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in font-sans pb-20">
      <div className="text-center py-8 mb-4">
        <div className="inline-block bg-white/90 backdrop-blur-md px-10 py-6 rounded-[3rem] shadow-xl border-b-8 border-brand-red relative overflow-hidden">
          <h2 className="text-5xl font-heading font-black text-brand-dark">
            قائمة <span className="text-brand-red">طلباتي</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-3xl shadow-md border border-gray-100 flex gap-4 items-center transition-all hover:shadow-lg">
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-black text-brand-dark mb-1">{item.name}</h3>
                {item.customizations && item.customizations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {item.customizations.map((mod, idx) => {
                      const isRemoval = mod.startsWith('بدون');
                      const isAddition = mod.startsWith('إضافة') || mod.startsWith('إكسترا') || mod.startsWith('زيادة');
                      
                      let styleClass = "bg-gray-100 text-gray-600 border border-gray-200";
                      if (isRemoval) {
                        styleClass = "bg-red-50 text-red-500 border border-red-100";
                      } else if (isAddition) {
                        styleClass = "bg-green-50 text-green-600 border border-green-100";
                      }

                      return (
                        <span key={idx} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${styleClass}`}>
                          {mod}
                        </span>
                      );
                    })}
                  </div>
                )}
                <p className="text-brand-orange font-bold">{item.price.toFixed(2)} JD</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center bg-brand-cream rounded-full p-1 border border-brand-orange/20">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="w-8 h-8 rounded-full bg-red-100 text-brand-red hover:bg-brand-red hover:text-white flex items-center justify-center font-bold transition-colors shadow-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-brand-dark">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-8 h-8 rounded-full bg-green-100 text-brand-green hover:bg-brand-green hover:text-white flex items-center justify-center font-bold transition-colors shadow-sm"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="حذف"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border-t-8 border-brand-yellow sticky top-32">
            <h3 className="text-2xl font-heading font-black text-brand-dark mb-6 border-b border-dashed border-gray-200 pb-4">ملخص الطلب</h3>
            
            <div className="space-y-3 mb-6 font-medium text-gray-600">
              <div className="flex justify-between text-xl font-black text-brand-red pt-4 mt-2">
                <span>الإجمالي</span>
                <span>{total.toFixed(2)} JD</span>
              </div>
              <p className="text-center text-xs text-gray-400 font-bold mt-1">الأسعار شاملة الضريبة</p>
            </div>

            <button 
              onClick={isClosed ? undefined : onCheckout}
              disabled={isClosed}
              className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all flex justify-center items-center gap-2 ${
                isClosed 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-brand-green hover:bg-green-600 text-white shadow-green-200 transform hover:-translate-y-1 active:scale-95'
              }`}
            >
              {isClosed ? (
                <span>المطعم مغلق حالياً</span>
              ) : (
                <>
                  <span>إتمام الطلب</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-sm">➔</span>
                </>
              )}
            </button>
            
            {isClosed ? (
              <p className="text-center text-red-400 text-xs mt-4 font-bold">
                ساعات العمل: ١٢:٠٠ م - ٠١:٣٠ ص
              </p>
            ) : (
              <p className="text-center text-gray-400 text-xs mt-4 font-bold">الدفع آمن 100%</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};