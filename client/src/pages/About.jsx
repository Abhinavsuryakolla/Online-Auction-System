// About.jsx
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="pt-16 bg-black">
      <section className="py-24 bg-gray-900 text-white">
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
    </div>
  );
};

export default About;