"use client";

import { useEffect } from 'react';
import ContactForm from '@/components/ContactForm';
import { useClientSideLibs } from '@/utils/clientLibs';
import Layout from '../components/Layout';

export default function ContactPage() {
  const mounted = useClientSideLibs();

  return (
    <Layout title="Sports Programs" description="Explore comprehensive university sports programs including Football, Basketball, Volleyball, Rugby, Hockey, Badminton, Table Tennis, Chess, Athletics and more">
      
      {/* ------- HERO  (identical HTML → JSX) ------- */}
      <div className="contact-hero bg-gradient-to-r from-unill-purple-500 to-unill-yellow-500 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl" data-aos="fade-down">
              Contact Us
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl" data-aos="fade-up" data-aos-delay="100">
              We'd love to hear from you! Reach out with questions, feedback, or partnership opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* ------- FORM + INFO ------- */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Left: info cards */}
            <div className="max-w-lg mx-auto lg:max-w-none" data-aos="fade-right">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">Get in touch</h2>
              <p className="mt-3 text-lg text-gray-500 dark:text-gray-300">Have questions about our platform or want to feature your university's sports program? Fill out the form and we'll get back to you soon.</p>
              <div className="mt-12 space-y-8">
                <IconCard icon="mail" title="Email" content="contact@unisports.live" />
                <IconCard icon="phone" title="Phone" content="+1 (555) 123-4567" />
                <IconCard icon="map-pin" title="Office" content="123 Sports Ave, San Francisco, CA 94107" />
              </div>
            </div>

            {/* Right: reusable form */}
            <div className="mt-12 lg:mt-0" data-aos="fade-left" data-aos-delay="100">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>

      {/* ------- FAQ  (identical HTML → JSX) ------- */}
      <div className="bg-gray-100 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase" data-aos="fade-up">Help Center</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl" data-aos="fade-up" data-aos-delay="100">
              Frequently asked questions
            </p>
          </div>
          <div className="mt-12 space-y-8 divide-y divide-gray-200 dark:divide-gray-700">
            <FAQItem question="How do I add my university's sports program to your platform?" answer="We'd love to feature your university! Please contact our partnerships team through the form above or email partnerships@unisports.live with details about your program." delay={100} />
            <FAQItem question="Can I get notifications for specific teams or games?" answer="Absolutely! Once you create an account and log in, you can follow your favorite teams and set up custom notifications for games, scores, and news." delay={200} />
            <FAQItem question="How accurate are your live updates?" answer="We pride ourselves on accuracy. Our system combines automated data feeds with manual verification from our team of sports correspondents at each location." delay={300} />
            <FAQItem question="Do you cover all university sports?" answer="We currently cover 15 major sports across 200+ universities. We're constantly expanding our coverage based on user demand and available resources." delay={400} />
          </div>
        </div>
      </div>

      

      {/* ------- CUSTOM CSS  (identical HTML → JSX) ------- */}
      <style jsx global>{`
        
        .contact-card {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </Layout>
  );
}

/* ---------------------------------
   Reusable UI pieces
----------------------------------- */
function IconCard({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="flex" data-aos="fade-up">
      <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
        <i data-feather={icon} className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-base text-gray-500 dark:text-gray-300">{content}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer, delay }: { question: string; answer: string; delay: number }) {
  return (
    <div className="pt-6" data-aos="fade-up" data-aos-delay={delay}>
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{question}</h3>
        <div className="mt-2">
          <p className="text-base text-gray-500 dark:text-gray-300">{answer}</p>
        </div>
      </div>
    </div>
  );
}

