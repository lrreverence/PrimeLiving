import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, Calendar } from "lucide-react";

const Contact = () => {
  return (
    <section className="w-full px-6 py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Heading */}
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Ready to Move In?
        </h2>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Contact us today to schedule a viewing or get more information about our available units.
        </p>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Call Us Card */}
          <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Phone className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600">+63 917 123 4567</p>
            </CardContent>
          </Card>

          {/* Email Us Card */}
          <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Mail className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600">info@primeliving.com</p>
            </CardContent>
          </Card>

          {/* Schedule Tour Card */}
          <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Tour</h3>
              <p className="text-gray-600">Book your viewing</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 text-base rounded-lg">
            Chat with Us Now
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-base rounded-lg"
          >
            Access Portal
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Contact;
