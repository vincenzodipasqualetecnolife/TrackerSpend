import React from 'react';

interface CategoryItem {
  name: string;
  amount: number;
  percentage?: number;
  color?: string;
}

interface CategoryListProps {
  categories: CategoryItem[];
  title?: string;
  className?: string;
  maxItems?: number;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  title = "Spese per Categoria",
  className = '',
  maxItems = 5
}) => {
  const sortedCategories = [...categories]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, maxItems);

  const totalAmount = categories.reduce((sum, cat) => sum + cat.amount, 0);

  // Array di colori del brand
  const brandColors = [
    '#00FF00', // buddy-lime
    '#00CED1', // buddy-teal
    '#8A2BE2', // buddy-purple
    '#F59E0B', // buddy-warning
    '#EF4444', // buddy-error
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h2 className="text-xl font-bold text-buddy-text-primary">{title}</h2>
      )}
      
      <div className="space-y-3">
        {sortedCategories.map((category, index) => {
          const percentage = totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0;
          const color = category.color || brandColors[index % brandColors.length];
          
          return (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-buddy-text-primary">
                    {category.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-buddy-lime">
                    €{category.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-buddy-text-secondary">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-buddy-dark-tertiary rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {categories.length > maxItems && (
        <div className="text-center pt-2">
          <span className="text-sm text-buddy-text-secondary">
            +{categories.length - maxItems} altre categorie
          </span>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
