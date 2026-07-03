import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Contributor',
      season: 'Season 4',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      quote: "SSoC was a life-changing experience! I went from zero open source contributions to getting my first internship. The mentors were incredibly supportive and the community is amazing.",
      rating: 5,
      achievement: 'Top 10 Contributor',
    },
    {
      id: 2,
      name: 'Rahul Verma',
      role: 'Mentor',
      season: 'Season 3 & 4',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      quote: "Being a mentor at SSoC has been incredibly rewarding. Watching contributors grow from beginners to confident developers is the best part. The program is well-organized and impactful.",
      rating: 5,
      achievement: 'Best Mentor Award',
    },
    {
      id: 3,
      name: 'Ananya Patel',
      role: 'Project Admin',
      season: 'Season 4',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      quote: "We brought our project to SSoC and received amazing contributions! The quality of participants is top-notch. Our project grew 10x in just 3 months. Highly recommended!",
      rating: 5,
      achievement: 'Featured Project',
    },
    {
      id: 4,
      name: 'Arjun Singh',
      role: 'Contributor',
      season: 'Season 2 & 3',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      quote: "Started as a contributor in Season 2, became a mentor in Season 4. SSoC taught me not just coding, but collaboration, communication, and community building. Forever grateful!",
      rating: 5,
      achievement: 'Contributor to Mentor',
    },
    {
      id: 5,
      name: 'Sneha Reddy',
      role: 'Contributor',
      season: 'Season 4',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      quote: "As a complete beginner, I was scared to start. But SSoC's welcoming community and patient mentors helped me make my first contribution. Now I contribute to open source regularly!",
      rating: 5,
      achievement: 'Best First Timer',
    },
  ];

  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length - itemsPerPage + 1);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  return (
    <section id="testimonials" className="py-24 bg-secondary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Community Love
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What Our Community Says
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from contributors, mentors, and project admins who've been part of the SSoC journey.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial, index) => (
              <Card
                key={testimonial.id}
                className="bg-card border-none shadow-elegant card-hover overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 lg:p-8 flex flex-col h-full">
                  {/* Quote Icon */}
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Quote className="w-5 h-5 text-primary" />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>

                  {/* Quote Text */}
                  <p className="text-foreground leading-relaxed mb-6 flex-grow">
                    "{testimonial.quote}"
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border mt-auto">
                    <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.season}
                      </p>
                    </div>
                  </div>

                  {/* Achievement Badge */}
                  <Badge className="mt-4 w-fit bg-primary/10 text-primary border-none">
                    {testimonial.achievement}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-6 bg-primary'
                    : 'bg-primary/30 hover:bg-primary/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
