import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for exploring',
    icon: Zap,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    features: [
      'Basic career discovery',
      '3 goal roadmaps',
      'Limited exam information',
      'Community access',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹299',
    period: '/month',
    description: 'For serious aspirants',
    icon: Sparkles,
    color: 'text-primary',
    bg: 'gradient-primary',
    popular: true,
    features: [
      'Unlimited goal roadmaps',
      'Full exam database',
      'AI-powered guidance',
      'Coaching recommendations',
      'Daily task tracking',
      'Real success stories',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹799',
    period: '/month',
    description: 'Complete career toolkit',
    icon: Crown,
    color: 'text-amber-500',
    bg: 'bg-amber-500',
    features: [
      'Everything in Pro',
      '1-on-1 mentorship sessions',
      'Personalized study plans',
      'Mock interview practice',
      'Resume & profile review',
      'Job placement assistance',
      'Lifetime access to updates',
    ],
    cta: 'Go Premium',
  },
];

const Subscription = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Invest in your future. All plans include access to our core features. 
              Upgrade for personalized guidance and premium resources.
            </p>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                variant={plan.popular ? 'elevated' : 'default'}
                className={`relative h-full ${plan.popular ? 'border-primary shadow-glow' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-xs font-semibold gradient-primary text-primary-foreground">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className={`w-14 h-14 rounded-2xl ${plan.bg} flex items-center justify-center mx-auto mb-4 ${plan.popular ? 'text-primary-foreground' : ''}`}>
                    <plan.icon className={`h-7 w-7 ${plan.popular ? 'text-primary-foreground' : plan.color}`} />
                  </div>
                  <CardTitle className="font-display text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.popular ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={plan.popular ? 'hero' : plan.disabled ? 'secondary' : 'outline'}
                    className="w-full"
                    disabled={plan.disabled}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <h2 className="font-display text-2xl font-bold mb-4">Questions?</h2>
          <p className="text-muted-foreground mb-4">
            We're here to help. Contact us anytime.
          </p>
          <Button variant="outline">Contact Support</Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Subscription;
