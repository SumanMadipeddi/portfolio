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

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className={`space-y-10 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
            <div className="space-y-4">
              
              <h1 className="text-4xl lg:text-7xl font-bold leading-tight">
                Hi, I'm{" "}
                <span className="gradient-text">
                  Suman Madipeddi
                </span>
              </h1>

              <p className="text-lg lg:text-2xl text-muted-foreground font-light">
                AI Engineer & Software Engineer ML
              </p>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
            AI Engineer with 2+ years of experience designing scalable systems, LLM-based solutions, AI Agents and automation pipelines.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => scrollToSection("#experience")}
                className="btn-hero text-lg px-8 py-6"
              >
                View My Work
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                className="btn-ghost-premium text-lg px-8 py-6"
                onClick={downloadResume}
              >
                Download CV
                <Download className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Profile Image */}
          <div className={`relative ${isVisible ? "animate-scale-in" : "opacity-0"}`} style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary rounded-3xl blur-2xl opacity-20 animate-pulse" />
              <img
                src={profileImage}
                alt="Professional Portrait"
                className="relative w-80 h-85 mx-auto rounded-3xl shadow-strong hover-lift object-cover"
              />
            </div>
            
            {/* Social Media Links Under Photo */}
            <div className="flex justify-center space-x-6 mt-6">
              <a
                href="https://linkedin.com/in/suman-madipeddi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors duration-200 hover:scale-110 transform group"
              >
                <Linkedin className="h-6 w-6 group-hover:text-blue-600" />
                <span className="font-medium">LinkedIn</span>
              </a>
              <a
                href="https://github.com/SumanMadipeddi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors duration-200 hover:scale-110 transform group"
              >
                <Github className="h-6 w-6 group-hover:text-gray-800 dark:group-hover:text-white" />
                <span className="font-medium">GitHub</span>
              </a>
              <a
                href="https://x.com/suman_madipeddi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors duration-200 hover:scale-110 transform group"
              >
                <span className="h-6 w-6 group-hover:text-blue-400 font-bold text-lg">𝕏</span>
                <span className="font-medium">X</span>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button
            onClick={() => scrollToSection("#about")}
            className="p-2 rounded-full glass hover:shadow-glow transition-all duration-300"
          >
            <ArrowDown className="h-6 w-6 text-accent" />
          </button>
        </div>
      </div>
    </section>
  );
}