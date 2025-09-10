import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, MapPin, Calendar, Award } from "lucide-react";
import asuLogo from "@/assets/asu_logo.png";

const educationData = [
  {
    degree: "Master of Science in Robotics and Autonomous Systems",
    institution: "Arizona State University",
    location: "Tempe, AZ",
    duration: "2023 - 2025",
    logo: asuLogo,
    description: "Specializing in AI and Machine Learning, Computer Vision, Generative AI, Reinforcement Learning and Perception in Robotics",
    highlights: [
      "AI and Machine Learning",
      "Computer Vision",
      "Generative AI",
      "Perception in Robotics"
    ],
    gpa: "3.8/4.0",
    status: "Completed"
  }
];

export function EducationSection() {
  return (
    <section id="education" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              My <span className="gradient-text">Education</span>
            </h2>
          </div>

          <div className="space-y-8">
            {educationData.map((education, index) => (
              <Card key={index} className="glass hover-lift group">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* ASU Logo and Institution Info */}
                    <div className="lg:w-1/3">
                      <div className="flex flex-col items-center lg:items-start space-y-4">
                        {/* ASU Logo */}
                        <div className="relative w-24 h-24 rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {/* Blue reflection effect behind the logo */}
                          <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary rounded-full blur-xl opacity-20 animate-pulse -z-10" />
                          
                          <img 
                            src={education.logo} 
                            alt="ASU Logo" 
                            className="relative w-full h-full object-contain"
                            onError={(e) => {
                              // Fallback if logo fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-full h-full bg-gradient-to-br from-maroon-600 to-gold-500 rounded-full flex items-center justify-center text-white font-bold text-xs text-center">
                            ASU
                          </div>
                        </div>
                        
                        {/* Institution Details */}
                        <div className="text-center lg:text-left">
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {education.institution}
                          </h3>
                          <div className="flex items-center justify-center lg:justify-start space-x-2 text-muted-foreground mb-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{education.location}</span>
                          </div>
                          <div className="flex items-center justify-center lg:justify-start space-x-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">{education.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Degree and Details */}
                    <div className="lg:w-2/3 space-y-6">
                      {/* Degree Title */}
                      <div>
                        <h4 className="text-2xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                          {education.degree}
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {education.description}
                        </p>
                      </div>

                      {/* Highlights and Skills */}
                      <div>
                        <h5 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                          <Award className="h-5 w-5 mr-2 text-accent" />
                          Key Focus Areas
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {education.highlights.map((highlight, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/20"
                            >
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Status and GPA */}
                      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-accent/20">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-5 w-5 text-accent" />
                          <span className="text-sm font-medium text-foreground">
                            GPA: {education.gpa}
                          </span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`border-2 ${
                            education.status === "In Progress" 
                              ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/20" 
                              : "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20"
                          }`}
                        >
                          {education.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
