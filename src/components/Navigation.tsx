import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = navItems.map(item => item.href.substring(1));
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? "glass shadow-medium backdrop-blur-xl" 
        : "bg-transparent"
    }`}>
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold gradient-text">
            Suman Madipeddi
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className={`relative py-2 px-1 text-sm font-medium transition-colors duration-200 ${
                  activeSection === item.href.substring(1)
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
                {activeSection === item.href.substring(1) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
                )}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              onClick={() => scrollToSection("#contact")}
              className="btn-hero hidden md:inline-flex"
            >
              Let's Talk
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}