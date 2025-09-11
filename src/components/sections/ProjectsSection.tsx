import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github } from "lucide-react";
import dashboardImage from "@/assets/dashboard.png";
import voiceAgentImage from "@/assets/voiceagent_dashboard.png";
import cryptoStreamImage from "@/assets/crypto_stream.png";
import textVideoImage from "@/assets/text_video.png";

const projects = [
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
    title: "Jobsync AI",
    description: "A Job Search Assistant that uses AI to help you tailor your resume, cover letter, generates project ideas to do and drafts cold emails",
    image: dashboardImage, 
    // Updated to use the new image
    technologies: ["LangChain", "Gemini", "grok", "FAISS", "Chromadb", "Python", "Streamlit"],
    liveUrl: "https://jobsyncai-sm.streamlit.app/",
    githubUrl: "https://github.com/SumanMadipeddi/JobSyncAI",
    featured: true
  },

  {
    title: "Realtime Crypoto Stream",
    description: "A realtime crypto stream application that uses the Playwright Web Scraping to get the realtme crypto prices and charts",
    image:cryptoStreamImage, // Updated to a working image
    technologies: ["React & Next.js", "Node.js","Express.js", "Typescript", "Playwright", "Web Scraping & Automation", "WebSocket","Tailwind CSS"],
    liveUrl: "https://drive.google.com/file/d/1bn_vYEWu2fOZ9z2U2BSRdlxKyTWM1hxi/view?usp=drive_link", // Add your actual live demo URL here
    githubUrl: "https://github.com/SumanMadipeddi/CryptoStream",
    featured: true
  },

  {
    title: "Gesture Recognition",
    description: "Collaborative task management application with real-time updates, team workflows, and progress tracking.",
    media: {
      type: "video",
      url: "https://www.loom.com/embed/9789dce2a003495585dd9547a5e0425d", // Replace with your actual gesture video
      thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&q=80"
    },
    technologies: ["Next.js", "TypeScript", "Prisma", "WebSocket"],
    liveUrl: "https://your-gesture-demo.com", // Replace with actual live demo URL
    githubUrl: "https://github.com/SumanMadipeddi/Mars-crater-visualization",
    featured: false
  },
  {
    title: "Object Segmentation on ARMBench",
    description: "Achieved state-of-the-art performance on ARMBench, beating benchmark results in object segmentation",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&q=80", // Updated to a working image
    technologies: ["LangChain", "Gemini", "grok", "FAISS", "Chromadb", "Python", "Streamlit"],
    liveUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7195244374438424577/", // No live demo
    githubUrl: "https://github.com/SumanMadipeddi/Object-Segmentation-on-ARMBENCH",
    featured: false
  },
  {
    title: "Voice Assistant",
    description: "A voice assistant built for Summarization of the live meetings",
    image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&q=80", // Updated to a working image
    technologies: ["llama3", "FAISS","Python", "RestFul APIs"],
    liveUrl: "", // No live demo
    githubUrl: "https://github.com/SumanMadipeddi/Voice-Assistant",  
    featured: false
  }
];

export function ProjectsSection() {
  return (
    <section id="projects" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="gradient-text">Projects</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              My recent work, highlighting different technologies and innovative solutions.
            </p>
          </div>

          {/* Featured Projects */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {projects
              .filter(project => project.featured)
              .map((project, index) => (
                <Card
                  key={project.title}
                  className="group glass hover-lift overflow-hidden animate-scale-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="relative overflow-hidden">
                    {project.media?.type === "video" ? (
                      <div className="relative w-full h-64 group/video">
                        <iframe
                          src={project.media.url}
                          title={project.title}
                          className="w-full h-full border-0 rounded-t-lg transition-all duration-500 group-hover/video:scale-110"
                          allowFullScreen
                          loading="lazy"
                          frameBorder="0"
                          allow="autoplay; fullscreen"
                        />
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            Hover to interact
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={project.image || project.media?.thumbnail}
                        alt={project.title}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
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
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{project.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="bg-accent/10 text-accent"
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
          <div className="grid md:grid-cols-2 gap-6">
            {projects
              .filter(project => !project.featured)
              .map((project, index) => (
                <Card
                  key={project.title}
                  className="group glass hover-lift animate-fade-up"
                  style={{ animationDelay: `${(index + 2) * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <div className="flex space-x-2">
                        {/* Only show Live Demo button if liveUrl exists */}
                        {project.liveUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-2 h-8 w-8 hover:text-accent"
                            onClick={() => window.open(project.liveUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
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
                            <Github className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs bg-accent/10 text-accent"
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
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="btn-ghost-premium text-lg px-8 py-6"
              onClick={() => window.open("https://github.com/SumanMadipeddi", '_blank')}
            >
              View All Projects on GitHub
              <Github className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
