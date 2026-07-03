import React from 'react';
import { Card } from '@/components/ui/card';
import { CalendarDays, Rocket, Code, Trophy, PartyPopper } from 'lucide-react';

export const Timeline = () => {
  const timelineEvents = [
    {
      icon: CalendarDays,
      date: 'May 1 - May 15',
      title: 'Registration Opens',
      description: 'Register as a Contributor, Mentor, or Project Admin. Complete your profile and explore available projects.',
      status: 'upcoming',
    },
    {
      icon: Rocket,
      date: 'May 16 - May 25',
      title: 'Community Bonding',
      description: 'Get to know your mentors, explore projects, set up development environment, and prepare for coding.',
      status: 'upcoming',
    },
    {
      icon: Code,
      date: 'May 26 - July 31',
      title: 'Coding Phase',
      description: 'The main event! Start contributing to projects, submit PRs, earn points, and climb the leaderboard.',
      status: 'upcoming',
    },
    {
      icon: Trophy,
      date: 'August 1 - August 10',
      title: 'Final Evaluations',
      description: 'Final review of contributions. Mentors evaluate PRs and determine top contributors.',
      status: 'upcoming',
    },
    {
      icon: PartyPopper,
      date: 'August 15',
      title: 'Results & Awards',
      description: 'Winners announced! Certificates distributed, prizes awarded, and celebrations begin!',
      status: 'upcoming',
    },
  ];

  return (
    <section id="timeline" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Program Schedule
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Timeline for Season 5
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mark your calendars! Here's what to expect during the SSoC Season 5 journey.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-success transform md:-translate-x-1/2" />

          <div className="space-y-12">
            {timelineEvents.map((event, index) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Point */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background transform -translate-x-1/2 z-10 shadow-glow" />

                {/* Content Card */}
                <div className={`ml-20 md:ml-0 md:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                  <Card className="p-6 card-hover bg-card border-none shadow-elegant group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <event.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-2">
                          {event.date}
                        </span>
                        <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                          {event.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block md:w-[calc(50%-2rem)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
