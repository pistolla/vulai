"use client";

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { sendContactMessage, resetContact } from '@/store/slices/contactSlice';
import { FaPaperPlane } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function ContactForm() {
  const dispatch = useAppDispatch();
  const { loading, success, error } = useAppSelector(s => s.contact);

  const [form, setForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });

  useEffect(() => { AOS.init({ once: true }); }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(sendContactMessage(form));
  };

  useEffect(() => {
    if (success) {
      setForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => dispatch(resetContact()), 3000);
    }
  }, [success, dispatch]);

  return (
    <div className="bg-white dark:bg-gray-800 contact-card rounded-lg shadow-xl overflow-hidden" data-aos="fade-left" data-aos-delay="100">
      <div className="py-6 px-6 sm:p-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Send us a message</h3>
        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                required
                value={form.name}
                onChange={onChange}
                className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={onChange}
                className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
            <div className="mt-1">
              <select
                id="subject"
                name="subject"
                value={form.subject}
                onChange={onChange}
                className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              >
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Partnership Opportunity</option>
                <option>University Program</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
            <div className="mt-1">
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                value={form.message}
                onChange={onChange}
                className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                placeholder="Tell us how we can help..."
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">Message sent! We'll reply soon.</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
          >
            {loading ? 'Sending…' : <><FaPaperPlane /> Send Message</>}
          </button>
        </form>
      </div>
    </div>
  );
}