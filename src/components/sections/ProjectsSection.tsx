import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github } from "lucide-react";
import dashboardImage from "@/assets/dashboard.png";
import voiceAgentImage from "@/assets/voiceagent_dashboard.png";
import cryptoStreamImage from "@/assets/crypto_stream.png";
import textVideoImage from "@/assets/text_video.png";
import objectSegmentationImage from "@/assets/ObjectSegmentation.jpg";
import fineTuningImage from "@/assets/finetuning.jpg";
import ragVoice from "@/assets/rag_voice_agent.png"

const projects = [
  {
    title: "RAG Multi Agent Voice AI",
    description: "RAG Enabled multi agent voice assistant with pinecone vector DB, tool calls and mcp servers using LiveKit",
    image:ragVoice, // Updated to a working image
    technologies: ["LiveKit","Langchain","Pinecone","RAG", "React", "Typescript", "Deepgram", "OpenAI", "Docker"],
    liveUrl: "https://www.loom.com/share/c7950b8eda37434893fb03e091a89ebe", // Add your actual live demo URL here
    githubUrl: "https://github.com/SumanMadipeddi/voice-agent",
    featured: true
  },

  {
    title: "Fine-Tuning and Inference",
    description: "Fine-tuning and Inference of LLaMA-3.1-8B-Instruct with LoRA and QLoRA quantization on proprietary company data for in-house inference using Ollama and future-proof AI capabilities",
    image:fineTuningImage, // Updated to a working image
    technologies: ["Fine-Tuning", "LoRA", "QLoRA","PEFT","GPU","CUDA","Ollama","OpenAI","vLLM", "HuggingFace","Transformers","AWS"],
    liveUrl: "", // Add your actual live demo URL here
    githubUrl: "https://github.com/SumanMadipeddi/vllm-finetuned-inference-serving",
    featured: true
  },

  {
    title: "Voice AI Agent",
    description: "Call the leads on the Go-high level CRM to qualify the leads and schedule the appointments",
    image:voiceAgentImage, // Updated to a working image
    technologies: ["React", "Typescript", "Twilio", "OpenAI","GoHighLevel CRM","Deepgram", "PostgreSQL", "Docker", "Sesame"],
    liveUrl: "https://www.loom.com/embed/9789dce2a003495585dd9547a5e0425d", // Add your actual live demo URL here
    githubUrl: "https://github.com/SumanMadipeddi/Setter.AI",
    featured: true
  },

  

  {
    title: "Multimodal text to Image and Video creation",
    description: "A multimodal text to video creation application",
    image:textVideoImage, // Updated to a working image
    technologies: ["Difussion Models", "HuggingFace","CUDA","GPUs","Node.js","Next.js", "Typescript","ffmpeg", "GPT-4o"],
    liveUrl: "https://drive.google.com/file/d/1X8cXniViIfXW9-sWRY8oSNeT84pZ7XQ3/view?usp=sharing", // Add your actual live demo URL here
    githubUrl: "https://github.com/SumanMadipeddi/text-video",
    featured: true
  },

  {
    title: "Object Segmentation on ARMBench",
    description: "Achieved state-of-the-art performance on ARMBench, beating benchmark results in object segmentation",
    image:  objectSegmentationImage, // Updated to a working image
    technologies: ["LangChain", "Gemini", "grok", "FAISS", "Chromadb", "Python", "Streamlit"],
    liveUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7195244374438424577/", // No live demo
    githubUrl: "https://github.com/SumanMadipeddi/Object-Segmentation-on-ARMBENCH",
    featured: true
  },

  {
    title: "Jobsync AI",
    description: "A Job Search Assistant that uses AI to help you tailor your resume, cover letter, generates project ideas and drafts cold emails",
    image: dashboardImage, 
    // Updated to use the new image
    technologies: ["LangChain", "Gemini", "grok", "FAISS", "Chromadb", "Python", "Streamlit"],
    liveUrl: "https://jobsyncai-sm.streamlit.app/",
    githubUrl: "https://github.com/SumanMadipeddi/JobSyncAI",
    featured: true
  },

  {
    title: "Realtime Crypto Stream",
    description: "A realtime crypto stream application that uses the Playwright Web Scraping to get the realtime crypto prices and charts",
    image:cryptoStreamImage, // Updated to a working image
    technologies: ["Next.js","Express.js", "Typescript", "Playwright","ConnectRPC", "Web Scraping & Automation", "WebSocket","Tailwind CSS"],
    liveUrl: "https://drive.google.com/file/d/1bn_vYEWu2fOZ9z2U2BSRdlxKyTWM1hxi/view?usp=drive_link", // Add your actual live demo URL here
    githubUrl: "https://github.com/SumanMadipeddi/CryptoStream",
    featured: true
  }
];

export function ProjectsSection() {
  return (
    <section id="projects" className="py-16 sm:py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              <span className="gradient-text">Projects</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              My recent work, highlighting different technologies and innovative solutions.
            </p>
          </div>

          {/* Featured Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12">
            {projects
              .filter(project => project.featured)
              .map((project, index) => (
                <Card
                  key={project.title}
                  className="group glass hover-lift overflow-hidden animate-scale-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="relative overflow-hidden">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                        <div className="text-muted-foreground text-center">
                          <div className="text-4xl mb-2">🚀</div>
                          <div className="text-sm">Project Image</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        {/* Only show Live Demo button if liveUrl exists */}
                        {project.liveUrl && (
                          <Button 
                            size="sm" 
                            className="btn-hero"
                            onClick={() => window.open(project.liveUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Live Demo
                          </Button>
                        )}
                        {/* Only show Code button if githubUrl exists */}
                        {project.githubUrl && (
                          <Button 
                            size="sm" 
                            className="btn-hero"
                            onClick={() => window.open(project.githubUrl, '_blank')}
                          >
                            <Github className="h-4 w-4 mr-1" />
                            Code
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3">{project.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed text-sm sm:text-base">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {project.technologies.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="bg-accent/10 text-accent text-xs sm:text-sm px-2 py-1"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Other Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {projects
              .filter(project => !project.featured)
              .map((project, index) => (
                <Card
                  key={project.title}
                  className="group glass hover-lift animate-fade-up"
                  style={{ animationDelay: `${(index + 2) * 0.1}s` }}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold">{project.title}</h3>
                      <div className="flex space-x-1 sm:space-x-2">
                        {/* Only show Live Demo button if liveUrl exists */}
                        {project.liveUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-2 h-8 w-8 hover:text-accent"
                            onClick={() => window.open(project.liveUrl, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                        {/* Only show Code button if githubUrl exists */}
                        {project.githubUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-2 h-8 w-8 hover:text-accent"
                            onClick={() => window.open(project.githubUrl, '_blank')}
                          >
                            <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 text-xs sm:text-sm leading-relaxed">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs bg-accent/10 text-accent px-1 py-0.5"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* View All Projects */}
          <div className="text-center mt-8 sm:mt-12">
            <Button 
              variant="outline" 
              className="btn-ghost-premium text-sm sm:text-lg px-6 sm:px-8 py-4 sm:py-6"
              onClick={() => window.open("https://github.com/SumanMadipeddi", '_blank')}
            >
              View All Projects on GitHub
              <Github className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
