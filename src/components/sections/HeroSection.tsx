import { Button } from "@/components/ui/button";
import { ArrowDown, Download, ExternalLink, Linkedin, Github } from "lucide-react";
import { useEffect, useState } from "react";
import profileImage from "@/assets/profile-hero.jpg";
import { downloadResume } from "@/lib/resume";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Content */}
          <div className={`space-y-6 md:space-y-8 lg:space-y-10 text-center md:text-left ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
            <div className="space-y-3 md:space-y-4">
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Hi, I'm{" "}
                <span className="gradient-text block sm:inline">
                  Suman Madipeddi
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl lg:text-3xl text-muted-foreground font-light">
                AI/ML Software Engineer
              </p>
            </div>
            
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto md:mx-0">
            AI Engineer 2 years of experience in building Multi Agents, Fine tuning LLMs and scalable full stack applications.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center md:justify-start">
              <Button 
                onClick={() => scrollToSection("#experience")}
                className="btn-hero text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
              >
                View My Work
                <ExternalLink className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button 
                variant="outline"
                className="btn-ghost-premium text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
                onClick={downloadResume}
              >
                Download CV
                <Download className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          {/* Profile Image */}
          <div className={`relative order-first md:order-last ${isVisible ? "animate-scale-in" : "opacity-0"}`} style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary rounded-2xl md:rounded-3xl blur-2xl opacity-20 animate-pulse" />
              <img
                src={profileImage}
                alt="Professional Portrait"
                className="relative w-80 h-85 sm:w-72 sm:h-90 md:w-80 md:h-85 mx-auto rounded-3xl md:rounded-3xl shadow-strong hover-lift object-cover"
              />
            </div>
            
            {/* Social Media Links Under Photo */}
            <div className="flex justify-center space-x-4 sm:space-x-6 mt-4 sm:mt-6">
              <a
                href="https://linkedin.com/in/suman-madipeddi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground hover:text-accent transition-colors duration-200 hover:scale-110 transform group"
              >
                <Linkedin className="h-5 w-5 sm:h-6 sm:w-6 group-hover:text-blue-600" />
                <span className="font-medium text-sm sm:text-base">LinkedIn</span>
              </a>
              <a
                href="https://github.com/SumanMadipeddi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground hover:text-accent transition-colors duration-200 hover:scale-110 transform group"
              >
                <Github className="h-5 w-5 sm:h-6 sm:w-6 group-hover:text-gray-800 dark:group-hover:text-white" />
                <span className="font-medium text-sm sm:text-base">GitHub</span>
              </a>
              <a
                href="https://x.com/suman_madipeddi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground hover:text-accent transition-colors duration-200 hover:scale-110 transform group"
              >
                <span className="h-5 w-5 sm:h-6 sm:w-6 group-hover:text-blue-400 font-bold text-base sm:text-lg">𝕏</span>
                <span className="font-medium text-sm sm:text-base">X</span>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button
            onClick={() => scrollToSection("#projects")}
            className="p-2 sm:p-3 rounded-full glass hover:shadow-glow transition-all duration-300"
          >
            <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
          </button>
        </div>
      </div>
    </section>
  );
}