import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export const FAQ = () => {
  const faqs = [
    {
      question: 'What is Social Summer of Code (SSoC)?',
      answer: 'Social Summer of Code is a 3-month long open source program that helps students and developers learn, contribute to real-world projects, and grow their skills. It connects contributors with mentors and organizations working on exciting open source projects.',
    },
    {
      question: 'Who can participate in SSoC?',
      answer: 'Anyone can participate! Whether you\'re a student, working professional, or hobbyist developer - if you have a passion for open source and want to learn, you\'re welcome to join. No prior open source experience is required for contributors.',
    },
    {
      question: 'Is SSoC free to participate?',
      answer: 'Yes, SSoC is completely free! There are no registration fees or hidden costs. We believe in making open source accessible to everyone.',
    },
    {
      question: 'What are the different roles in SSoC?',
      answer: 'There are three main roles: Contributors (students/developers who contribute to projects), Mentors (experienced developers who guide contributors), and Project Admins (organization leads who bring their projects to SSoC).',
    },
    {
      question: 'How are contributions evaluated?',
      answer: 'Contributions are evaluated based on quality, complexity, and impact. Each merged PR earns points, with more complex contributions earning more points. Mentors review and approve all contributions.',
    },
    {
      question: 'What prizes can contributors win?',
      answer: 'Top contributors can win cash prizes, exclusive swag, certificates of achievement, LinkedIn recommendations, and opportunities for internships or job referrals from participating organizations.',
    },
    {
      question: 'What technologies/languages are supported?',
      answer: 'SSoC supports all technologies! We have projects in web development (React, Angular, Vue), backend (Node.js, Python, Java), mobile (React Native, Flutter), AI/ML, blockchain, and many more.',
    },
    {
      question: 'How much time commitment is required?',
      answer: 'We recommend dedicating at least 10-15 hours per week for contributors. However, this is flexible - you can contribute at your own pace. The more you contribute, the higher you climb on the leaderboard!',
    },
    {
      question: 'Can I participate as both a contributor and mentor?',
      answer: 'While you can only register for one primary role, previous contributors often return as mentors in future seasons. We encourage this growth trajectory!',
    },
    {
      question: 'How do I get help if I\'m stuck?',
      answer: 'We have multiple support channels: dedicated Discord server, mentor office hours, community forums, and detailed documentation. Our mentors and community members are always ready to help!',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Got Questions?
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about SSoC. Can't find the answer you're looking for? Reach out to us!
          </p>
        </div>

        {/* FAQ Accordion */}
        <Card className="p-6 lg:p-8 bg-card border-none shadow-elegant">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-xl px-4 data-[state=open]:bg-secondary/50 transition-colors duration-200"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground pr-4">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-12 pr-4 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Still Have Questions */}
        <div className="mt-12 text-center">
          <Card className="inline-flex items-center gap-4 p-6 bg-primary/5 border-none">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Still have questions?</p>
              <p className="text-sm text-muted-foreground">
                Email us at{' '}
                <a href="mailto:support@ssoc.org" className="text-primary hover:underline">
                  support@ssoc.org
                </a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
