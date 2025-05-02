// Contact.jsx
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <div className="pt-16 bg-black">
      <section className="py-24 bg-gradient-to-br from-dark-blue to-black text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h1 className="text-4xl font-bold text-cyan-400 mb-4">Contact Nexora</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our team is ready to assist you 24/7
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8 p-6 border-r border-cyan-500/20">
                <div className="flex items-center space-x-6 p-4 bg-dark-blue/50 rounded-xl hover:bg-dark-blue transition-colors">
                  <div className="p-3 bg-cyan-600 rounded-lg">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Email Support</h3>
                    <p className="text-gray-400">support@nexora.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 p-4 bg-dark-blue/50 rounded-xl hover:bg-dark-blue transition-colors">
                  <div className="p-3 bg-cyan-600 rounded-lg">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Phone Support</h3>
                    <p className="text-gray-400">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 p-4 bg-dark-blue/50 rounded-xl hover:bg-dark-blue transition-colors">
                  <div className="p-3 bg-cyan-600 rounded-lg">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">HQ Location</h3>
                    <p className="text-gray-400">123 Auction Ave, NY 10001</p>
                  </div>
                </div>
              </div>

              <form className="space-y-6 p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-cyan-500/30 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-cyan-500/30 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    rows="5"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-cyan-500/30 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="Your message..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-600 to-light-blue text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;