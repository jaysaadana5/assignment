import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Code, Users, Briefcase, ArrowRight, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const Registration = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    github: '',
    linkedin: '',
    experience: '',
  });

  const roles = [
    {
      id: 'contributor',
      icon: Code,
      title: 'Contributor',
      subtitle: 'For Students & Developers',
      description: 'Start your open source journey! Contribute to exciting projects, learn from mentors, and win prizes.',
      benefits: [
        'Work on real-world projects',
        'Learn from experienced mentors',
        'Earn certificates & prizes',
        'Build your portfolio',
      ],
      color: 'primary',
      popular: true,
    },
    {
      id: 'mentor',
      icon: Users,
      title: 'Mentor',
      subtitle: 'For Experienced Developers',
      description: 'Guide the next generation of developers! Share your expertise and help contributors grow.',
      benefits: [
        'Shape future developers',
        'Exclusive mentor swag',
        'LinkedIn recognition',
        'Community leadership',
      ],
      color: 'accent',
      popular: false,
    },
    {
      id: 'project-admin',
      icon: Briefcase,
      title: 'Project Admin',
      subtitle: 'For Organization Leads',
      description: 'Bring your project to SSoC! Get talented contributors and grow your open source project.',
      benefits: [
        'Quality contributions',
        'Project visibility boost',
        'Community growth',
        'Featured showcase',
      ],
      color: 'success',
      popular: false,
    },
  ];

  const getColorClasses = (color, type = 'bg') => {
    const colors = {
      primary: {
        bg: 'bg-primary/10',
        text: 'text-primary',
        border: 'border-primary',
        hover: 'hover:border-primary',
      },
      accent: {
        bg: 'bg-accent/10',
        text: 'text-accent',
        border: 'border-accent',
        hover: 'hover:border-accent',
      },
      success: {
        bg: 'bg-success/10',
        text: 'text-success',
        border: 'border-success',
        hover: 'hover:border-success',
      },
    };
    return colors[color]?.[type] || colors.primary[type];
  };

  const handleCardClick = (role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock submission - store in localStorage for demo
    const registrations = JSON.parse(localStorage.getItem('ssoc_registrations') || '[]');
    const newRegistration = {
      ...formData,
      role: selectedRole.id,
      timestamp: new Date().toISOString(),
    };
    registrations.push(newRegistration);
    localStorage.setItem('ssoc_registrations', JSON.stringify(registrations));
    
    toast.success(`Successfully registered as ${selectedRole.title}!`, {
      description: 'Check your email for confirmation.',
    });
    
    setIsDialogOpen(false);
    setFormData({ name: '', email: '', github: '', linkedin: '', experience: '' });
  };

  return (
    <section id="register" className="py-24 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Join the Community
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Choose Your Role
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you want to contribute, mentor, or bring your project – there's a place for everyone at SSoC!
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`relative cursor-pointer card-hover bg-card border-2 border-transparent ${getColorClasses(role.color, 'hover')} overflow-hidden group`}
              onClick={() => handleCardClick(role)}
            >
              {role.popular && (
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 rounded-2xl ${getColorClasses(role.color, 'bg')} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <role.icon className={`w-8 h-8 ${getColorClasses(role.color, 'text')}`} />
                </div>
                <CardTitle className="font-heading text-2xl text-foreground">
                  {role.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {role.subtitle}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-col h-full">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {role.description}
                </p>
                
                <ul className="space-y-3 mb-8 flex-grow">
                  {role.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full ${getColorClasses(role.color, 'bg')} flex items-center justify-center shrink-0`}>
                        <Check className={`w-3 h-3 ${getColorClasses(role.color, 'text')}`} />
                      </div>
                      <span className="text-sm text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={role.popular ? 'hero' : 'outline'} 
                  className="w-full mt-auto group/btn"
                >
                  Register as {role.title}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Registration Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl flex items-center gap-3">
                {selectedRole && (
                  <>
                    <div className={`w-10 h-10 rounded-xl ${getColorClasses(selectedRole?.color, 'bg')} flex items-center justify-center`}>
                      {selectedRole && <selectedRole.icon className={`w-5 h-5 ${getColorClasses(selectedRole?.color, 'text')}`} />}
                    </div>
                    Register as {selectedRole?.title}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Fill in your details to join SSoC Season 5
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Profile</Label>
                <Input
                  id="github"
                  name="github"
                  placeholder="https://github.com/username"
                  value={formData.github}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                />
              </div>
              
              {selectedRole?.id !== 'contributor' && (
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience / Project Details</Label>
                  <Input
                    id="experience"
                    name="experience"
                    placeholder={selectedRole?.id === 'mentor' ? 'Years of experience' : 'Project name & description'}
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
              
              <Button type="submit" variant="hero" size="lg" className="w-full mt-6">
                Complete Registration
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
