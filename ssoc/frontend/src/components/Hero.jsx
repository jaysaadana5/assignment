import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Users, GitBranch, Award } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/10 animate-float blur-xl" />
      <div className="absolute top-40 right-20 w-32 h-32 rounded-full bg-accent/10 animate-float-delayed blur-xl" />
      <div className="absolute bottom-40 left-1/4 w-24 h-24 rounded-full bg-primary/15 animate-float blur-xl" />
      <div className="absolute bottom-20 right-1/3 w-16 h-16 rounded-full bg-accent/15 animate-float-delayed blur-xl" />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <Badge 
              variant="secondary" 
              className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-none animate-bounce-slow"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Season 5 • Applications Open
            </Badge>
            
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Social{' '}
              <span className="text-gradient-primary">Summer</span>
              <br />
              of Code
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Join India's largest open-source program! Learn, contribute, and grow with mentors and organizations from around the world. 
              <span className="text-primary font-medium"> 3 months of coding, learning, and fun!</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Button variant="hero" size="xl" className="group">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-heading font-bold text-xl text-foreground">50K+</p>
                  <p className="text-xs text-muted-foreground">Contributors</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-heading font-bold text-xl text-foreground">500+</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-heading font-bold text-xl text-foreground">₹10L+</p>
                  <p className="text-xs text-muted-foreground">In Prizes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1690192203795-ca12d9bb3227?w=800&h=600&fit=crop"
                  alt="Developers collaborating"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-card p-4 rounded-2xl shadow-elegant animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                    <span className="text-success-foreground text-sm">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">PR Merged!</p>
                    <p className="text-xs text-muted-foreground">+50 points</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-card p-4 rounded-2xl shadow-elegant animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-sm">🎉</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">New Badge</p>
                    <p className="text-xs text-muted-foreground">First Contribution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--secondary))"
          />
        </svg>
      </div>
    </section>
  );
};
