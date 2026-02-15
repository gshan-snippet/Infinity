import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Sparkles,
  Landmark,
  Building2,
  Cpu,
  Wrench,
  Lightbulb,
  Trophy,
  Shield,
  Target,
  Briefcase,
  Users,
  Globe,
  Factory,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

type CareerRow = {
  career_cluster: string;
  why_it_fits_you: string;
  sample_roles: string[];
  match_score: string;
};

type FollowUpOption = {
  id: string;
  title: string;
  description?: string;
};

type FollowUpQuestion = {
  id: 'q4' | 'q5' | 'q6';
  title: string;
  subtitle?: string;
  options: FollowUpOption[];
};

type BranchType = 'government' | 'sports' | 'general';

const sportRoles: Record<string, FollowUpOption[]> = {
  cricket: [
    { id: 'batsman', title: 'Batsman', description: 'Anchor innings and convert starts into match-winning scores.' },
    { id: 'bowler', title: 'Bowler', description: 'Lead wicket-taking strategy and control run flow under pressure.' },
    { id: 'all-rounder', title: 'All-rounder', description: 'Contribute strongly in both batting and bowling departments.' },
    { id: 'wicketkeeper', title: 'Wicketkeeper', description: 'Handle keeping duties and add tactical value with the bat.' }
  ],
  football: [
    { id: 'striker', title: 'Striker', description: 'Primary goal scorer focused on finishing and attacking runs.' },
    { id: 'midfielder', title: 'Midfielder', description: 'Control tempo, distribute passes, and connect defense to attack.' },
    { id: 'defender', title: 'Defender', description: 'Prevent goals, win duels, and maintain backline discipline.' },
    { id: 'goalkeeper', title: 'Goalkeeper', description: 'Lead defensive communication and protect goal in key moments.' }
  ],
  badminton: [
    { id: 'singles', title: 'Singles Specialist', description: 'Focus on one-on-one endurance, footwork, and tactical control.' },
    { id: 'doubles', title: 'Doubles Specialist', description: 'Build fast-court coordination and attacking pair chemistry.' },
    { id: 'mixed-doubles', title: 'Mixed Doubles Specialist', description: 'Master mixed-pair strategy, rotation, and quick net exchanges.' }
  ],
  athletics: [
    { id: 'sprint', title: 'Sprint Athlete', description: 'Train for explosive speed and short-distance peak performance.' },
    { id: 'endurance', title: 'Endurance Athlete', description: 'Build sustained pace, stamina, and race consistency over distance.' },
    { id: 'field-events', title: 'Field Events Athlete', description: 'Specialize in jumps/throws with technical precision and power.' }
  ]
};

function detectBranch(cluster: CareerRow | null, q2: string, q3: string): BranchType {
  const text = `${cluster?.career_cluster || ''} ${q2} ${q3}`.toLowerCase();
  if (text.includes('civil servant') || text.includes('government') || text.includes('public sector')) return 'government';
  if (text.includes('athlete') || text.includes('sports') || text.includes('celebrity')) return 'sports';
  return 'general';
}

function getGovernmentQ6(govType: string, domain: string): FollowUpOption[] {
  const centralByDomain: Record<string, FollowUpOption[]> = {
    electrical: [
      { id: 'isro-electrical', title: 'ISRO Scientist/Engineer (Electrical)', description: 'Work on mission-critical space power and electrical systems.' },
      { id: 'drdo-electrical', title: 'DRDO Scientist B (Electrical)', description: 'Design and test defense electrical systems and subsystems.' },
      { id: 'railways-electrical', title: 'Indian Railways Electrical Engineer', description: 'Build reliable electrical infrastructure for railway operations.' }
    ],
    mechanical: [
      { id: 'isro-mechanical', title: 'ISRO Scientist/Engineer (Mechanical)', description: 'Develop aerospace structures and thermal-mechanical hardware.' },
      { id: 'drdo-mechanical', title: 'DRDO Scientist B (Mechanical)', description: 'Contribute to defense platform design and validation.' },
      { id: 'barc-mechanical', title: 'BARC Scientific Officer (Mechanical)', description: 'Work on advanced mechanical systems in strategic projects.' }
    ],
    electronics: [
      { id: 'isro-ec', title: 'ISRO Scientist/Engineer (Electronics)', description: 'Build avionics, communication and embedded electronics for missions.' },
      { id: 'drdo-ec', title: 'DRDO Scientist B (Electronics)', description: 'Engineer defense electronics and signal systems.' },
      { id: 'bhel-ec', title: 'BHEL Engineer Trainee (Electronics)', description: 'Work on large-scale public-sector electronics and control systems.' }
    ],
    cs: [
      { id: 'nic-cs', title: 'NIC Scientist B (Computer Science)', description: 'Build secure digital systems for national e-governance.' },
      { id: 'isro-cs', title: 'ISRO Scientist/Engineer (Computer Science)', description: 'Develop mission software and high-reliability computing tools.' },
      { id: 'drdo-cs', title: 'DRDO Scientist B (Computer Science)', description: 'Work on defense software, simulation and secure computing.' }
    ],
    civil: [
      { id: 'cpwd-civil', title: 'CPWD Assistant Executive Engineer (Civil)', description: 'Lead planning and execution of government civil infrastructure.' },
      { id: 'isro-civil', title: 'ISRO Civil Engineer', description: 'Develop and maintain high-spec mission support infrastructure.' },
      { id: 'railways-civil', title: 'Indian Railways Civil Engineer', description: 'Build and maintain rail corridors, stations and structures.' }
    ]
  };

  const stateByDomain: Record<string, FollowUpOption[]> = {
    electrical: [
      { id: 'state-eb-electrical', title: 'State Electricity Board Assistant Engineer', description: 'Maintain state grid reliability and electrical distribution quality.' },
      { id: 'state-power-junior', title: 'State Power Corporation Junior Engineer', description: 'Support power operations, maintenance and expansion projects.' },
      { id: 'transco-electrical', title: 'State TRANSCO Engineer', description: 'Focus on transmission network planning and optimization.' }
    ],
    mechanical: [
      { id: 'state-irrigation-mech', title: 'State Irrigation Dept Mechanical Engineer', description: 'Run and improve mechanical systems in irrigation networks.' },
      { id: 'state-transport-mech', title: 'State Transport Corporation Engineer', description: 'Support fleet engineering and transport mechanical operations.' },
      { id: 'state-psu-mech', title: 'State PSU Mechanical Engineer', description: 'Contribute to state PSU plant/process mechanical systems.' }
    ],
    electronics: [
      { id: 'state-telecom-electronics', title: 'State Telecom/IT Electronics Officer', description: 'Manage public communication and electronics infrastructure.' },
      { id: 'state-surveillance-electronics', title: 'State Surveillance Systems Engineer', description: 'Implement and maintain critical monitoring electronics.' },
      { id: 'state-energy-electronics', title: 'State Energy Dept Electronics Engineer', description: 'Strengthen control electronics across state energy systems.' }
    ],
    cs: [
      { id: 'state-it-officer', title: 'State IT Department Officer', description: 'Drive digital services and citizen-facing tech platforms.' },
      { id: 'state-e-gov-engineer', title: 'State e-Governance Engineer', description: 'Build scalable portals and automation for governance.' },
      { id: 'state-cyber-analyst', title: 'State Cyber Operations Analyst', description: 'Protect public systems with security monitoring and response.' }
    ],
    civil: [
      { id: 'state-pwd-civil', title: 'State PWD Assistant Engineer (Civil)', description: 'Plan and execute roads/buildings for public development.' },
      { id: 'state-municipal-civil', title: 'Municipal Corporation Civil Engineer', description: 'Improve city infrastructure and civic works delivery.' },
      { id: 'state-rural-works', title: 'State Rural Works Engineer', description: 'Develop resilient rural infrastructure and utilities.' }
    ]
  };

  if (govType === 'state') return stateByDomain[domain] || stateByDomain.civil;
  return centralByDomain[domain] || centralByDomain.civil;
}

function getSportsQ6(sport: string, role: string): FollowUpOption[] {
  if (sport === 'cricket') {
    return [
      { id: 'ranji-path', title: `Ranji Trophy ${role}` },
      { id: 'ipl-path', title: `IPL ${role}`, description: 'Target franchise-level exposure and high-performance competition.' },
      { id: 'india-a-path', title: `India A ${role}`, description: 'Build stepping-stone progression to senior international level.' },
      { id: 'international-path', title: `International Team ${role}`, description: 'Aim for national squad selection and global tournaments.' }
    ];
  }
  if (sport === 'football') {
    return [
      { id: 'isl-path', title: `ISL ${role}`, description: 'Compete at top domestic league level with professional clubs.' },
      { id: 'i-league-path', title: `I-League ${role}`, description: 'Build league consistency and long-term professional pathway.' },
      { id: 'national-camp-path', title: `National Team Camp ${role}`, description: 'Focus on selection pipeline for national representation.' }
    ];
  }
  return [
    { id: 'state-level-path', title: `State-level ${role}`, description: 'Build competitive foundation through state tournaments.' },
    { id: 'national-level-path', title: `National-level ${role}`, description: 'Scale performance to national circuits and championships.' },
    { id: 'international-level-path', title: `International-level ${role}`, description: 'Target elite events with international qualification standards.' }
  ];
}

function getGeneralQ6Options(selectedTrack: string): FollowUpOption[] {
  const role = (selectedTrack || '').toLowerCase();

  if (role.includes('actor')) {
    return [
      { id: 'film-actor', title: 'Film Actor', description: 'Focus on cinema roles and long-format character development.' },
      { id: 'tv-actor', title: 'TV/OTT Actor', description: 'Target serial and streaming productions with consistent output.' },
      { id: 'theatre-actor', title: 'Theatre Actor', description: 'Build stage craft, voice control and live-performance depth.' },
      { id: 'character-actor', title: 'Character Actor', description: 'Specialize in strong supporting and transformational roles.' }
    ];
  }

  if (role.includes('musician') || role.includes('singer')) {
    return [
      { id: 'playback', title: 'Playback/Studio Music', description: 'Aim for recorded tracks, commercial releases and studio sessions.' },
      { id: 'live-performance', title: 'Live Performance Artist', description: 'Focus on concerts, stage presence and audience engagement.' },
      { id: 'indie-composer', title: 'Indie Composer/Producer', description: 'Create original tracks and build an independent audience.' },
      { id: 'classical-artist', title: 'Classical Specialist', description: 'Master traditional style and performance discipline.' }
    ];
  }

  if (role.includes('dancer')) {
    return [
      { id: 'classical-dance', title: 'Classical Dance Path', description: 'Specialize in technique-rich traditional forms.' },
      { id: 'contemporary-dance', title: 'Contemporary Dance Path', description: 'Focus on modern choreography and expressive movement.' },
      { id: 'commercial-dance', title: 'Commercial/Film Dance Path', description: 'Target industry choreography and screen performance.' },
      { id: 'dance-instructor', title: 'Dance Performer + Instructor', description: 'Combine stage performance with teaching and coaching.' }
    ];
  }

  if (role.includes('comedian') || role.includes('stand-up')) {
    return [
      { id: 'live-comedy', title: 'Live Stand-up Circuit', description: 'Build stage sets and tour clubs/venues.' },
      { id: 'digital-comedy', title: 'Digital Comedy Creator', description: 'Grow through short-form and long-form online content.' },
      { id: 'writers-room', title: 'Comedy Writer/Sketch Room', description: 'Specialize in scripted humor formats and team writing.' },
      { id: 'improv-comedy', title: 'Improv Performance Path', description: 'Focus on spontaneous audience-driven comedy formats.' }
    ];
  }

  if (role.includes('analyst') || role.includes('data')) {
    return [
      { id: 'business-analyst', title: 'Business Analyst Track', description: 'Solve business problems with insights and reporting.' },
      { id: 'data-analyst', title: 'Data Analyst Track', description: 'Focus on dashboards, KPIs and pattern discovery.' },
      { id: 'product-analyst', title: 'Product Analyst Track', description: 'Drive product decisions with user and feature metrics.' },
      { id: 'operations-analyst', title: 'Operations Analyst Track', description: 'Improve process efficiency through data-backed actions.' }
    ];
  }

  if (role.includes('engineer') || role.includes('developer')) {
    return [
      { id: 'core-tech', title: 'Core Technical Specialist', description: 'Deepen expertise in the strongest technical sub-domain.' },
      { id: 'full-stack', title: 'Full-cycle Builder', description: 'Handle end-to-end delivery from design to deployment.' },
      { id: 'platform-systems', title: 'Platform/Systems Path', description: 'Work on scalable systems and infrastructure quality.' },
      { id: 'applied-domain', title: 'Applied Domain Engineer', description: 'Apply engineering to a focused industry use-case.' }
    ];
  }

  return [
    { id: 'specialist-track', title: `${selectedTrack} Specialist`, description: `Go deep and become highly skilled in ${selectedTrack}.` },
    { id: 'execution-track', title: `${selectedTrack} Execution Path`, description: `Focus on practical delivery and portfolio in ${selectedTrack}.` },
    { id: 'hybrid-track', title: `${selectedTrack} Hybrid Path`, description: `Combine ${selectedTrack} with adjacent skills for broader opportunities.` },
    { id: 'lead-track', title: `${selectedTrack} Leadership Track`, description: `Grow toward leading teams and projects in ${selectedTrack}.` }
  ];
}

function buildFollowUpQuestions(branch: BranchType, selectedCluster: CareerRow | null, answers: Record<string, string>): FollowUpQuestion[] {
  if (branch === 'government') {
    return [
      {
        id: 'q4',
        title: 'Which type of government role do you want?',
        subtitle: 'Central: nation-level ministries and organizations. State: state departments and boards.',
        options: [
          { id: 'central', title: 'Central Government', description: 'Nation-level bodies (ISRO, DRDO, Railways).' },
          { id: 'state', title: 'State Government', description: 'State-level departments (PWD, state boards, municipal).' }
        ]
      },
      {
        id: 'q5',
        title: 'Which technical stream matches you most?',
        options: [
          { id: 'electrical', title: 'Electrical' },
          { id: 'mechanical', title: 'Mechanical', description: 'Best if you enjoy machines, systems and applied design.' },
          { id: 'electronics', title: 'Electronics', description: 'Best for circuits, communication systems and embedded tech.' },
          { id: 'cs', title: 'Computer Science', description: 'Best for software, data systems and digital governance tools.' },
          { id: 'civil', title: 'Civil', description: 'Best for infrastructure, structures and public works development.' }
        ]
      },
      {
        id: 'q6',
        title: 'Which exact role + organization are you targeting first?',
        options: getGovernmentQ6(answers.q4 || 'central', answers.q5 || 'civil')
      }
    ];
  }

  if (branch === 'sports') {
    const sport = answers.q4 || 'cricket';
    const roleOptions = sportRoles[sport] || sportRoles.cricket;
    const role = answers.q5 || roleOptions[0].id;
    return [
      {
        id: 'q4',
        title: 'What type of sports do you want to focus on?',
        options: [
          { id: 'cricket', title: 'Cricket', description: 'Team-based sport with strong domestic and franchise pathways.' },
          { id: 'football', title: 'Football', description: 'High-tempo team sport with league and national camp progression.' },
          { id: 'badminton', title: 'Badminton', description: 'Racquet sport with singles/doubles specialization tracks.' },
          { id: 'athletics', title: 'Athletics', description: 'Individual performance pathway across track and field events.' },
          { id: 'other', title: 'Other Competitive Sports', description: 'Choose another sport and follow structured competition milestones.' }
        ]
      },
      {
        id: 'q5',
        title: 'Which player role best describes you?',
        options: roleOptions
      },
      {
        id: 'q6',
        title: 'Which target league/level are you aiming for first?',
        options: getSportsQ6(sport, role)
      }
    ];
  }

  const roles = Array.isArray(selectedCluster?.sample_roles) ? selectedCluster!.sample_roles.slice(0, 4) : [];
  const safeRoles = roles.length > 0 ? roles : ['Entry Analyst', 'Program Associate', 'Operations Specialist'];
  const selectedQ5Role = safeRoles.find((_, index) => `track-${index + 1}` === (answers.q5 || '')) || safeRoles[0];
  return [
    {
      id: 'q4',
      title: 'Which work model do you prefer most?',
      options: [
        { id: 'stable-organization', title: 'Stable large organization', description: 'Prioritize structured growth, stability and predictable progression.' },
        { id: 'growth-startup', title: 'Fast-growth startup', description: 'Prioritize learning speed, ownership and rapid role expansion.' },
        { id: 'public-impact', title: 'Public impact / service', description: 'Prioritize social outcomes and broad community-level impact.' },
        { id: 'flexible-lifestyle', title: 'Flexible lifestyle role', description: 'Prioritize balance, flexibility and sustainable work cadence.' }
      ]
    },
    {
      id: 'q5',
      title: 'Which direction feels most aligned?',
      options: safeRoles.map((role, index) => ({ id: `track-${index + 1}`, title: role, description: `Primary track focused on becoming strong in ${role}.` }))
    },
    {
      id: 'q6',
      title: `Which specialization in ${selectedQ5Role} fits you best?`,
      options: getGeneralQ6Options(selectedQ5Role)
    }
  ];
}

function getOptionVisual(option: FollowUpOption, index: number) {
  const text = `${option.id} ${option.title}`.toLowerCase();

  if (text.includes('government') || text.includes('central') || text.includes('state')) {
    return { Icon: Landmark, iconBg: 'from-blue-400/30 to-blue-500/10', border: 'border-blue-300/60', shadow: 'hover:shadow-blue-500/20' };
  }
  if (text.includes('isro') || text.includes('drdo') || text.includes('barc')) {
    return { Icon: Rocket, iconBg: 'from-indigo-400/30 to-indigo-500/10', border: 'border-indigo-300/60', shadow: 'hover:shadow-indigo-500/20' };
  }
  if (text.includes('electrical') || text.includes('electronics')) {
    return { Icon: Cpu, iconBg: 'from-cyan-400/30 to-cyan-500/10', border: 'border-cyan-300/60', shadow: 'hover:shadow-cyan-500/20' };
  }
  if (text.includes('mechanical') || text.includes('civil') || text.includes('engineer')) {
    return { Icon: Wrench, iconBg: 'from-orange-400/30 to-orange-500/10', border: 'border-orange-300/60', shadow: 'hover:shadow-orange-500/20' };
  }
  if (text.includes('cricket') || text.includes('football') || text.includes('athlete') || text.includes('league') || text.includes('ipl') || text.includes('ranji')) {
    return { Icon: Trophy, iconBg: 'from-emerald-400/30 to-emerald-500/10', border: 'border-emerald-300/60', shadow: 'hover:shadow-emerald-500/20' };
  }
  if (text.includes('public') || text.includes('service')) {
    return { Icon: Shield, iconBg: 'from-teal-400/30 to-teal-500/10', border: 'border-teal-300/60', shadow: 'hover:shadow-teal-500/20' };
  }
  if (text.includes('startup') || text.includes('organization')) {
    return { Icon: Building2, iconBg: 'from-violet-400/30 to-violet-500/10', border: 'border-violet-300/60', shadow: 'hover:shadow-violet-500/20' };
  }
  if (text.includes('target') || text.includes('track') || text.includes('role')) {
    return { Icon: Target, iconBg: 'from-amber-400/30 to-amber-500/10', border: 'border-amber-300/60', shadow: 'hover:shadow-amber-500/20' };
  }
  if (text.includes('team') || text.includes('camp')) {
    return { Icon: Users, iconBg: 'from-sky-400/30 to-sky-500/10', border: 'border-sky-300/60', shadow: 'hover:shadow-sky-500/20' };
  }
  if (text.includes('international')) {
    return { Icon: Globe, iconBg: 'from-lime-400/30 to-lime-500/10', border: 'border-lime-300/60', shadow: 'hover:shadow-lime-500/20' };
  }
  if (text.includes('railways') || text.includes('plant') || text.includes('psu')) {
    return { Icon: Factory, iconBg: 'from-slate-400/30 to-slate-500/10', border: 'border-slate-300/60', shadow: 'hover:shadow-slate-500/20' };
  }

  const fallback = [
    { Icon: Sparkles, iconBg: 'from-blue-400/30 to-blue-500/10', border: 'border-blue-300/60', shadow: 'hover:shadow-blue-500/20' },
    { Icon: Lightbulb, iconBg: 'from-amber-400/30 to-amber-500/10', border: 'border-amber-300/60', shadow: 'hover:shadow-amber-500/20' },
    { Icon: Briefcase, iconBg: 'from-emerald-400/30 to-emerald-500/10', border: 'border-emerald-300/60', shadow: 'hover:shadow-emerald-500/20' }
  ];
  return fallback[index % fallback.length];
}

const DiscoverGoalDeepDive = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveActivity } = useAuth();
  const state = (location as any).state;

  const selectedCluster = (state?.selectedCluster || null) as CareerRow | null;
  const initialAnswers = state?.initialAnswers || {};
  const q2Answer = (initialAnswers?.question2?.[0] || '') as string;
  const q3Answer = (initialAnswers?.question3?.[0] || '') as string;
  const branch = detectBranch(selectedCluster, q2Answer, q3Answer);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const questions = useMemo(() => buildFollowUpQuestions(branch, selectedCluster, answers), [branch, selectedCluster, answers]);
  const currentQuestion = questions[stepIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : '';
  const progress = Math.round(((stepIndex + 1) / 3) * 100);

  const selectOption = (questionId: 'q4' | 'q5' | 'q6', optionId: string) => {
    setAnswers((prev) => {
      if (questionId === 'q4') return { q4: optionId };
      if (questionId === 'q5') return { ...prev, q5: optionId, q6: '' };
      return { ...prev, q6: optionId };
    });
  };

  const getOptionTitle = (questionId: 'q4' | 'q5' | 'q6') => {
    const q = questions.find((x) => x.id === questionId);
    const value = answers[questionId];
    return q?.options.find((o) => o.id === value)?.title || '';
  };

  const handleContinue = async () => {
    if (!currentAnswer) return;
    if (stepIndex < 2) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    setSaving(true);
    try {
      await saveActivity({
        type: 'goal_discovery_deep_dive',
        selectedCluster: selectedCluster?.career_cluster,
        branch,
        answers: {
          q4: getOptionTitle('q4'),
          q5: getOptionTitle('q5'),
          q6: getOptionTitle('q6')
        },
        timestamp: new Date().toISOString()
      });

      const finalSelections = {
        q4: getOptionTitle('q4'),
        q5: getOptionTitle('q5'),
        q6: getOptionTitle('q6')
      };

      navigate('/discover-goal-final-summary', {
        state: {
          selectedCluster,
          branch,
          initialAnswers,
          finalSelections,
          summary: state?.summary || null
        }
      });
    } catch (err) {
      console.error('Error saving deep dive activity:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!selectedCluster) {
    return (
      <div className="min-h-screen px-4 py-8 bg-[linear-gradient(135deg,#f2f8ff_0%,#ecfff6_45%,#fff8ef_100%)]">
        <div className="container mx-auto max-w-2xl">
          <Button variant="ghost" onClick={() => navigate('/discover-goal-matches')} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Card className="p-6 rounded-2xl">
            <p className="text-slate-700">No selected cluster found. Please choose a career cluster first.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8 bg-[linear-gradient(140deg,#f5f9ff_0%,#ecf7f3_40%,#fff9f1_100%)]">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <Button variant="ghost" onClick={() => navigate('/discover-goal-matches')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="rounded-2xl border border-white/40 bg-white/55 backdrop-blur-lg p-5 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">Question {stepIndex + 4} of 6</p>
            <p className="text-sm font-bold text-slate-900">{progress}%</p>
          </div>
          <div className="h-3 rounded-full bg-slate-200/80 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {currentQuestion && (
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{currentQuestion.title}</h1>
              {currentQuestion.subtitle && <p className="text-slate-600 font-medium">{currentQuestion.subtitle}</p>}
              <p className="text-sm text-slate-500 mt-1">Selected cluster: {selectedCluster.career_cluster}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {currentQuestion.options.map((option, index) => {
                const selected = currentAnswer === option.id;
                const visual = getOptionVisual(option, index);
                return (
                  <motion.div key={option.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.985 }}>
                    <Card
                      onClick={() => selectOption(currentQuestion.id, option.id)}
                      className={`cursor-pointer rounded-2xl border-2 transition-all duration-300 bg-white/75 backdrop-blur-sm ${visual.border} ${visual.shadow} ${selected ? 'ring-2 ring-cyan-500 shadow-xl scale-[1.01]' : 'shadow-md hover:shadow-xl'}`}
                    >
                      <div className="p-5">
                        <div className={`w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${visual.iconBg} border border-white/60 flex items-center justify-center`}>
                          <visual.Icon className="h-6 w-6 text-slate-800" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{option.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {option.description || `Choose this path if your aim is to move toward ${option.title}.`}
                        </p>
                        <div className="mt-4 flex justify-end">
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-cyan-500 bg-cyan-500 text-white' : 'border-slate-300'}`}>
                            {selected && <Check className="h-4 w-4" />}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <Button
              onClick={handleContinue}
              disabled={!currentAnswer || saving}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 hover:brightness-110"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {stepIndex === 2 ? (saving ? 'Preparing Summary...' : 'Finish') : 'Continue'}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DiscoverGoalDeepDive;
