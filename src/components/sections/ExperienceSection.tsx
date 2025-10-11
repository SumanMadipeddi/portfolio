import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


const experiences = [
  {
    company: "Minor Chores",
    link: "https://www.minorchores.com/",
    location: "USA",
    position: "AI and LLMs Engineer",
    duration: "01/2025 - Present",
    achievements: [
    "Designed and fine-tuned LLaMA-3.1-8B-Instruct with LoRA and QLoRA quantization on proprietary company data for in-house inference using Ollama and future-proof AI capabilities, while building a RAG-based conversational chatbot for customers and recommendation engine using Linear Regression leveraging geospatial and behavioral data for real-time chores matching",
    "Led end-to-end modernization of UI/UX on iOS and Android, development of mobile application using React Native, TypeScript and Swift in a microservices architecture and deploying seamlessly with Kubernetes for scalable, production-grade reliability.",
    "Improved performance and engagement on Product Launch by reducing latency 40%, introducing broadcast + interactive messaging, and driving measurable gains in onboarding 25% and user engagement 30%",
    ],
    technologies: ["Fine-Tuning", "LoRA", "QLoRA","Ollama","vLLM","React", "Express.js","Typescript", "Machine Learning", "Vertex AI", "RAG", "RLHF","AWS", "GCP","React Native", "Swift","PostgreSQL", "Kubernetes", "Microservices"]
  },
  {
    company: "Inventors Foundation",
    link: "https://inventorsfoundation.org/",
    location: "San Jose, CA, USA",
    position: "AI Engineer - Patent Automation & Video Intelligence",
    duration: "06/2025 - 09/2025",
    achievements: [
        "Automated patent content operations: Replaced 20+ hours of weekly manual effort by designing and deploying a full-stack automation pipeline (FastAPI backend, React frontend, USPTO API integration).",

        "Engineered AI-driven content generation: Applied OCR for text/drawing extraction and leveraged GPT-4 to produce clear patent summaries; automated branded video creation with Kapwing, including voiceovers and embedded visuals.",
        
        "Delivered measurable business impact: Reduced turnaround time from days to hours, significantly improved workflow efficiency, and increased client adoption and satisfaction across partner law firms.",
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
