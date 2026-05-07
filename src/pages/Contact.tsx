import React, { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-24 min-h-screen">
      <h1 className="text-3xl md:text-5xl font-black text-white mb-2">Contact Us</h1>
      <p className="text-white/60 mb-8 max-w-xl">Have a question, feedback, or DMCA takedown request? Fill out the form below and we'll get back to you as soon as possible.</p>

      {submitted ? (
        <div className="bg-accent/20 border border-accent rounded-xl p-8 text-center text-white">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
          <p className="text-white/70">Thank you for contacting us. We have received your message and will review it shortly.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-white/80">Name *</label>
              <input 
                type="text" 
                id="name" 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-accent transition-colors"
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white/80">Email *</label>
              <input 
                type="email" 
                id="email" 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-accent transition-colors"
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-white/80">Subject *</label>
            <input 
              type="text" 
              id="subject" 
              required 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-accent transition-colors"
              placeholder="How can we help?"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-white/80">Message *</label>
            <textarea 
              id="message" 
              required 
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-accent transition-colors resize-y"
              placeholder="Your message here..."
            />
          </div>

          <button 
            type="submit" 
            className="px-8 py-3 bg-accent text-white font-bold rounded-lg hover:bg-accent/90 transition-colors w-full md:w-auto"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
