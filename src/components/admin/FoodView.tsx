import React, { useState, useEffect } from 'react';
import { 
  Property, 
  Tenant, 
  FoodMenuDay,
  Booking 
} from '../../types';
import { 
  X, 
  Utensils, 
  PieChart, 
  Activity, 
  Shuffle, 
  Edit, 
  ChevronRight, 
  Clock, 
  Users, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface FoodViewProps {
  properties: Property[];
  tenants: Tenant[];
  bookings: Booking[];
  foodMenu: FoodMenuDay[];
  setFoodMenu: (menu: FoodMenuDay[]) => void;
  selectedPropertyId: string;
  onAddAuditLog: (action: string, module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor') => void;
}

export default function FoodView({
  properties,
  tenants,
  bookings,
  foodMenu,
  setFoodMenu,
  selectedPropertyId,
  onAddAuditLog
}: FoodViewProps) {
  const propertyTenants = tenants.filter(t => t.propertyId === selectedPropertyId && t.status === 'Active');
  const propertyBookings = bookings.filter(b => b.propertyId === selectedPropertyId && b.status === 'Confirmed');
  
  // Filtering food menu belonging to current property
  const propertyFoodMenu = foodMenu.filter(fm => fm.propertyId === selectedPropertyId);

  // Auto-populate dining board if it is empty for the current property
  useEffect(() => {
    if (!selectedPropertyId) return;
    const hasMenu = foodMenu.some(fm => fm.propertyId === selectedPropertyId);
    if (!hasMenu) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const defaultMenus = [
        { b: 'Idli, Vada, Sambhar & Coffee', l: 'Roti, Paneer Masala, Daal, Rice, Curd', d: 'Aloo Paratha, Pickle, Veg Raita' },
        { b: 'Puri Sagu, Fruit Bowl & Tea', l: 'Veg Biryani, Mirchi ka Salan, Raita', d: 'Jeera Rice, Yellow Tadka Daal, Bhindi Fry' },
        { b: 'Poha, Sheera & Coffee', l: 'Roti, Chana Masala, Veg Pulao, Curd', d: 'Phulka Roti, Kadai Paneer, Rice, Sambhar' },
        { b: 'Masala Dosa, Chutney & Tea', l: 'Roti, Mix Veg Handi, Tomato Daal & Rice', d: 'Khichdi, Kadhi, Papad, Aloo Fry' },
        { b: 'Bread Toast, Omelette/Sprouts & Juice', l: 'Roti, Dal Makhani, Palak Paneer, Peas Pulao', d: 'Fried Rice with Gobi Manchurian' },
        { b: 'Uttapam, Coconut Chutney & Tea', l: 'Roti, Baingan Bharta, Moong Dal & Ghee Rice', d: 'Butter Naan, Shahi Paneer, Jeera Rice' },
        { b: 'Aloo Puri, Pickles & Sweet Lassi', l: 'Special Sunday Pulao, Veg Kurma, Salad', d: 'Soft Phulkas, Matar Paneer, Rice, Dal Fry' }
      ];
      
      const newItems = days.map((day, idx) => ({
        id: `menu-${selectedPropertyId}-${day.toLowerCase()}`,
        propertyId: selectedPropertyId,
        day,
        breakfast: defaultMenus[idx].b,
        lunch: defaultMenus[idx].l,
        dinner: defaultMenus[idx].d,
        attendanceBreakfast: 50,
        attendanceLunch: 45,
        attendanceDinner: 60
      }));
      
      const updatedMenu = [...foodMenu, ...newItems];
      setFoodMenu(updatedMenu);
      localStorage.setItem('hotel_pg_food_menu', JSON.stringify(updatedMenu));
      onAddAuditLog(`Initialized default canteen weekly menu catalog for property ID ${selectedPropertyId}`, 'Food');
    }
  }, [selectedPropertyId, foodMenu, setFoodMenu, onAddAuditLog]);

  // States
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    breakfast: '',
    lunch: '',
    dinner: '',
    attendanceBreakfast: 80,
    attendanceLunch: 70,
    attendanceDinner: 95
  });

  // Calculate meal plan analytic models
  const totalResidentsCount = propertyTenants.length || 1;
  const activeBookingsCount = propertyBookings.length;

  // Let's count meal plans in current co-livers database
  // Note: Since mealPlan is on Bookings, let's also estimate active tenants dining styles
  // We can look at the active confirmed Bookings to count subscriber metrics!
  const breakfastSubscribers = propertyBookings.filter(b => b.mealPlan === 'Breakfast Only').length;
  const fullBoardSubscribers = propertyBookings.filter(b => b.mealPlan === 'Full Board').length;
  const noneDiningCount = propertyBookings.filter(b => b.mealPlan === 'None').length;

  const totalSubs = breakfastSubscribers + fullBoardSubscribers + noneDiningCount || 1;

  // Trigger day edit modal
  const openEditDayModal = (day: FoodMenuDay) => {
    setEditingDayId(day.id);
    setEditForm({
      breakfast: day.breakfast,
      lunch: day.lunch,
      dinner: day.dinner,
      attendanceBreakfast: day.attendanceBreakfast,
      attendanceLunch: day.attendanceLunch,
      attendanceDinner: day.attendanceDinner
    });
  };

  // Safe save action
  const handleSaveDayMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDayId) return;

    const updated = foodMenu.map(fm => {
      if (fm.id === editingDayId) {
        return {
          ...fm,
          breakfast: editForm.breakfast,
          lunch: editForm.lunch,
          dinner: editForm.dinner,
          attendanceBreakfast: Number(editForm.attendanceBreakfast),
          attendanceLunch: Number(editForm.attendanceLunch),
          attendanceDinner: Number(editForm.attendanceDinner)
        };
      }
      return fm;
    });

    setFoodMenu(updated);
    localStorage.setItem('hotel_pg_food_menu', JSON.stringify(updated));

    const dayObj = foodMenu.find(f => f.id === editingDayId);
    if (dayObj) {
      onAddAuditLog(`Modified kitchen catering dining details for ${dayObj.day}`, 'Food');
    }

    setEditingDayId(null);
  };

  return (
    <div className="space-y-6 text-slate-800 text-xs font-medium animate-fadeIn">
      
      {/* Structured Weekly Menu Board Grid */}
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl border flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 font-display">Digital Weekly Dining Planner</h3>
            <p className="text-[11px] text-slate-400">Configure food items menus displayed dynamically inside co-livers companion app</p>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black tracking-wide font-mono px-2 py-0.5 rounded border border-indigo-150 uppercase">Monday - Sunday</span>
        </div>

        <div className="space-y-3">
          {propertyFoodMenu.map(dayMenu => (
            <div key={dayMenu.id} className="bg-white border rounded-2xl p-3 shadow-xs transition hover:shadow-md grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              
              {/* Day title */}
              <div className="border-b md:border-b-0 pb-1.5 md:pb-0 font-display flex justify-between items-center">
                <div>
                  <span className="text-sm font-black text-slate-950 font-display">{dayMenu.day}</span>
                  <p className="text-[8px] text-slate-400 mt-0.5 block font-sans">Turnout Avg: {dayMenu.attendanceBreakfast + dayMenu.attendanceLunch + dayMenu.attendanceDinner} plates</p>
                </div>
                
                <button 
                  onClick={() => openEditDayModal(dayMenu)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-705 p-1 rounded-lg border transition flex md:hidden"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Breakfast and Dinner displays */}
              <div className="space-y-1">
                <span className="text-[7px] uppercase tracking-wider font-extrabold text-amber-600 block font-mono">Breakfast Menu (8 AM)</span>
                <p className="font-semibold text-slate-700 bg-slate-50 border/40 p-1.5 rounded-lg text-[10px]">
                  {dayMenu.breakfast}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[7px] uppercase tracking-wider font-extrabold text-emerald-600 block font-mono">Afternoon Lunch (1:30 PM)</span>
                <p className="font-semibold text-slate-700 bg-slate-50 border/40 p-1.5 rounded-lg text-[10px]">
                  {dayMenu.lunch}
                </p>
              </div>

              <div className="space-y-1 relative flex justify-between items-stretch gap-2.5">
                <div className="flex-1 space-y-1">
                  <span className="text-[7px] uppercase tracking-wider font-extrabold text-purple-600 block font-mono">Night Dinner Banquet (9 PM)</span>
                  <p className="font-semibold text-slate-700 bg-slate-50 border/40 p-1.5 rounded-lg text-[10px]">
                    {dayMenu.dinner}
                  </p>
                </div>

                <button 
                  onClick={() => openEditDayModal(dayMenu)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-705 p-1 rounded-lg border transition items-center justify-center hidden md:flex"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* EDIT MENU DAY DIALOGUE MODAL */}
      {editingDayId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900 font-medium">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-2 text-left">
              <div>
                <h3 className="font-extrabold text-sm font-display text-slate-950">Update Daily Canteen Board</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Edit menu items and catering headcount parameters</p>
              </div>
              <button onClick={() => setEditingDayId(null)} className="p-1 hover:bg-slate-100 rounded-full border transition">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveDayMenu} className="space-y-3.5 pt-1 text-slate-710 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Breakfast items list *</label>
                <input 
                  type="text" 
                  value={editForm.breakfast}
                  onChange={(e) => setEditForm({ ...editForm, breakfast: e.target.value })}
                  placeholder="E.g., Poha, Boiled Egg, Coffee"
                  className="w-full border rounded-xl p-2.5 bg-slate-5 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Lunch Meal course *</label>
                <input 
                  type="text" 
                  value={editForm.lunch}
                  onChange={(e) => setEditForm({ ...editForm, lunch: e.target.value })}
                  placeholder="E.g., Paneer Masala, Roti, Rice, Curd"
                  className="w-full border rounded-xl p-2.5 bg-slate-5 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Dinner Banquet layout *</label>
                <input 
                  type="text" 
                  value={editForm.dinner}
                  onChange={(e) => setEditForm({ ...editForm, dinner: e.target.value })}
                  placeholder="E.g., Chicken Curry / Dal Tadka, Jeera Rice"
                  className="w-full border rounded-xl p-2.5 bg-slate-5 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1 bg-slate-50 p-2.5 rounded-2xl border">
                <div>
                  <label className="block text-slate-400 mb-1 text-[9px] font-bold font-mono">BREAKFAST PLATES</label>
                  <input 
                    type="number" 
                    value={editForm.attendanceBreakfast}
                    onChange={(e) => setEditForm({ ...editForm, attendanceBreakfast: Number(e.target.value) })}
                    className="w-full border rounded-lg p-1.5 bg-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[9px] font-bold font-mono">LUNCH HEADS</label>
                  <input 
                    type="number" 
                    value={editForm.attendanceLunch}
                    onChange={(e) => setEditForm({ ...editForm, attendanceLunch: Number(e.target.value) })}
                    className="w-full border rounded-lg p-1.5 bg-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[9px] font-bold font-mono">DINNER TARGET</label>
                  <input 
                    type="number" 
                    value={editForm.attendanceDinner}
                    onChange={(e) => setEditForm({ ...editForm, attendanceDinner: Number(e.target.value) })}
                    className="w-full border rounded-lg p-1.5 bg-white text-center font-bold"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-black py-2.5 rounded-xl transition shadow text-xs mt-1"
              >
                Publish updated canteen list
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
