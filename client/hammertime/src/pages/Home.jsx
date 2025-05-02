// Home.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import AuctionCard from '../components/AuctionCard';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';

const Home = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveAuctions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auctions');
        const now = moment().tz('Asia/Kolkata');
        const liveOnly = res.data
          .filter(auction => {
            const startTime = moment.utc(auction.startTime).tz('Asia/Kolkata');
            const endTime = moment.utc(auction.endTime).tz('Asia/Kolkata');
            return startTime.isBefore(now) && endTime.isAfter(now);
          })
          .slice(0, 8);
        setFeaturedAuctions(liveOnly);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveAuctions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 bg-black font-sans">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-dark-blue to-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://media.istockphoto.com/id/1201817558/photo/the-concept-of-auction-in-the-internet.jpg?s=612x612&w=0&k=20&c=kUk37DgFypY0ve9xpfy27VzbJvZLBADdSLWBWsz7x4c="
            alt="Auction Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 px-4 text-center max-w-4xl animate-fadeIn">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Discover & Bid on Exclusive Items
          </h1>
          <p className="text-xl md:text-3xl mb-10 text-gray-300 font-light">
            Join our premium auction platform for rare collectibles, luxury items,
            and unique treasures from around the world.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/auctions"
              className="bg-gradient-to-r from-cyan-600 to-light-blue text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Browse Auctions
            </Link>
            <Link
              to="/login"
              className="bg-black text-white px-10 py-4 rounded-full font-bold text-lg border-2 border-cyan-500 hover:bg-cyan-900 transition-all duration-300"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fadeIn">
            <h2 className="text-4xl font-bold text-white mb-4">
              Live Auctions
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Bid now on these exclusive ongoing auctions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 px-4">
            {featuredAuctions.map((auction) => (
              <div
                key={auction._id}
                className="transform hover:scale-102 transition-all duration-300"
              >
                <AuctionCard auction={auction} compact={true} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12 animate-fadeIn">
            <Link
              to="/auctions"
              className="inline-block bg-gradient-to-r from-cyan-600 to-light-blue text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View All Live Auctions
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-gray-900 text-white" id="about">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h1 className="text-4xl font-bold text-cyan-400 mb-4">About Nexora</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover the story behind our premium auction platform
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                alt="About Us"
                className="rounded-2xl shadow-2xl w-full transform hover:scale-105 transition-all duration-500"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-4xl font-bold mb-6">Our Evolution</h2>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                Nexora emerged in 2023 as a revolutionary force in digital auctions, combining 
                cutting-edge technology with traditional auction expertise. We've redefined how 
                collectors and enthusiasts interact in the digital marketplace.
              </p>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                Facilitating over $500M in transactions, we specialize in rare artifacts, 
                luxury collectibles, and exclusive digital assets, connecting a global network 
                of passionate buyers and sellers.
              </p>
              <div className="mt-8">
                <Link
                  to="/contact"
                  className="inline-block bg-gradient-to-r from-cyan-600 to-light-blue text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Connect With Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Nexora Section */}
      <section className="py-24 bg-dark-blue text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl font-bold mb-4">Why Nexora?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The pillars of our exceptional auction experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="w-20 h-20 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Bank-Grade Security</h3>
              <p className="text-gray-400">
                AES-256 encryption and biometric authentication protect every transaction
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="w-20 h-20 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Cost Efficiency</h3>
              <p className="text-gray-400">
                5% flat commission with no hidden fees - industry's most competitive rates
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="w-20 h-20 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Global Network</h3>
              <p className="text-gray-400">
                50+ countries represented in our community of collectors and curators
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gradient-to-br from-dark-blue to-black text-white" id="contact">
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

      {/* Footer */}
      <footer className="bg-gradient-to-t from-dark-blue to-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-4 flex items-center justify-center md:justify-start">
                <span className="text-cyan-400">Nex</span>
                <span className="text-white">ora</span>
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Premium auction platform connecting collectors worldwide
              </p>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4 text-gray-300">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-cyan-400 transition-colors">Home</Link></li>
                <li><Link to="/auctions" className="text-gray-400 hover:text-cyan-400 transition-colors">Auctions</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-cyan-400 transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-cyan-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4 text-gray-300">Legal</h4>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-cyan-400 transition-colors">Terms</Link></li>
                <li><Link to="/refunds" className="text-gray-400 hover:text-cyan-400 transition-colors">Refunds</Link></li>
              </ul>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4 text-gray-300">Follow Us</h4>
              <div className="flex space-x-4 justify-center md:justify-start">
                <Link to="#" className="text-gray-400 hover:text-cyan-400 transition-colors transform hover:scale-110">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </Link>
                <Link to="#" className="text-gray-400 hover:text-cyan-400 transition-colors transform hover:scale-110">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Link>
                <Link to="#" className="text-gray-400 hover:text-cyan-400 transition-colors transform hover:scale-110">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>© {new Date().getFullYear()} Nexora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;