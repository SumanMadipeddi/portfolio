import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


const experiences = [
  {
    company: "Stealth AI Startup",
    location: "San Francisco, United States",
    position: "AI/ML Software Engineer",
    duration: "10/2025 - Present",
    achievements: [ 
      "Architected and deployed full-stack document automation system (FastAPI, React, TypeScript) integrating multi-agent orchestration (LLM planning, retrieval, tool-use) and DeepSeek-OCR for complex document workflows.",
      "Achieved 91% extraction accuracy on unstructured documents by reducing processing time by 85% to minutes per documents.",
      "Built reinforcement learning training pipeline using SWE-Bench to optimize multi-step reasoning agents, improving task completion rate from 40% to 70% across 100+ test scenarios."
    ],
    technologies: ["Computer Vision","Machine Learning", "FastAPI", "React", "Express.js","Typescript", "DeepSeek-OCR", "vLLM","GCP", "PostgreSQL", "RL"]
  },
  {
    company: "Minor Chores",
    link: "https://www.minorchores.com/",
    location: "United States",
    position: "AI and LLMs Engineer",
    duration: "08/2024 - Present",
    achievements: [
    "Designed and Fine-tuned LLaMA-3.1-8B with LoRA (rank-16) and 4-bit quantization on 4K+ proprietary examples, reducing inference costs by 78% while maintaining 89% accuracy. Deployed with vLLM achieving 120ms P95 latency.",
    "Developed production RAG chatbot with Vertex AI and Pinecone Vector DB serving 3K+ queries/month with reducing API costs. Built geospatial recommendation engine with location, chores, improving task assignment accuracy by 86%.",
    "Led development of React Native app (iOS + Android) with Express.js backend, implementing real-time messaging (Telnyx), payment processing (Stripe), and push notifications. Shipped to 2K+ users across 2 major releases.",
    "Improved performance and engagement on Product Launch by reducing latency 40%. Drove 25% increase in onboarding and 30% boost in customer retention through UI/UX improvements and personalized messaging.",
    ],
    technologies: ["Fine-Tuning", "LoRA", "QLoRA","Ollama","vLLM","React", "Express.js","Typescript", "Machine Learning", "Vertex AI", "RAG","AWS", "GCP","React Native", "Swift","PostgreSQL", "Kubernetes", "Microservices"]
  },
  {
    company: "Inventors Foundation",
    link: "https://inventorsfoundation.org/",
    location: "San Jose, United States",
    position: "AI Engineer - Patent Automation & Video Intelligence",
    duration: "06/2025 - 09/2025",
    achievements: [
        "Automated patent content workflows by developing a full-stack pipeline (FastAPI, React, USPTO API), replacing manual effort.",
        "Engineered multi-stage content, text/drawing extraction using OCR and GPT-4 for video generation with Kapwing.",
        " Deployed system processing 50+ patents with 94% client satisfaction and reducing content production from 3 days to 1 hour.",
    ],
    technologies: ["Node.js", "React", "USPTO APIs", "OCR", "GPT-4", "ElevenLabs", "Kapwing", "Veo3", "google Vids","Python", "JavaScript", "Typescript"]
  }
];

export function ExperienceSection() {
  return (
    <section id="experience" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
         <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Professional <span className="gradient-text">Experience</span>
          </h2>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {experiences.map((exp, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent/50">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-2xl text-foreground group-hover:text-accent transition-colors">
                      {exp.position}
                    </CardTitle>
                     <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                       {exp.link ? (
                         <a 
                           href={exp.link} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-lg font-semibold text-accent hover:underline transition-colors flex items-center gap-1 group"
                         >
                           {exp.company}
                           <svg className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                           </svg>
                         </a>
                       ) : (
                         <span className="text-lg font-semibold text-accent">{exp.company}</span>
                       )}
                       <span className="text-muted-foreground">•</span>
                       <span className="text-muted-foreground">{exp.location}</span>
                     </div>
                  </div>
                  <Badge variant="secondary" className="w-fit text-sm font-medium">
                    {exp.duration}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Key Achievements:</h4>
                    <ul className="space-y-3">
                      {exp.achievements.map((achievement, achIndex) => (
                        <li key={achIndex} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground leading-relaxed">
                            {achievement}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Technologies Used:</h4>
                     <div className="flex flex-wrap gap-2">
                       {exp.technologies.map((tech, techIndex) => (
                         <Badge 
                           key={techIndex} 
                           variant="secondary"
                           className="px-3 py-1 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
                         >
                           {tech}
                         </Badge>
                       ))}
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
