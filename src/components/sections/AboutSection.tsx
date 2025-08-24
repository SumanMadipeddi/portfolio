import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Code, Database, Rocket, Users } from "lucide-react";

const highlights = [
  {
    icon: Brain,
    title: "AI Engineer",
    description: "Architecting scalable AI solutions, from LLM-powered systems to RAG pipelines and voice agents."
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

const technologies = ["PyTorch", "TensorFlow","Hugging Face", "LangChain","Python","React", "TypeScript", "Node.js", "AWS", "GCP", "Docker", "Kubernetes", "CI/CD", "PostgreSQL", "MongoDB","FAISS", "GraphQL", "Next.js"
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              About <span className="gradient-text">Me</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AI Engineer specializing in building scalable, intelligent systems, AI Agents and automation pipelines. Passionate about AGI research and building JARVIS.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Story */}
            <div className="space-y-6">
              <Card className="glass hover-lift">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-4">My Journey</h3>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p className="text-justify">
                      Every innovation starts with curiosity—and mine was a fascination with how intelligence could be engineered. That curiosity led me to AI, ML, robotics. where I've spent years turning complex ideas into real-world solutions.
                    </p>
                    <p className="text-justify">
                      I've worked with startups and building RAG-powered assistants and recommendation engines to architecting cloud-native AI platforms and developing mobile apps. I've worked at the intersection of research and production.
                    </p>
                    <p className="text-justify">
                      When I'm not building intelligent systems, I explore cutting-edge research in AGI and reinforcement learning, experiment with emerging technologies, and share insights through collaboration
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Technologies */}
              <Card className="glass hover-lift">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="px-3 py-1 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Highlights */}
            <div className="grid gap-6">
              {highlights.map((highlight, index) => (
                <Card
                  key={highlight.title}
                  className="glass hover-lift animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-accent/10">
                        <highlight.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {highlight.title}
                        </h3>
                        <p className="text-muted-foreground">
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