import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Linkedin, Github, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendEmail, EmailTemplateData } from "@/lib/emailjs";

// Custom X (Twitter) Icon Component - like the one under your photo
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    value: "smadiped@asu.edu",
    href: "#"
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
    href: "https://maps.google.com/?q=Tempe,AZ"
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
    icon: XIcon,
    name: "X",
    href: "https://x.com/suman_madipeddi",
    color: "hover:text-black dark:hover:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:scale-110"
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

  // Handle email link click
  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const email = "smadiped@asu.edu";
    const subject = "Portfolio Inquiry";
    
    // Open Gmail directly in browser (more reliable than mailto)
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}`;
    
    try {
      // Open Gmail compose in new tab
      const gmailWindow = window.open(gmailUrl, '_blank');
      
      if (gmailWindow) {
        // Success - Gmail opened
        toast({
          title: "Gmail opened!",
          description: `Ready to send email to ${email}`,
        });
      } else {
        // Popup blocked - fallback to clipboard
        throw new Error('Popup blocked');
      }
      
    } catch (error) {
      console.error('Gmail link error:', error);
      
      // Fallback: copy email to clipboard
      navigator.clipboard.writeText(email);
      toast({
        title: "Email copied!",
        description: `Email address copied to clipboard: ${email}`,
      });
    }
  };
  
  // Handle phone link click
  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      window.location.href = "tel:+16025659192";
    } catch (error) {
      console.error('Phone link error:', error);
      navigator.clipboard.writeText("+1 (602) 565-9192");
      toast({
        title: "Phone number copied!",
        description: "Phone number copied to clipboard: +1 (602) 565-9192",
      });
    }
  };

  // Handle location link click
  const handleLocationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Open Google Maps immediately without delay
      const mapsUrl = "https://maps.google.com/?q=Tempe,AZ";
      const mapsWindow = window.open(mapsUrl, '_blank');
      
      if (mapsWindow) {
        // Success - maps opened
        toast({
          title: "Google Maps opened!",
          description: "Your location is now displayed",
        });
      } else {
        // Popup blocked - fallback to clipboard
        throw new Error('Popup blocked');
      }
    } catch (error) {
      console.error('Location link error:', error);
      // Fallback: copy address to clipboard
      navigator.clipboard.writeText("Tempe, AZ");
      toast({
        title: "Address copied!",
        description: "Address copied to clipboard: Tempe, AZ",
      });
    }
  };

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

    try {
      // Prepare email data
      const emailData: EmailTemplateData = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: 'smadiped@asu.edu', // Your email address
      };

      // Send email using EmailJS
      const result = await sendEmail(emailData);

      if (result.status === 200) {
        toast({
          title: "Message sent successfully!",
          description: "Thank you for your message. I'll get back to you soon.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      console.error('EmailJS Error:', error);
      toast({
        title: "Failed to send message",
        description: "Something went wrong. Please try again or contact me directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                        onClick={method.title === "Email" ? handleEmailClick : 
                                method.title === "Phone" ? handlePhoneClick : 
                                method.title === "Location" ? handleLocationClick : undefined}
                        className="flex items-center space-x-4 text-muted-foreground hover:text-accent transition-colors duration-200 group cursor-pointer"
                        {...(method.title === "Email" && { target: "_self" })}
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