"use client";

import Link from "next/link"
// import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  CloudCog,
  BarChart,
  Lock,
  FlaskRoundIcon as Flask,
  Sparkles,
  Zap,
  Github,
  CheckCircle2,
} from "lucide-react"

export function LandingPage() {
  // const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-background/80">
      <header className="border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Flask className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight">mutatio.dev</span>
          </div>
          <div className="flex items-center">
            <nav className="hidden md:flex items-center gap-6 mr-4">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#workflow"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Workflow
              </a>
              <a
                href="#start"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Get Started
              </a>
              <a href="https://github.com/albertoperdomo2/mutatio.dev" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Github className="h-4 w-4" />
              </a>
            </nav>
            <div className="flex items-center gap-2 sm:gap-3">
              <ModeToggle />
              <div className="hidden sm:block">
                <Link href="/login">
                  <Button variant="ghost" className="font-medium">Sign in</Button>
                </Link>
              </div>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 font-medium whitespace-nowrap">
                  <span className="sm:hidden">Sign up</span>
                  <span className="hidden sm:inline">Get started</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 sm:py-20 md:py-32 overflow-hidden">
          <div className="container mx-auto px-4 relative">
            {/* Ambient background blur */}
            <div className="absolute -top-[30%] left-[20%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-20 -z-10" />
            <div className="absolute top-[50%] -right-[10%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-purple-500/20 rounded-full blur-[100px] opacity-20 -z-10" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
              <div className="space-y-6 sm:space-y-8">
                <Badge className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  100% Open Source
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  <span className="block">Stop writing bad</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 pb-1">AI prompts</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
                  mutatio.dev enables AI engineers to systematically test, measure, 
                  and optimize prompts with sophisticated tools. Privacy-first and community-driven.
                </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Open source, no credit card required. Free for individual use.
                  </div>
                <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 font-medium w-full sm:w-auto"
                    >
                      Start for free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Sign in
                    </Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:flex sm:items-center gap-3 sm:gap-8 pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary/80 flex-shrink-0" />
                    <span>AI-powered validation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary/80 flex-shrink-0" />
                    <span>Custom models</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary/80 flex-shrink-0" />
                    <span>Secure & private</span>
                  </div>
                </div>
              </div>

              <div className="relative mt-8 lg:mt-0">
                {/* Playground Animation */}
                <div className="relative bg-card/95 border rounded-xl shadow-2xl overflow-hidden mx-auto max-w-md lg:max-w-none">
                  {/* Mock header for playground */}
                  <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Sparkles className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary" />
                      <div className="text-xs sm:text-sm font-medium">Prompt Lab</div>
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0">
                        Playground
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Mock playground interface */}
                  <div className="p-3 sm:p-4 grid grid-cols-1 gap-3 sm:gap-4">
                    {/* Base prompt */}
                    <div className="border rounded-lg p-2 sm:p-3 bg-card">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <div className="text-[10px] sm:text-xs font-medium">Base Prompt</div>
                        <Badge variant="outline" className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0">
                          Original
                        </Badge>
                      </div>
                      <div className="text-[10px] sm:text-xs bg-muted/30 rounded p-1.5 sm:p-2 font-mono">
                        Explain quantum computing to a high school student
                      </div>
                    </div>
                    
                    {/* Mutation Generation - Animated */}
                    <div className="relative">
                      <div className="flex items-center mb-1.5 sm:mb-2">
                        <div className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex items-center justify-center rounded-full bg-primary/20 mr-1.5 sm:mr-2">
                          <Zap className="h-2 sm:h-2.5 w-2 sm:w-2.5 text-primary" />
                        </div>
                        <div className="text-[10px] sm:text-xs font-medium">Generated Mutations</div>
                      </div>
                      
                      {/* Animations of mutations appearing */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="border rounded-lg p-2 sm:p-3 bg-card/80 animate-fade-in relative overflow-hidden">
                          <div className="absolute inset-0 bg-primary/5 animate-pulse opacity-30"/>
                          <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                            <div className="text-[10px] sm:text-xs font-medium">
                              Formalize
                            </div>
                            <Badge className="bg-green-500/10 text-green-500 text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0">
                              9/10
                            </Badge>
                          </div>
                          <div className="text-[9px] sm:text-xs text-muted-foreground line-clamp-2 animate-fade-in opacity-0" style={{animationDelay: '0.7s', animationFillMode: 'forwards'}}>
                            Provide a clear, accessible explanation of the fundamental principles of quantum mechanics tailored to a high school education level.
                          </div>
                        </div>

                        <div className="border rounded-lg p-2 sm:p-3 bg-card/80 animate-fade-in relative overflow-hidden">
                          <div className="absolute inset-0 bg-primary/5 animate-pulse opacity-30" />
                          <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                            <div className="text-[10px] sm:text-xs font-medium flex items-center">
                              <span>Simplify</span>
                            </div>
                            <Badge className="bg-green-500/10 text-green-500 text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0">
                              8/10
                            </Badge>
                          </div>
                          <div className="text-[9px] sm:text-xs text-muted-foreground line-clamp-2 animate-fade-in opacity-0" style={{animationDelay: '1.4s', animationFillMode: 'forwards'}}>
                            Explain the basic ideas of quantum mechanics in simple terms that a high school student would understand.
                          </div>
                        </div>
                        <div className="border rounded-lg p-2 sm:p-3 bg-card/80 animate-fade-in relative overflow-hidden">
                          <div className="absolute inset-0 bg-primary/5 animate-pulse opacity-30" />
                          <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                            <div className="text-[10px] sm:text-xs font-medium">
                              Paraphrase
                            </div>
                            <Badge className="bg-yellow-500/10 text-yellow-500 text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0">
                              7/10
                            </Badge>
                          </div>
                          <div className="text-[9px] sm:text-xs text-muted-foreground line-clamp-2 animate-fade-in opacity-0" style={{animationDelay: '2.1s', animationFillMode: 'forwards'}}>
                          Describe the principles of quantum physics in terms that would be accessible to a teenager in secondary education.
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status indicator */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[9px] sm:text-xs bg-muted/20 p-1.5 sm:p-2 rounded mt-1.5 sm:mt-2 border animate-slide-up opacity-0" style={{animationDelay: '2.7s', animationFillMode: 'forwards'}}>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-0">
                        <BarChart className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-primary flex-shrink-0" />
                        <span>Validation complete</span>
                      </div>
                      <Badge variant="outline" className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0 bg-primary/5 whitespace-nowrap">
                        Best: Formalize (9/10)
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Video Section */}
        {/* <section id="demo" className="py-14 sm:py-16 md:py-20 bg-gradient-to-b from-background to-muted/10 border-t border-b">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 sm:mb-16 max-w-2xl mx-auto">
              <Badge className="px-3 py-1 mb-4 sm:mb-6 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                Video Demo
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">See mutatio.dev in action</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Watch how AI engineers use mutatio.dev to perfect prompts for production applications
              </p>
            </div>

            <div className="relative aspect-video border rounded-xl bg-card shadow-sm overflow-hidden">
              {!videoPlaying ? (
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/5"
                  onClick={() => setVideoPlaying(true)}
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Click to play (1:34)</span>
                  </div>
                  <div 
                    className="w-full h-full bg-gradient-to-br from-primary/10 to-background absolute inset-0 -z-10 flex items-center justify-center"
                  >
                    <Flask className="h-16 w-16 text-primary/30" />
                  </div>
                </div>
              ) : (
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="/demo-video.mp4" 
                  title="Mutatio Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </section> */}

        {/* Features Section */}
        <section id="features" className="py-14 sm:py-16 md:py-20 bg-gradient-to-b from-background to-muted/10 border-t border-b">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 sm:mb-16 max-w-2xl mx-auto">
              <Badge className="px-3 py-1 mb-4 sm:mb-6 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                Key Features
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Everything you need to perfect AI prompts</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Turn prompt creation from art to science with tools built for AI engineers
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
              <div className="bg-card/50 border rounded-xl p-4 sm:p-5 md:p-6 backdrop-blur-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 mb-3 sm:mb-4">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-1.5 sm:mb-2">Custom Mutations</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Create your own customized mutation strategies with tailored system prompts for precise transformations.
                </p>
              </div>

              <div className="bg-card/50 border rounded-xl p-4 sm:p-5 md:p-6 backdrop-blur-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 mb-3 sm:mb-4">
                  <CloudCog className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-1.5 sm:mb-2">Model Flexibility</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Connect and configure your preferred AI models from various providers with a secure, private interface.
                </p>
              </div>

              <div className="bg-card/50 border rounded-xl p-4 sm:p-5 md:p-6 backdrop-blur-sm hover:shadow-md transition-all sm:col-span-2 md:col-span-1 sm:max-w-md sm:mx-auto md:max-w-none md:mx-0">
                <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 mb-3 sm:mb-4">
                  <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-1.5 sm:mb-2">Smart Validation</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Evaluate and compare prompt mutations with sophisticated metrics and AI-powered analysis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Badge className="px-3 py-1 mb-6 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                The Process
              </Badge>
              <h2 className="text-3xl font-bold mb-4">A systematic approach to prompt engineering</h2>
              <p className="text-muted-foreground">
                Replace manual tweaking and intuition with a data-driven workflow
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-12 order-2 md:order-1">
                <div className="flex items-start gap-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                    <span className="font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Configure models</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Securely connect your preferred AI models with encrypted API keys and custom endpoints.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                    <span className="font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Design mutations</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Create mutation types with precise system prompts to transform your base prompts in various ways.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                    <span className="font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Run experiments</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Generate multiple prompt variations and test them systematically with your validator models.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                    <span className="font-semibold text-primary">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Analyze results</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Review validation metrics, compare mutations, and identify optimal prompt formulations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                    <span className="font-semibold text-primary">5</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Curate your library</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Save the best mutated prompts in your own library and test them again your preferred models.
                    </p>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className="relative bg-gradient-to-br from-card/90 to-card border rounded-xl p-8 shadow-xl backdrop-blur-sm">
                  <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[400px] bg-primary/20 rounded-full blur-[80px] opacity-20" />
                  
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="h-6 w-6 flex items-center justify-center bg-primary/20 rounded-full flex-shrink-0">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Base Prompt</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          &quot;Explain quantum computing to a high school student&quot;
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative pl-3 space-y-2">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
                      
                      <div className="pl-6 relative">
                        <div className="absolute left-0 top-3 w-3 h-px bg-primary/30" />
                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium">Formalize</p>
                            <Badge className="text-[10px] bg-green-500/10 text-green-500 hover:bg-green-500/20">9/10</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          Provide a clear, accessible explanation of the fundamental principles of quantum mechanics tailored to a high school education level. Include: 1. Basic concepts (wave-particle duality, uncertainty principle, quantization)...
                          </p>
                        </div>
                      </div>
                      
                      <div className="pl-6 relative">
                        <div className="absolute left-0 top-3 w-3 h-px bg-primary/30" />
                        <div className="bg-card border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium">Simplify</p>
                            <Badge className="text-[10px] bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">8/10</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            Explain the basic ideas of quantum mechanics in simple terms that a high school student would understand.
                          </p>
                        </div>
                      </div>
                      
                      <div className="pl-6 relative">
                        <div className="absolute left-0 top-3 w-3 h-px bg-primary/30" />
                        <div className="bg-card border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium">Paraphrase</p>
                            <Badge className="text-[10px] bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">7/10</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            Describe the principles of quantum physics in terms that would be accessible and understandable to a teenager in secondary education.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Start Section */}
        <section id="start" className="py-20 bg-gradient-to-b from-background to-muted/10 border-t">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Badge className="px-3 py-1 mb-6 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                Get Started
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Stop guessing if your prompts work</h2>
              <p className="text-muted-foreground">
                Join hundreds of AI engineers who use mutatio.dev to build more reliable AI applications
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-card/50 border rounded-xl p-8 backdrop-blur-sm">
                <h3 className="text-xl font-medium mb-6">Simple setup process</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">1</span>
                    </div>
                    <p className="text-sm">Create an account with your email or sign in with your credentials</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <p className="text-sm">Configure your AI models in settings with your own API keys</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <p className="text-sm">Define custom mutation strategies or use our curated defaults</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">4</span>
                    </div>
                    <p className="text-sm">Set up your first experiment and start optimizing prompts</p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link href="/register">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Create your free account now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 border rounded-xl p-8 backdrop-blur-sm">
                <h3 className="text-xl font-medium mb-6">Key benefits</h3>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-1.5 rounded-md text-primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Enhanced AI Outputs</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Create more effective prompts for better, more consistent AI responses
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-1.5 rounded-md text-primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Systematic Approach</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Replace ad-hoc prompt testing with methodical experimentation
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-1.5 rounded-md text-primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Model Flexibility</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use any AI model from major providers or custom endpoints
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="p-4 rounded-lg bg-card border">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Security & Privacy</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your API keys never leave your browser. Open source and auditable for complete transparency.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 border-t">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">Ready to optimize your prompts?</h2>
            <p className="text-muted-foreground mb-8">
              Join AI engineers who are using Mutatio to create more effective prompts for their applications.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  Get started for free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="md:w-1/3 mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <Flask className="h-5 w-5 text-primary" />
                <span className="font-medium">mutatio.dev</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                A lab for prompt engineering and optimization.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:w-2/3">
              <div>
                <h3 className="font-medium mb-4 text-sm">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/albertoperdomo2/mutatio.dev" className="text-muted-foreground hover:text-primary transition-colors">
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/albertoperdomo2/mutatio.dev/issues" className="text-muted-foreground hover:text-primary transition-colors">
                      Contribute
                    </a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-4 text-sm">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-4 text-sm">Contact</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="https://x.com/@p3rd0mo" className="text-muted-foreground hover:text-primary transition-colors">
                    @p3rd0mo
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Mutatio. Open source under MIT License.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}