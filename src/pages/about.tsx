import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Layout from '../components/Layout';

const AboutPage: React.FC = () => {
return (
    <Layout title="Sports Programs" description="Explore comprehensive university sports programs including Football, Basketball, Volleyball, Rugby, Hockey, Badminton, Table Tennis, Chess, Athletics and more">
      
    <section className="pt-24 pb-16 bg-gradient-to-r from-unill-purple-500 to-unill-yellow-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About Unill Sports</h1>
            <p className="text-xl">Fostering excellence in university athletics since our founding</p>
        </div>
    </section>
    <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div data-aos="fade-right">
                    <h2 className="text-3xl font-bold mb-6 gradient-text">Our Mission</h2>
                    <p className="text-gray-300 mb-6">
                        Unill Sports is dedicated to fostering athletic excellence and sportsmanship through diverse university sports programs. 
                        We believe in the power of sports to unite communities, develop character, and create unforgettable experiences 
                        for students, alumni, and fans alike.
                    </p>
                    <p className="text-gray-300">
                        Our commitment extends beyond competition to include academic support, personal development, 
                        and building champions both on and off the field. We provide state-of-the-art facilities, 
                        expert coaching, and a supportive environment where student-athletes can thrive.
                    </p>
                </div>
                <div data-aos="fade-left">
                    <Image src="/team.jpg" alt="University sports" className="rounded-lg shadow-2xl" width={500} height={300} />
                </div>
            </div>
        </div>
    </section>

    <section className="py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 gradient-text">What We Offer</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="feature-card rounded-lg p-6 text-center" data-aos="fade-up">
                    <div className="bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Live Coverage</h3>
                    <p className="text-gray-300">Real-time streaming and updates from games across the university</p>
                </div>
                <div className="feature-card rounded-lg p-6 text-center" data-aos="fade-up" data-aos-delay="200">
                    <div className="bg-gradient-to-br from-unill-purple-400 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
                    <p className="text-gray-300">Find and follow games happening across our university facilities</p>
                </div>
                <div className="feature-card rounded-lg p-6 text-center" data-aos="fade-up" data-aos-delay="400">
                    <div className="bg-gradient-to-br from-green-400 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Community Platform</h3>
                    <p className="text-gray-300">Connect with fellow sports enthusiasts and university correspondents</p>
                </div>
            </div>
        </div>
    </section>

    <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 gradient-text">Our Leadership Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="team-card rounded-lg p-8 text-center" data-aos="fade-up">
                    <div className="w-32 h-32 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-4xl font-black text-white">MJ</span>
                    </div>
                    <h3 className="text-xl font-semibold gradient-text">Marcus Johnson</h3>
                    <p className="text-unill-yellow-400 mb-2">Athletic Director</p>
                    <p className="text-gray-300 text-sm">15+ years experience in university athletics and sports management</p>
                </div>
                <div className="team-card rounded-lg p-8 text-center" data-aos="fade-up" data-aos-delay="200">
                    <div className="w-32 h-32 bg-gradient-to-br from-unill-purple-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-4xl font-black text-white">SC</span>
                    </div>
                    <h3 className="text-xl font-semibold gradient-text">Sarah Chen</h3>
                    <p className="text-unill-yellow-400 mb-2">Head Coach Coordinator</p>
                    <p className="text-gray-300 text-sm">Former Olympic athlete with expertise in multiple sports disciplines</p>
                </div>
                <div className="team-card rounded-lg p-8 text-center" data-aos="fade-up" data-aos-delay="400">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-4xl font-black text-white">DR</span>
                    </div>
                    <h3 className="text-xl font-semibold gradient-text">David Rodriguez</h3>
                    <p className="text-unill-yellow-400 mb-2">Sports Operations Manager</p>
                    <p className="text-gray-300 text-sm">Specializes in facility management and event coordination</p>
                </div>
            </div>
        </div>
    </section>
    <section className="py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 gradient-text">Our Impact</h2>
                <p className="text-xl text-gray-300">Numbers that speak to our commitment to university athletics</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
                    <div className="text-5xl font-black gradient-text mb-2">12+</div>
                    <div className="text-lg font-semibold mb-2">Sports Programs</div>
                    <div className="text-sm text-gray-300">Diverse athletic opportunities</div>
                </div>
                
                <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
                    <div className="text-5xl font-black gradient-text mb-2">500+</div>
                    <div className="text-lg font-semibold mb-2">Student Athletes</div>
                    <div className="text-sm text-gray-300">Active participants</div>
                </div>
                
                <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
                    <div className="text-5xl font-black gradient-text mb-2">35</div>
                    <div className="text-lg font-semibold mb-2">Championships</div>
                    <div className="text-sm text-gray-300">University titles won</div>
                </div>
                
                <div className="text-center bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
                    <div className="text-5xl font-black gradient-text mb-2">15</div>
                    <div className="text-lg font-semibold mb-2">Facilities</div>
                    <div className="text-sm text-gray-300">State-of-the-art venues</div>
                </div>
            </div>
        </div>
    </section>

    <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 gradient-text">Our Core Values</h2>
                <p className="text-xl text-gray-300">The principles that guide everything we do</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h4 className="font-semibold mb-2">Excellence</h4>
                    <p className="text-sm text-gray-400">Striving for the highest standards in athletics and academics</p>
                </div>
                
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-unill-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                    </div>
                    <h4 className="font-semibold mb-2">Teamwork</h4>
                    <p className="text-sm text-gray-400">Building strong relationships and working together toward common goals</p>
                </div>
                
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <h4 className="font-semibold mb-2">Integrity</h4>
                    <p className="text-sm text-gray-400">Maintaining the highest ethical standards in all our activities</p>
                </div>
                
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </div>
                    <h4 className="font-semibold mb-2">Passion</h4>
                    <p className="text-sm text-gray-400">Bringing energy and enthusiasm to everything we do</p>
                </div>
            </div>
        </div>
    </section>
</Layout>
  );
};

export default AboutPage;
