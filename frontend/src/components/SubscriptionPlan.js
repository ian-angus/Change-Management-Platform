import React from "react";
import { FaCheck, FaCrown } from "react-icons/fa";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Up to 5 team members",
      "Basic change management tools",
      "Email support",
      "Community forum access",
    ],
    current: true,
  },
  {
    name: "Professional",
    price: "$49",
    period: "per month",
    features: [
      "Up to 50 team members",
      "Advanced analytics",
      "Priority support",
      "Custom templates",
      "API access",
      "Team collaboration tools",
    ],
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "per month",
    features: [
      "Unlimited team members",
      "Custom integrations",
      "Dedicated support",
      "Advanced security",
      "Custom reporting",
      "SLA guarantees",
    ],
  },
];

export default function SubscriptionPlan() {
  return (
    <div className="space-y-8">
      {/* Current Plan Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Current Plan</h4>
            <p className="text-2xl font-bold text-blue-900 mt-1">Free Plan</p>
          </div>
          <button className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
            Upgrade Plan
          </button>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Your next billing date is <span className="font-medium">March 1, 2024</span>
        </div>
      </div>

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-2xl shadow-sm p-6 border-2 ${
              plan.current ? "border-blue-500" : plan.recommended ? "border-orange-500" : "border-gray-200"
            }`}
          >
            {plan.recommended && (
              <div className="flex items-center gap-2 text-orange-600 mb-4">
                <FaCrown className="w-5 h-5" />
                <span className="text-sm font-medium">Recommended</span>
              </div>
            )}
            
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-500 ml-1">/{plan.period}</span>
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <FaCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full mt-6 py-2 rounded-lg font-medium transition-colors ${
                plan.current
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : plan.recommended
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-blue-700 text-white hover:bg-blue-800"
              }`}
              disabled={plan.current}
            >
              {plan.current ? "Current Plan" : "Choose Plan"}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Can I change plans later?</h4>
            <p className="mt-1 text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">What payment methods do you accept?</h4>
            <p className="mt-1 text-gray-600">
              We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Is there a free trial?</h4>
            <p className="mt-1 text-gray-600">
              Yes, all paid plans come with a 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 