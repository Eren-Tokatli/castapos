"use client";

export interface RentalAdvantages {
  campaigned: boolean;
  fastDelivery: boolean;
}

interface CategoryFilterSidebarProps {
  brands: string[];
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  typeTitle: string;
  typeOptions: string[];
  activeType: string;
  onTypeChange: (type: string) => void;
  selectedPeriods: number[];
  onPeriodChange: (period: number) => void;
  advantages: RentalAdvantages;
  onAdvantageToggle: (key: keyof RentalAdvantages) => void;
}

const rentalPeriods = [1, 3, 6, 9];

const advantageLabels: { key: keyof RentalAdvantages; label: string }[] = [
  { key: "campaigned", label: "Kampanyalı" },
  { key: "fastDelivery", label: "Hızlı teslimat" },
];

export function CategoryFilterSidebar({
  brands,
  selectedBrand,
  onBrandChange,
  typeTitle,
  typeOptions,
  activeType,
  onTypeChange,
  selectedPeriods,
  onPeriodChange,
  advantages,
  onAdvantageToggle,
}: CategoryFilterSidebarProps) {
  return (
    <aside className="filter-sidebar">
      <div className="filter-title">Filtrele</div>

      <div className="filter-block">
        <h3>Marka</h3>
        <div className="check-list">
          {brands.map((brand) => (
            <label key={brand} className="fake-check">
              <input
                type="checkbox"
                checked={selectedBrand === brand}
                onChange={() => onBrandChange(brand)}
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-block">
        <h3>{typeTitle}</h3>
        <div className="type-filters flex flex-col gap-2">
          {typeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`filter-chip ${activeType === option ? "active" : ""}`}
              onClick={() => onTypeChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-block">
        <h3>Kiralama Süresi</h3>
        {rentalPeriods.map((period) => (
          <label key={period} className="fake-check">
            <input
              type="checkbox"
              checked={selectedPeriods.includes(period)}
              onChange={() => onPeriodChange(period)}
            />
            <span>{period} Ay</span>
          </label>
        ))}
      </div>

      <div className="filter-block">
        <h3>Avantajlar</h3>
        {advantageLabels.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`switch-row w-full flex justify-between items-center text-left ${advantages[key] ? "text-[#f35f36]" : ""}`}
            onClick={() => onAdvantageToggle(key)}
          >
            <span>{label}</span>
            <span className={`switch-toggle-bg relative w-10 h-6 rounded-full transition-colors ${advantages[key] ? "bg-[#f35f36]" : "bg-neutral-200"}`}>
              <span className={`switch-circle absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${advantages[key] ? "translate-x-4" : ""}`} />
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
