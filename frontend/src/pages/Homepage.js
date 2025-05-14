import React from "react";
import { FaChevronRight } from "react-icons/fa";
import logo from "../assets/BrightFold_Logo_Transparent.png";

const featureCards = [
  {
    title: "Human-Centered Design",
    img: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=600&q=80",
    alt: "Facilitator leading a small team discussion with sticky notes",
    text: "Our tools are designed with empathy to support the people navigating change, not just the process.",
  },
  {
    title: "Smart Insights",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
    alt: "Leader reviewing a digital dashboard with a team",
    text: "Gain clarity and confidence with actionable analytics that turn insight into impact.",
  },
  {
    title: "Scalable & Secure",
    img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
    alt: "IT or leadership in a modern workspace with visible tech",
    text: "BrightFold supports your change initiatives at every stage—securely and seamlessly.",
  },
  {
    title: "Inclusive Innovation",
    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
    alt: "Multicultural team collaborating in hybrid setting",
    text: "Our platform is built for diverse teams across cultures and change contexts.",
  },
];

export default function Homepage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-1">
          {/* Logo */}
          <img src={logo} alt="BrightFold Logo" className="h-20 w-auto" />
          {/* Nav Links */}
          <div className="hidden md:flex gap-7 text-base font-medium text-gray-800">
            <a href="#product" className="hover:text-blue-700 transition">Product</a>
            <a href="#pricing" className="hover:text-blue-700 transition">Pricing</a>
            <a href="#resources" className="hover:text-blue-700 transition">Resources</a>
            <a href="#partners" className="hover:text-blue-700 transition">Partners</a>
            <a href="#support" className="hover:text-blue-700 transition">Support</a>
            <a href="#contact" className="hover:text-blue-700 transition">Contact Us</a>
          </div>
          {/* CTAs */}
          <div className="flex gap-2">
            <a href="/register" className="px-4 py-2 rounded-md bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition">Try for Free</a>
            <a href="#signin" className="px-4 py-2 rounded-md border border-blue-700 text-blue-700 font-semibold hover:bg-blue-50 transition">Sign In</a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-blue-100 via-orange-50 to-white pt-4 md:pt-8 pb-12 md:pb-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-12 gap-10 md:gap-20">
          {/* Left: Text */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 mb-6 leading-tight drop-shadow-sm">
              Change Management, Made Human
            </h1>
            <p className="max-w-xl text-lg md:text-2xl text-gray-700 mb-8">
              Empower your organization to adapt and thrive with intuitive tools, insightful analytics, and a people-first approach to change.
            </p>
            <a
              href="#get-started"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-orange-600 font-semibold text-lg transition duration-200 ease-in-out"
            >
              Get Started <FaChevronRight />
            </a>
          </div>
          {/* Right: Hero Image */}
          <div className="flex-1 flex justify-center items-center relative min-h-[320px]">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=80"
              alt="Diverse team collaborating and celebrating success"
              className="w-full max-w-lg h-[320px] md:h-[400px] object-cover rounded-3xl shadow-2xl border-4 border-white bg-beige-100"
              style={{ boxShadow: '0 8px 32px 0 rgba(31, 41, 55, 0.15)' }}
            />
            {/* Optional: Soft shape overlay */}
            <div className="absolute -z-10 top-8 right-0 w-64 h-64 bg-orange-100 rounded-full opacity-60 blur-2xl hidden md:block" />
          </div>
        </div>
      </section>

      {/* Why Choose BrightFold Section */}
      <section className="w-full bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <div className="uppercase text-sm tracking-widest text-orange-600 font-semibold mb-2">Why Choose BrightFold</div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">A Human-Centered Platform for Change</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              BrightFold empowers people and organizations to thrive through change with empathy, insight, and innovation.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureCards.map((card, idx) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl shadow-lg p-0 flex flex-col items-start transition-transform duration-300 ease-in-out hover:scale-[1.03] hover:shadow-2xl group focus-within:shadow-2xl focus-within:scale-[1.03]"
                tabIndex={0}
                aria-label={card.title}
              >
                <img
                  src={card.img}
                  alt={card.alt}
                  className="w-full h-56 md:h-72 object-cover rounded-t-2xl"
                  loading="lazy"
                />
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">{card.title}</h3>
                  <p className="text-gray-700 text-lg">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-gray-500 bg-white mt-auto text-sm border-t">
        &copy; {new Date().getFullYear()} BrightFold. All rights reserved.
      </footer>
    </div>
  );
} 