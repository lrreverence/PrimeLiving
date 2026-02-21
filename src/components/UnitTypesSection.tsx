import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const UnitTypesSection = () => {
  const unitTypes = [
    {
      title: "1 Bedroom Unit",
      priceRange: "₱7,500 - ₱8,000",
      features: [
        "Toilet and Bath",
        "Spacious Window",
        "Tiled flooring",
        "Sink / basic kitchen counter",
      ],
    },
    {
      title: "2 Bedroom Unit",
      priceRange: "₱9,500 - ₱12,000",
      features: [
        "With Balcony",
        "Gated compound",
        "Own electric sub-meter",
        "Parking (limited slots)",
      ],
    },
    {
      title: "3 Bedroom Unit",
      priceRange: "₱8,000 - ₱10,000",
      features: [
        "Own CR (Comfort Room)",
        "Separate bedroom",
        "Kitchen area",
        "Tiled flooring",
      ],
    },
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
            From one to three bedroom units, we have the perfect home for every lifestyle.
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
