import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Trophy, Rocket, Heart, Globe } from 'lucide-react';

export const About = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Learn by Doing',
      description: 'Gain hands-on experience by contributing to real-world open source projects with guidance from expert mentors.',
      color: 'primary',
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Join a vibrant community of developers, designers, and tech enthusiasts from across the globe.',
      color: 'accent',
    },
    {
      icon: Trophy,
      title: 'Win Prizes',
      description: 'Top contributors win exciting prizes including cash rewards, swag, certificates, and exclusive opportunities.',
      color: 'success',
    },
    {
      icon: Rocket,
      title: 'Career Boost',
      description: 'Build your portfolio, network with industry experts, and unlock career opportunities.',
      color: 'warning',
    },
    {
      icon: Heart,
      title: 'Give Back',
      description: 'Contribute to projects that make a difference and help the open source ecosystem grow.',
      color: 'primary',
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'Your contributions reach millions of users worldwide through popular open source projects.',
      color: 'accent',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary/10 text-primary',
      accent: 'bg-accent/10 text-accent',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
    };
    return colors[color] || colors.primary;
  };

  return (
    <section id="about" className="py-24 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            About the Program
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What is Social Summer of Code?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Social Summer of Code (SSoC) is a <span className="text-primary font-medium">3-month long open source program</span> that helps students and developers learn, contribute, and grow. 
            Whether you're a beginner or an experienced developer, SSoC has something for everyone!
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group card-hover bg-card border-none shadow-elegant overflow-hidden"
            >
              <CardContent className="p-6 lg:p-8">
                <div className={`w-14 h-14 rounded-2xl ${getColorClasses(feature.color)} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Highlight */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap justify-center gap-4 sm:gap-8 p-6 rounded-2xl bg-card shadow-elegant">
            <div className="text-center px-4">
              <p className="font-heading text-2xl sm:text-3xl font-bold text-primary">3</p>
              <p className="text-sm text-muted-foreground">Months</p>
            </div>
            <div className="w-px bg-border hidden sm:block" />
            <div className="text-center px-4">
              <p className="font-heading text-2xl sm:text-3xl font-bold text-accent">100%</p>
              <p className="text-sm text-muted-foreground">Free</p>
            </div>
            <div className="w-px bg-border hidden sm:block" />
            <div className="text-center px-4">
              <p className="font-heading text-2xl sm:text-3xl font-bold text-success">All Levels</p>
              <p className="text-sm text-muted-foreground">Welcome</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
