function TravelerDropdown({
  adults,
  setAdults,
  childs,
  setChilds,
  infants,
  setInfants,
  showDropdown,
  setShowDropdown,
  dropdownRef,
}: {
  adults: number;
  setAdults: (n: number) => void;
  childs: number;
  setChilds: (n: number) => void;
  infants: number;
  setInfants: (n: number) => void;
  showDropdown: boolean;
  setShowDropdown: (b: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  const total = adults + childs + infants;

  const getSummary = () => {
    if (total === 1) return "1 Traveler";
    return `${total} Travelers`;
  };

  const getDetailedSummary = () => {
    const parts = [];
    if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? "s" : ""}`);
    if (childs > 0) parts.push(`${childs} Child${childs > 1 ? "ren" : ""}`);
    if (infants > 0) parts.push(`${infants} Infant${infants > 1 ? "s" : ""}`);
    return parts.join(" • ");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className={`w-full pl-16 pr-4 py-4 border-2 rounded-xl cursor-pointer 
          text-gray-800 font-semibold transition-all bg-white 
          flex items-center justify-between relative
          ${showDropdown 
            ? "border-[#021f3b] ring-2 ring-blue-100" 
            : "border-gray-200 hover:border-gray-300"
          }`}
      >
        {/* Icon Box */}
        <div className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-l-xl flex items-center justify-center">
          <Users size={20} className="text-white" />
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800">{getSummary()}</span>
          {total > 1 && (
            <span className="text-xs text-gray-500">{getDetailedSummary()}</span>
          )}
        </div>
        
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-200 ${
            showDropdown ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 min-w-[320px] overflow-hidden">
          
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base">Passengers</h4>
                <p className="text-blue-200 text-xs mt-0.5">Select travelers for this trip</p>
              </div>
              <button
                onClick={() => setShowDropdown(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 
                  flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Passengers List */}
          <div className="divide-y divide-gray-100">
            
            {/* Adults */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <User size={22} className="text-[#021f3b]" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Adults</p>
                  <p className="text-xs text-gray-500">Age 12+</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => adults > 1 && setAdults(adults - 1)}
                  disabled={adults <= 1}
                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition font-bold
                    ${adults <= 1 
                      ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50" 
                      : "border-[#021f3b] text-[#021f3b] hover:bg-[#021f3b] hover:text-white"
                    }`}
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-bold text-gray-800 text-xl">{adults}</span>
                <button
                  onClick={() => adults < 9 && setAdults(adults + 1)}
                  disabled={adults >= 9}
                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition font-bold
                    ${adults >= 9 
                      ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50" 
                      : "border-[#021f3b] text-[#021f3b] hover:bg-[#021f3b] hover:text-white"
                    }`}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Users size={22} className="text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Children</p>
                  <p className="text-xs text-gray-500">Age 2-11</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => childs > 0 && setChilds(childs - 1)}
                  disabled={childs <= 0}
                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition font-bold
                    ${childs <= 0 
                      ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50" 
                      : "border-[#021f3b] text-[#021f3b] hover:bg-[#021f3b] hover:text-white"
                    }`}
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-bold text-gray-800 text-xl">{childs}</span>
                <button
                  onClick={() => childs < 9 && setChilds(childs + 1)}
                  disabled={childs >= 9}
                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition font-bold
                    ${childs >= 9 
                      ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50" 
                      : "border-[#021f3b] text-[#021f3b] hover:bg-[#021f3b] hover:text-white"
                    }`}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Infants */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center">
                  <Baby size={22} className="text-pink-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Infants</p>
                  <p className="text-xs text-gray-500">Under 2 (on lap)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => infants > 0 && setInfants(infants - 1)}
                  disabled={infants <= 0}
                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition font-bold
                    ${infants <= 0 
                      ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50" 
                      : "border-[#021f3b] text-[#021f3b] hover:bg-[#021f3b] hover:text-white"
                    }`}
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-bold text-gray-800 text-xl">{infants}</span>
                <button
                  onClick={() => infants < adults && setInfants(infants + 1)}
                  disabled={infants >= adults}
                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition font-bold
                    ${infants >= adults 
                      ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50" 
                      : "border-[#021f3b] text-[#021f3b] hover:bg-[#021f3b] hover:text-white"
                    }`}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Warning for infants */}
          {infants > 0 && (
            <div className="mx-5 mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Baby size={14} className="text-amber-600" />
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Infants must sit on an adult's lap. Max {adults} infant{adults > 1 ? "s" : ""} allowed.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">Total:</span>
              <span className="ml-2 text-lg font-bold text-[#021f3b]">
                {total} Passenger{total > 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={() => setShowDropdown(false)}
              className="bg-[#021f3b] text-white px-8 py-3 rounded-xl text-sm font-bold 
                hover:bg-[#0a3a6b] transition-all shadow-lg hover:shadow-xl
                active:scale-[0.98]"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}