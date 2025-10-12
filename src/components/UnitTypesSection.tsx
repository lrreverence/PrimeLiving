import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const UnitTypesSection = () => {
  const unitTypes = [
    {
      title: "Studio",
      size: "25-30 sqm",
      priceRange: "₱15,000 - ₱18,000",
      features: [
        "Air conditioning",
        "Built-in bed",
        "Kitchenette",
        "Private bathroom"
      ]
    },
    {
      title: "1 Bedroom",
      size: "35-40 sqm",
      priceRange: "₱20,000 - ₱25,000",
      features: [
        "Separate bedroom",
        "Living area",
        "Full kitchen",
        "Balcony"
      ]
    },
    {
      title: "2 Bedroom",
      size: "50-60 sqm",
      priceRange: "₱28,000 - ₱35,000",
      features: [
        "Two bedrooms",
        "Spacious living room",
        "Dining area",
        "Two balconies"
      ]
    }
  ];

  return (
    <section className="w-full px-6 pt-28 pb-16 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choose Your Ideal Space
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From cozy studios to spacious two-bedroom units, we have the perfect home for every lifestyle.
          </p>
        </div>

        {/* Unit Type Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {unitTypes.map((unit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 border border-border/50 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {unit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {unit.size}
                  </p>
                </div>
                <div className="bg-muted rounded-full px-3 py-1">
                  <span className="text-sm font-medium text-foreground">
                    {unit.priceRange}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-6">
                {unit.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-foreground text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* View Details Button */}
              <Button
                variant="outline"
                className="w-full border-border hover:bg-accent hover:text-accent-foreground"
              >
                View Details
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UnitTypesSection;
