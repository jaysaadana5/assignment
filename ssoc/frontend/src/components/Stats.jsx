import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Users, GitPullRequest, Code, Award, Building, Globe } from 'lucide-react';

export const Stats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({
    contributors: 0,
    pullRequests: 0,
    projects: 0,
    countries: 0,
    organizations: 0,
    prizes: 0,
  });
  
  const sectionRef = useRef(null);

  const targetCounts = {
    contributors: 50000,
    pullRequests: 75000,
    projects: 500,
    countries: 50,
    organizations: 200,
    prizes: 1000000,
  };

  const stats = [
    {
      key: 'contributors',
      icon: Users,
      value: counts.contributors,
      label: 'Contributors',
      suffix: '+',
      color: 'primary',
    },
    {
      key: 'pullRequests',
      icon: GitPullRequest,
      value: counts.pullRequests,
      label: 'Pull Requests',
      suffix: '+',
      color: 'accent',
    },
    {
      key: 'projects',
      icon: Code,
      value: counts.projects,
      label: 'Projects',
      suffix: '+',
      color: 'success',
    },
    {
      key: 'countries',
      icon: Globe,
      value: counts.countries,
      label: 'Countries',
      suffix: '+',
      color: 'warning',
    },
    {
      key: 'organizations',
      icon: Building,
      value: counts.organizations,
      label: 'Organizations',
      suffix: '+',
      color: 'primary',
    },
    {
      key: 'prizes',
      icon: Award,
      value: counts.prizes,
      label: 'In Prizes',
      prefix: '₹',
      suffix: '+',
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCounts({
        contributors: Math.floor(targetCounts.contributors * easeOut),
        pullRequests: Math.floor(targetCounts.pullRequests * easeOut),
        projects: Math.floor(targetCounts.projects * easeOut),
        countries: Math.floor(targetCounts.countries * easeOut),
        organizations: Math.floor(targetCounts.organizations * easeOut),
        prizes: Math.floor(targetCounts.prizes * easeOut),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts(targetCounts);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <section id="stats" className="py-24 bg-background" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
            Our Impact
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Past Seasons in Numbers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Over 4 incredible seasons, SSoC has grown into one of the largest open source programs in India.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <Card
              key={stat.key}
              className={`p-6 lg:p-8 text-center card-hover bg-card border-none shadow-elegant overflow-hidden group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-14 h-14 mx-auto rounded-2xl ${getColorClasses(stat.color)} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <p className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                {stat.prefix || ''}
                {formatNumber(stat.value)}
                {stat.suffix || ''}
              </p>
              <p className="text-muted-foreground font-medium">
                {stat.label}
              </p>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Card className="inline-block p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-none shadow-elegant">
            <p className="font-heading text-xl sm:text-2xl font-semibold text-foreground mb-2">
              Ready to be part of Season 5?
            </p>
            <p className="text-muted-foreground">
              Join <span className="text-primary font-medium">50,000+</span> developers who are already making an impact.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
