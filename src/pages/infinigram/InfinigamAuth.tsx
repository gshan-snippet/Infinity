import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';

const InfinigamAuth = ({ onLoginClick, onSignupClick }: { onLoginClick: () => void; onSignupClick: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 mb-4">
                <span className="text-2xl font-bold text-white">∞</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Infinigram</h1>
              <p className="text-slate-600 dark:text-slate-400">Your hub for goals and opportunities — learn, connect, achieve</p>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white text-center mb-6">
                Do you have an account?
              </h2>

              <div className="space-y-3">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={onLoginClick}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Yes, I have an account
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={onSignupClick}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-5 w-5" />
                  No, I want to sign up
                </Button>
              </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              Infinigram is a safe space for learning and growth
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InfinigamAuth;