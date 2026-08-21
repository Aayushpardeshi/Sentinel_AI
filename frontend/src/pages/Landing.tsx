import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Search, Activity, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Shield className="w-6 h-6 text-primary" />
          Sentinel AI
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-medium text-text-muted mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          PRIVATE AI • SECURE KNOWLEDGE
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          Give Your Company a Brain.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-text-muted">
            Keep It Private.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10"
        >
          Turn your organization's private knowledge into an intelligent AI assistant — with access control, grounded answers, and complete visibility.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center gap-4"
        >
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Get Started <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Hero Visual - Animated Tech Lock */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20 relative mx-auto max-w-3xl h-64 md:h-96 flex items-center justify-center"
        >
          {/* Animated Background Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute w-64 h-64 md:w-96 md:h-96 border border-primary/20 rounded-full border-dashed"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-48 h-48 md:w-72 md:h-72 border border-primary/30 rounded-full border-dashed"
          />
          <div className="absolute w-full h-full bg-gradient-to-b from-transparent via-transparent to-background z-10 pointer-events-none" />
          
          {/* Central Lock & Text */}
          <div className="relative z-20 flex flex-col items-center">
            <motion.div
              animate={{ 
                boxShadow: ["0px 0px 0px rgba(0,210,255,0)", "0px 0px 60px rgba(0,210,255,0.3)", "0px 0px 0px rgba(0,210,255,0)"]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 md:w-24 md:h-24 bg-surface/80 backdrop-blur-xl border border-primary/50 rounded-2xl flex items-center justify-center mb-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
              <Lock className="w-10 h-10 md:w-12 md:h-12 text-primary relative z-10" />
            </motion.div>
            
            <div className="flex text-2xl md:text-4xl font-mono font-bold tracking-[0.2em] text-white">
              {"SENTINEL AI".split('').map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.5,
                    delay: 0.8 + index * 0.1,
                  }}
                  className={char === ' ' ? 'w-4 md:w-6' : ''}
                >
                  {char}
                </motion.span>
              ))}
            </div>
            
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ duration: 1.5, delay: 2, ease: "easeInOut" }}
              className="h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent mt-8 w-64 md:w-96"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 3 }}
              className="text-xs text-primary/50 tracking-[0.3em] uppercase mt-3 font-mono"
            >
              System Online
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Trust Strip */}
      <div className="border-y border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap justify-center gap-8 md:gap-16 text-sm font-medium text-text-muted">
          <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Private by Design</div>
          <div className="flex items-center gap-2"><Search className="w-4 h-4" /> RAG Powered</div>
          <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Access Controlled</div>
          <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Fully Auditable</div>
        </div>
      </div>

    </div>
  );
};
