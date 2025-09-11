import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Database, Palette, Cloud, Smartphone, Globe, Brain } from "lucide-react";
import { useEffect, useState } from "react";

const skillCategories = [
  {
    title: "AI & Machine Learning",
    icon: Brain,
    skills: ["PyTorch", "TensorFlow", "Scikit-Learn", "Hugging Face", "Gemini, OpenAI, Claude", "LangChain", "Transformers", "CLIP,  Flamingo", "Model Optimization", "Fine-Tuning", "Reinforcement Learning", "LoRA"]
  },

  {
    title: "Frontend Development",
    icon: Code,
    skills: ["Python", "React/Next.js", "TypeScript", "JavaScript", "d3.js","Webpack","Figma"]
  },

  {
    title: "Backend Development", 
    icon: Database,
    skills: ["Node.js", "Python", "PostgreSQL", "GraphQL", "Express.js", "Django", "MongoDB", "REST APIs", "JWT", "Socket.io"]
  },

  {
    title: "Cloud & DevOps",
    icon: Cloud,
    skills: ["AWS", "GCP (Vertex AI, Firestore)", "Docker", "CI/CD", "Kubernetes", "Terraform", "Jenkins", "Git, GitHub Actions", "Linux","Serverless"]
  }
];

const certifications = [
  "AWS Certified Solutions Architect",
  "Google Cloud Professional"
];

const achievements = [
  {
    title: "Object Segmentation Expert",
    description: "Achieved state-of-the-art performance on ARMBench, beating benchmark results in object segmentation"
  },

  {
    title: "Open Source Contributor",
    description: "Active contributor to the glass "
  }
];

export function SkillsSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('skills');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold gradient-text mb-6">
              Skills & Expertise
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A comprehensive overview of my technical skills, certifications & achievements.
            </p>
          </div>

          {/* Skills Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {skillCategories.map((category, categoryIndex) => (
              <Card
                key={category.title}
                className="glass hover-lift animate-fade-up"
                style={{ animationDelay: `${categoryIndex * 0.1}s` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-lg bg-accent/10 mr-4">
                      <category.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold">{category.title}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {category.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="w-full justify-start p-2 bg-accent/5 text-accent border border-accent/20 text-sm"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Certifications & Achievements */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Certifications */}
            <Card className="glass hover-lift">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <div className="p-2 rounded-lg bg-accent/10 mr-3">
                    <Globe className="h-5 w-5 text-accent" />
                  </div>
                  Certifications
                </h3>
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <Badge
                      key={cert}
                      variant="secondary"
                      className="w-full justify-start p-3 bg-accent/5 text-accent border border-accent/20"
                    >
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="glass hover-lift">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <div className="p-2 rounded-lg bg-accent/10 mr-3">
                    <Smartphone className="h-5 w-5 text-accent" />
                  </div>
                  Achievements
                </h3>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.title} className="border-l-2 border-accent/20 pl-4">
                      <h4 className="font-medium text-accent">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}