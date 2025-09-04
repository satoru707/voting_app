import React from "react";
import {
  Vote,
  Shield,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const features = [
    {
      icon: Shield,
      title: "Secure & Transparent",
      description:
        "Hash-chain integrity ensures every vote is authentic and verifiable",
    },
    {
      icon: Users,
      title: "Multi-Level Access",
      description:
        "Role-based permissions for students, faculty, and department admins",
    },
    {
      icon: BarChart3,
      title: "Real-time Results",
      description:
        "Live vote counting with comprehensive analytics and verification",
    },
    {
      icon: Vote,
      title: "Mobile First",
      description: "Optimized voting experience across all devices",
    },
  ];

  const benefits = [
    "Magic link authentication - no passwords needed",
    "One vote per student per election guaranteed",
    "Cryptographic integrity verification",
    "Real-time election monitoring",
    "Mobile-optimized voting interface",
    "Comprehensive audit logging",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-8">
              <Vote className="w-10 h-10 text-blue-600" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Secure University
              <span className="text-blue-600 block">E-Voting System</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience the future of university elections with cryptographic
              integrity, transparent results, and seamless mobile voting.
            </p>

            <button
              onClick={onLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all transform hover:scale-105 flex items-center space-x-3 mx-auto"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose UniVote?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built specifically for universities with enterprise-grade security
              and user experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Trusted by Universities Worldwide
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform ensures democratic participation while maintaining
                the highest standards of security and transparency.
              </p>

              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Vote className="w-6 h-6" />
            <span className="text-xl font-bold">UniVote</span>
          </div>
          <p className="text-gray-400">
            Secure, transparent, and accessible university elections
          </p>
        </div>
      </footer>
    </div>
  );
};
