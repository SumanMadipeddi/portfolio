import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Linkedin, Github, Twitter, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    value: "smadiped@asu.edu",
    href: "mailto:smadiped@asu.edu"
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+1 (602) 565-9192",
    href: "tel:+16025659192"
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Tempe, AZ",
    href: "#"
  }
];

const socialLinks = [
  {
    icon: Linkedin,
    name: "LinkedIn",
    href: "https://linkedin.com/in/suman-madipeddi",
    color: "hover:text-blue-600"
  },
  {
    icon: Github,
    name: "GitHub", 
    href: "https://github.com/SumanMadipeddi",
    color: "hover:text-gray-800 dark:hover:text-gray-200"
  },
  {
    icon: Twitter,
    name: "X",
    href: "https://x.com/suman_madipeddi",
    color: "hover:text-blue-500"
  }
];

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent successfully!",
        description: "Thank you for your message. I'll get back to you soon.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="contact" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Let's <span className="gradient-text">Connect</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have a vision or want to collaborate? Let’s connect, innovate and build the future
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card className="glass hover-lift">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6">Send me a message</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name"
                          required
                          className="glass"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          required
                          className="glass"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input 
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="What's this about?"
                        required
                        className="glass"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell me about your project or idea..."
                        rows={6}
                        required
                        className="glass resize-none"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="btn-hero w-full text-lg py-6"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                      <Send className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Methods */}
              <Card className="glass hover-lift">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-6">Get in touch</h3>
                  <div className="space-y-6">
                    {contactMethods.map((method) => (
                      <a
                        key={method.title}
                        href={method.href}
                        className="flex items-center space-x-4 text-muted-foreground hover:text-accent transition-colors duration-200 group"
                      >
                        <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                          <method.icon className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{method.title}</p>
                          <p className="text-sm">{method.value}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="glass hover-lift">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-6">Follow me</h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-3 rounded-lg bg-accent/10 hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-110 ${social.color}`}
                      >
                        <social.icon className="h-5 w-5" />
                        <span className="sr-only">{social.name}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}