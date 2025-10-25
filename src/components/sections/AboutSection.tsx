import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Code, Database, Rocket, Users } from "lucide-react";

const highlights = [
  {
    icon: Brain,
    title: "AI/ML Software Engineering",
    description: "Building AI Agents with MCP and Fine tuning LLMs, architecting scalable LLM-powered systems to RAG pipelines, voice agents and computer vision models"
  },
  {
    icon: Database,
    title: "Machine Learning Ops",
    description: "Orchestrating ML workflows by automating deployment and optimizing inference pipelines."
  },
  {
    icon: Code,
    title: "Full-Stack Development",
    description: "Engineering RESTful APIs and seamless UIs with modern frameworks and cloud-native tools."
  },
  {
    icon: Rocket,
    title: "Performance Optimization",
    description: "Enhancing latency, scalability, and efficiency."
  },
  {
    icon: Users,
    title: "Technical Leadership & Collaboration",
    description: "Driving innovation by leading cross-functional teams"
  }
];

const technologies = ["PyTorch", "TensorFlow","Fine-Tuning","Hugging Face", "LangChain", "LangGraph", "On-Device Inference","Python","React", "TypeScript", "Node.js","Prisma", "AWS", "GCP", "Docker", "Kubernetes", "CI/CD", "PostgreSQL", "MongoDB","FAISS", "GraphQL", "Next.js"
];

export function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-20 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              About <span className="gradient-text">Me</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            AI Engineer specializing in building scalable, intelligent systems, AI Agents. Research into AGI and Emotional intelligence and building JARVIS
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-start">
            {/* Story */}
            <div className="space-y-6">
              <Card className="glass hover-lift">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4">My Journey</h3>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p className="text-left sm:text-justify text-sm sm:text-base">
                      Every innovation starts with curiosity and mine was a fascination with how intelligence could be engineered. That curiosity led me to AI, ML, robotics. where I've spent years turning complex ideas into real-world solutions.
                    </p>
                    <p className="text-left sm:text-justify text-sm sm:text-base">
                      I've worked with 2 startups and building AI architected software solutions,RAG-powered assistants and recommendation engines developing mobile apps. I've worked with cross functional teams at the intersection of research and production.
                    </p>
                    <p className="text-left sm:text-justify text-sm sm:text-base">
                      When I'm not building intelligent systems, I explore cutting-edge research in AGI and reinforcement learning, experiment with emerging technologies, and share insights through collaboration
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Technologies */}
              <Card className="glass hover-lift">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Highlights */}
            <div className="grid gap-4 sm:gap-6">
              {highlights.map((highlight, index) => (
                <Card
                  key={highlight.title}
                  className="glass hover-lift animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="p-2 sm:p-3 rounded-lg bg-accent/10 flex-shrink-0">
                        <highlight.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">
                          {highlight.title}
                        </h3>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          {highlight.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}