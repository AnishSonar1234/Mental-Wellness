import { useState, useRef, useEffect, useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { motion } from "framer-motion";
import {
  Heart,
  HeartHandshake,
  MessageCircle,
  BookOpen,
  User,
  LineChart,
  Save,
  Calendar,
  Smile,
  Users,
  Trophy,
  Star,
  CheckCircle,
  Plus,
  Compass,
  Shield,
  X,
  Square,
  Flame,
  Target,
  Clock,
  Edit3,
  Eye,
  Trash2,
  Play,
  RefreshCw,
  Settings,
  Wind,
  Phone,
  LifeBuoy,
  Sparkles,
} from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

// Declare Botpress types
declare global {
  interface Window {
    botpress: {
      init: (config: any) => void;
      on: (event: string, callback: () => void) => void;
      open: () => void;
    };
  }
}


const SereneApp = () => {
  const [currentView, setCurrentView] = useState<
    | "landing"
    | "onboarding"
    | "dashboard"
    | "chatbot"
    | "journal"
    | "profile"
    | "settings"
    | "helplines"
    | "ai"
  >("landing");
  const [userInterests, setUserInterests] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [journalEntry, setJournalEntry] = useState("");
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [activeAccentColor, setActiveAccentColor] = useState("#4FD1C5"); // Default teal
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [completedTracks, setCompletedTracks] = useState<string[]>([]);
  const [anonId] = useState(
    () =>
      `anon-${Math.random().toString(36).slice(2, 5)}-${Math.random()
        .toString(36)
        .slice(2, 5)}-${Math.random().toString(36).slice(2, 5)}`
  );

  // Journal upgrade state variables
  const [journalView, setJournalView] = useState<"list" | "new">("list");
  const [journalEntries, setJournalEntries] = useState<Array<{
    id: string;
    date: string;
    content: string;
    prompt: string;
  }>>([]);
  const [dailyPrompt, setDailyPrompt] = useState("");
  const [streakCount, setStreakCount] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [activeTrack, setActiveTrack] = useState<{
    goal: string;
    day: number;
    task: string;
    tasks: string[];
  } | null>(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showTrackDetail, setShowTrackDetail] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<{
    goal: string;
    tasks: string[];
  } | null>(null);
  const [showCustomGoalInput, setShowCustomGoalInput] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState("");
  const [showToast, setShowToast] = useState(false);
  // Guided Tracks creation flow and focus task
  const [trackCreationStep, setTrackCreationStep] = useState<1 | 2>(1);
  const [pendingGoal, setPendingGoal] = useState("");
  const [pendingDuration, setPendingDuration] = useState<number | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [focusTask, setFocusTask] = useState<string | null>(null);
  const [taskCompleted, setTaskCompleted] = useState(false);
  // Stable mood history for dashboard heatmap and today's selection
  const [moodHistory, setMoodHistory] = useState<number[]>(() => {
    const days = 42; // ~6 weeks
    return Array.from({ length: days }, () => Math.floor(Math.random() * 5) + 1);
  });
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  // Diagnostic logging and safety net for invalid view values
  useEffect(() => {
    console.log(`The active view is now: '${currentView}'`);
    const valid = [
      "landing",
      "onboarding",
      "chatbot",
      "journal",
      "profile",
      "settings",
      "helplines",
      "ai",
    ];
    if (!valid.includes(currentView)) {
      setCurrentView("chatbot");
    }
  }, [currentView]);

  // Generate daily prompt when switching to new entry view
  useEffect(() => {
    if (journalView === "new" && !dailyPrompt) {
      setDailyPrompt(generatePersonalizedPrompt());
    }
  }, [journalView, dailyPrompt]);

  // When Focus Mode opens, seed prompt once (keeps stable until refreshed manually)
  useEffect(() => {
    if (isFocusOpen) {
      setDailyPrompt((prev) => prev || generatePersonalizedPrompt());
    }
  }, [isFocusOpen]);

  // Initialize Botpress when chatbot view is rendered
  useEffect(() => {
    if (currentView === "chatbot" && window.botpress) {
      const webchatElement = document.getElementById('webchat');
      if (webchatElement) {
        // Clear any existing content to ensure fresh initialization
        webchatElement.innerHTML = '';
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          window.botpress.init({
            "botId": "249f7f3f-abe4-4541-86ed-457fcd9a1413",
            "configuration": {
              "version": "v2",
              "botName": "Support Guidance Bot",
              "botDescription": "I am here to provide guidance and support for managing feelings of worthlessness and navigating counseling needs.",
              "website": {},
              "email": {},
              "phone": {},
              "termsOfService": {},
              "privacyPolicy": {},
              "color": "#3276EA",
              "variant": "solid",
              "headerVariant": "glass",
              "themeMode": "light",
              "fontFamily": "inter",
              "radius": 4,
              "feedbackEnabled": true,
              "footer": "[⚡ by Botpress](https://botpress.com/?from=webchat)",
              "soundEnabled": true
            },
            "clientId": "33981585-9299-4dce-b311-aa027a9e0599",
            "selector": "#webchat"
          });

          window.botpress.on("webchat:ready", () => {
            window.botpress.open();
          });
        }, 100);
      }
    }
  }, [currentView]);

  // Enhanced journal functions
  const saveJournalEntry = () => {
    if (!journalEntry.trim()) return;

    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      content: journalEntry,
      prompt: dailyPrompt,
    };

    setJournalEntries((prev) => [newEntry, ...prev]);
    updateStreak();
    setJournalEntry("");
    setJournalView("list");
    // Toast success
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const lastEntry = journalEntries[0];
    
    if (!lastEntry) {
      setStreakCount(1);
      setLongestStreak((prev) => Math.max(prev, 1));
      return;
    }
    
    const lastEntryDate = new Date(lastEntry.date).toDateString();
    
    if (lastEntryDate === yesterday || lastEntryDate === today) {
      setStreakCount((prev) => {
        const next = prev + 1;
        setLongestStreak((maxPrev) => Math.max(maxPrev, next));
        return next;
      });
    } else {
      setStreakCount(1);
      setLongestStreak((prev) => Math.max(prev, 1));
    }
  };

  // Data management helpers
  const exportUserData = () => {
    try {
      const data = {
        journalEntries,
        selectedInterests,
        completedTracks,
        streakCount,
        longestStreak,
        activeTrack,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `serene-data-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  const deleteAllUserData = () => {
    setJournalEntries([]);
    setSelectedInterests([]);
    setCompletedTracks([]);
    setStreakCount(0);
    setLongestStreak(0);
    setActiveTrack(null);
    setShowDeleteConfirm(false);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const generatePersonalizedPrompt = () => {
    const personalizedPrompts = [
      "If your day was a movie, what was the genre and who was the main character?",
      "What was your 'Play of the Day' today, big or small, like in a cricket match?",
      "What's one quality your favorite book character has that you demonstrated today?",
      "If you could give your past self from this morning one piece of advice, what would it be?",
      "What's one thing that surprised you about yourself today?",
      "If today had a soundtrack, what would be the theme song and why?",
      "What's one small victory you achieved today that deserves celebration?",
      "If you could freeze one moment from today in time, which would it be?",
      "What's one thing you learned about the world around you today?",
      "If today was a chapter in your life story, what would the title be?",
    ];

    return personalizedPrompts[Math.floor(Math.random() * personalizedPrompts.length)];
  };

  const getJournalPrompt = () => {
    const prompts = [
      "What is one thing you're grateful for today?",
      "How did you show kindness to yourself or others today?",
      "What emotions did you experience today, and what triggered them?",
      "Describe a moment from today that made you smile.",
      "What's one lesson you learned about yourself today?",
      "What would you like to release from your mind right now?",
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  // Guided Tracks data
  const guidedTracks = [
    {
      goal: "Improve Public Speaking",
      tasks: [
        "Today's Task: Record a 30-second voice note describing your favorite food. The goal is just to get comfortable hearing your own voice.",
        "Today's Task: Stand in front of a mirror and practice introducing yourself with a confident smile and open posture. In your journal below, write down one thing that felt good and one thing that felt awkward.",
        "Today's Task: Practice speaking about your hobby for 2 minutes to a friend or family member. Note how your body language changed as you got more comfortable.",
        "Today's Task: Record yourself giving a 1-minute presentation about your favorite book. Focus on speaking clearly and at a good pace.",
        "Today's Task: Practice the 'power pose' for 2 minutes before having a conversation. Notice how it affects your confidence.",
      ],
    },
    {
      goal: "Practice Mindfulness",
      tasks: [
        "Today's Task: Take 5 deep breaths before writing in your journal. Notice how your mind feels different after breathing.",
        "Today's Task: Spend 3 minutes observing your surroundings without judgment. Write about what you noticed that you usually miss.",
        "Today's Task: Practice mindful eating with one meal today. Describe the experience in detail below.",
        "Today's Task: Do a body scan meditation for 5 minutes. Note any areas of tension or relaxation you discovered.",
        "Today's Task: Practice gratitude by writing down 3 things you're thankful for, no matter how small.",
      ],
    },
    {
      goal: "Build Confidence",
      tasks: [
        "Today's Task: Write down 3 things you did well today, no matter how small. Celebrate these wins!",
        "Today's Task: Practice positive self-talk by writing yourself a letter of encouragement.",
        "Today's Task: Step outside your comfort zone in one small way today. Document how it felt.",
        "Today's Task: List 5 things you like about yourself. Be specific and kind.",
        "Today's Task: Practice saying 'no' to something you don't want to do. Reflect on how it felt to set boundaries.",
      ],
    },
  ];

  const startGuidedTrack = (goal: string, tasks?: string[]) => {
    const track = tasks ? { goal, tasks } : guidedTracks.find((t) => t.goal === goal);
    if (track) {
      setActiveTrack({
        goal: track.goal,
        day: 1,
        task: track.tasks[0],
        tasks: track.tasks,
      });
      setShowTrackModal(false);
      setShowTrackDetail(false);
    }
  };

  const getNextTrackTask = () => {
    if (!activeTrack) return null;
    const nextDay = activeTrack.day + 1;
    if (nextDay <= activeTrack.tasks.length) {
      setActiveTrack({
        ...activeTrack,
        day: nextDay,
        task: activeTrack.tasks[nextDay - 1],
        tasks: activeTrack.tasks,
      });
    } else {
      // Track completed
      setActiveTrack(null);
      if (activeTrack?.goal) {
        setCompletedTracks((prev) =>
          prev.includes(activeTrack.goal) ? prev : [...prev, activeTrack.goal]
        );
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const moodEmojis = [
    { emoji: "😊", mood: "happy", label: "Happy" },
    { emoji: "🙂", mood: "good", label: "Good" },
    { emoji: "😐", mood: "neutral", label: "Neutral" },
    { emoji: "😔", mood: "sad", label: "Sad" },
    { emoji: "😰", mood: "anxious", label: "Anxious" },
  ];

  const interests = [
    "Music 🎵",
    "Cricket 🏏",
    "Movies 🎬",
    "Reading 📚",
    "Gaming 🎮",
    "Art & Design 🎨",
    "Foodie 🍕",
    "Travel ✈️",
    "Memes 😂",
    "Coding 💻",
    "Chai ☕",
    "Friends ✨",
  ];

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) => {
      const exists = prev.includes(label);
      const next = exists ? prev.filter((i) => i !== label) : [...prev, label];
      setUserInterests(next.join(", "));
      return next;
    });
  };

  if (currentView === "landing") {
    return (
      <>
      {/* FIX: Ensure landing uses clear full-width sections to prevent overlap and restore narrative flow */}
      <div className="min-h-screen relative bg-gray-900 text-gray-300">
        <Particles
          id="tsparticles"
          className="absolute inset-0 -z-10"
          init={particlesInit}
          options={{
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            particles: {
              number: { value: 50 },
              color: { value: "#ffffff" },
              shape: { type: "circle" },
              size: { value: 1.5, random: true },
              opacity: { value: 0.5, random: true },
              move: { enable: true, speed: 0.2, direction: "top", straight: false },
              links: { enable: false },
            },
            interactivity: {
              events: { onHover: { enable: false }, onClick: { enable: false } },
            },
            detectRetina: true,
          }}
        />
        <ThreeBackground />
        <div className="relative z-10">
          {/* Navigation Bar */}
          <nav className="card-soft mx-4 mt-4 rounded-2xl backdrop-blur-lg">
            <div className="flex justify-between items-center py-2 px-6">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center"
                aria-label="Scroll to top"
              >
              <Heart className="w-6 h-6 text-primary" />
              </a>
              <div className="flex gap-x-8">
                <a
                  href="#home"
                  className="text-primary font-medium hover:text-primary-light transition-colors duration-200 text-sm"
                >
                  Home
                </a>
                <a
                  href="#features"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                >
                  How It Works
                </a>
                <a
                  href="#privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                >
                  Privacy
                </a>
              </div>
              <button
                onClick={() => setCurrentView("onboarding")}
                className="p-1 rounded-full hover:bg-muted/50 transition-colors duration-200"
                aria-label="Begin Your Journey"
              >
                <User className="w-6 h-6 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </nav>

          {/* FIX: Hero as a dedicated full-width section band */}
          <section
            id="home"
            className="w-full py-20 px-8 flex flex-col items-center"
          >
            <motion.div
              className="max-w-4xl w-full text-center"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.3 } } }}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <Heart className="w-20 h-20 text-cyan-400 mx-auto mb-8 animate-breathing" />
              </motion.div>
              <motion.h1
                className="text-5xl md:text-6xl font-bold text-white mb-6"
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              >
                Find Your Calm
              </motion.h1>
              <motion.p
                className="text-2xl md:text-3xl text-white mb-4"
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              >
                A Private Space for Your Thoughts
              </motion.p>
              <motion.p
                className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              >
                No accounts. No sign-ups. Just support.
              </motion.p>

              <motion.button
                onClick={() => setCurrentView("onboarding")}
                className="text-xl px-12 py-4 mb-16 rounded-xl bg-cyan-400 text-gray-900 font-semibold transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 hover:bg-cyan-300"
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              >
                Begin Your Journey
              </motion.button>

              {/* About Section placeholder retained for future content */}
            </motion.div>
          </section>

          {/* FIX: Features as its own full-width section with grid rows */}
          <section id="features" className="w-full py-20 px-8 flex flex-col items-center">
            <div className="w-full max-w-5xl">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
                  An AI Companion That Truly Understands
              </h2>

              {[
                  {
                    title: "Emotional Companionship",
                    description:
                      "Warm, empathetic conversations designed to meet you where you are.",
                    Icon: HeartHandshake,
                  },
                  {
                    title: "Self-Guided Recovery",
                    description:
                      "Practical, culturally-aware guidance you can follow at your own pace.",
                    Icon: Compass,
                  },
                  {
                    title: "Gender-Sensitive AI",
                    description:
                      "Thoughtful responses that respect identity and lived experiences.",
                    Icon: Users,
                  },
                  {
                    title: "AI Journaling & Mood Tracking",
                    description:
                      "Guided prompts and trends that help you notice patterns over time.",
                    Icon: BookOpen,
                  },
                  {
                    title: "Crisis Mode",
                    description:
                      "Grounding support for tough moments, always focused on safety.",
                    Icon: Shield,
                  },
              ].map(({ title, description, Icon }, idx) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                  className="grid md:grid-cols-2 gap-8 mb-12 items-center"
                >
                  {/* FIX: Use grid for alternating layout and reorder with md:order-* */}
                  <div className={idx % 2 === 1 ? "md:order-2" : "md:order-1"}>
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center justify-center">
                      <Icon className="text-cyan-400 w-12 h-12" />
                    </div>
                  </div>
                  <div className={idx % 2 === 1 ? "md:order-1" : "md:order-2"}>
                    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-lg text-gray-400">{description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* FIX: How It Works as full-width motion.section with centered content */}
          <motion.section
            id="how-it-works"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="w-full py-20 px-8 flex flex-col items-center"
          >
            <div className="w-full max-w-4xl">
                  <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
                    A Clear Path to Calm in 3 Simple Steps
                  </h2>
                  <div className="mx-auto relative">
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-full bg-gray-700 origin-top"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.8 }}
                    />

                    {[
                      {
                        num: "01",
                        title: "Begin Anonymously",
                        desc: "No sign-up, no email. Start instantly with a unique, private ID.",
                      },
                      {
                        num: "02",
                        title: "Chat or Journal",
                        desc: "Talk with your AI companion or write privately with guided prompts.",
                      },
                      {
                        num: "03",
                        title: "Gain Clarity",
                        desc: "Track mood and patterns over time to understand your well-being.",
                      },
                    ].map(({ num, title, desc }, i) => (
                      <motion.div
                        key={num}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="relative flex items-start gap-6 py-8"
                      >
                        <div className="absolute left-1/2 -translate-x-1/2">
                          <div className="w-12 h-12 rounded-full border-2 border-cyan-400 bg-gray-900 flex items-center justify-center text-cyan-400 font-bold">
                            {num}
                          </div>
                        </div>
                        <div
                          className={`w-1/2 ${
                            i % 2 === 0 ? "pr-10" : "pl-10 ml-auto text-right"
                          }`}
                        >
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                            {title}
                    </h3>
                          <p className="text-gray-400 text-lg">{desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
            </div>
          </motion.section>

          {/* FIX: Privacy as full-width motion.section with md:grid-cols-2 */}
          <motion.section
            id="privacy"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="w-full py-20 px-8 flex flex-col items-center"
          >
            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">
                    <div className="flex justify-center">
                      <div className="w-48 h-48 rounded-3xl flex items-center justify-center bg-gray-800 border border-gray-700 shadow-inner">
                        <Shield className="w-28 h-28 text-cyan-400" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        A Truly Confidential Space
                      </h2>
                      <p className="text-lg text-gray-400 mb-6">
                        Your thoughts are yours alone. We built Serene from the
                        ground up to ensure your privacy is unbreakable.
                      </p>
                      <ul className="space-y-3 text-gray-300">
                        <li className="p-4 rounded-2xl bg-gray-800 border border-gray-700">
                          <span className="font-semibold">No Accounts:</span> We
                          never ask for your name, email, or personal details.
                        </li>
                        <li className="p-4 rounded-2xl bg-gray-800 border border-gray-700">
                          <span className="font-semibold">On-Device Data:</span>{" "}
                          Your journal entries and chat logs are encrypted and
                          stored only on your device.
                        </li>
                        <li className="p-4 rounded-2xl bg-gray-800 border border-gray-700">
                          <span className="font-semibold">Anonymous ID:</span>{" "}
                          Your progress is tracked with an anonymous ID that
                          cannot be linked back to you.
                        </li>
                      </ul>
                    </div>
            </div>
          </motion.section>

          {/* Final CTA as its own animated band */}
          <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="w-full py-20 px-8 flex flex-col items-center"
              >
                <section className="max-w-3xl mx-auto text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Ready to Find Your Calm?
                  </h2>
                  <button
                    onClick={() => setCurrentView("onboarding")}
                    className="inline-flex items-center justify-center text-lg px-10 py-4 rounded-xl bg-cyan-400 text-gray-900 font-semibold hover:bg-cyan-300 transition-colors duration-200"
                  >
                    Begin Your Journey
                  </button>
                </section>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <footer className="mt-24 bg-gray-900 border-t border-gray-700">
              <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-3">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Heart className="w-6 h-6 text-primary" />
                    <span className="font-bold text-primary text-lg">
                      Serene
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Your confidential companion for mental wellness.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-4">
                    Quick Links
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="#home"
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        Home
                      </a>
                    </li>
                    <li>
                      <a
                        href="#features"
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        Features
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-4">
                    Legal
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="/privacy"
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a
                        href="/terms"
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        Terms of Service
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 py-4 text-center text-xs text-muted-foreground">
                © 2025 Serene. All Rights Reserved.
              </div>
            </footer>
          </motion.div>
      </>
    );
  }

  if (currentView === "onboarding") {
    return (
      <div className="min-h-screen relative">
        <ThreeBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="card-floating max-w-lg w-full">
            <div className="text-center mb-8">
              <Smile className="w-12 h-12 text-accent mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-primary mb-4">
                Let's Get Started
              </h2>
              <p className="text-muted-foreground">
                Help us understand what brings you joy
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  What are some things that make you smile? ✨
                </label>
                <div className="flex flex-wrap justify-center items-center gap-3 p-4">
                  {interests.map((label) => {
                    const isSelected = selectedInterests.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleInterest(label)}
                        className={`px-4 py-2 rounded-full text-sm transition-all duration-200 border ${
                          isSelected
                            ? "bg-cyan-400 text-gray-900 border-cyan-300 shadow"
                            : "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
                        }`}
                        aria-pressed={isSelected}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FIX: Properly render onboarding Continue button without stray markup */}
              <button
                onClick={() => setCurrentView("chatbot")}
                className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-400 text-gray-900 font-semibold py-3 hover:bg-cyan-300 transition-colors duration-200"
                disabled={selectedInterests.length === 0}
                title={
                  selectedInterests.length === 0
                    ? "Select at least one interest"
                    : undefined
                }
              >
                Continue to Serene
              </button>
              {/* FIX: Close onboarding containers correctly to restore JSX structure */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderTopNavigation = () => (
    <nav className="fixed top-0 left-0 right-0 mx-4 mt-4 rounded-2xl z-20">
      <div className="flex justify-between items-center py-4 px-6">
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-primary animate-gentle-pulse" />
          <span className="font-bold text-primary text-lg">Serene</span>
        </div>

        <div className="flex items-center space-x-6">
          {[
            { view: "chatbot", icon: MessageCircle, label: "Chat" },
            { view: "journal", icon: BookOpen, label: "Journal" },
            { view: "profile", icon: User, label: "Profile" },
          ].map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => setCurrentView(view as any)}
              className={`flex items-center space-x-2 py-2 px-3 rounded-xl transition-all duration-300 ${
                currentView === view
                  ? "bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={currentView === view ? { color: activeAccentColor } : {}}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );


  if (currentView === "chatbot" || !["landing", "onboarding", "journal", "profile"].includes(currentView)) {
    return (
      <div className="min-h-screen relative">
        <ThreeBackground />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-6 pt-24">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <Heart className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-gentle-pulse" />
            <h1 className="text-3xl font-bold text-white mb-2">AI Support Chat</h1>
            <p className="text-gray-400">Your compassionate AI companion is here to help</p>
          </div>
          
          {/* Botpress Chat Widget Container */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
            <div 
              id="webchat" 
              style={{ 
                width: "100%", 
                height: "600px",
                position: "relative",
                zIndex: 10
              }}
            />
          </div>
          
          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Your conversations are private and secure. This AI is designed to provide support and guidance.
            </p>
          </div>
        </div>
        {renderTopNavigation()}
      </div>
    );
  }

  if (currentView === "journal") {
    return (
      <>
      <div className="min-h-screen relative">
        <ThreeBackground />
        <div className="relative z-10 pt-24 px-6">
          {/* FIX: New Journal header with title (left) and streak (right) */}
          <div className="max-w-6xl mx-auto flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-7 h-7 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Your Journal</h2>
              {streakCount > 0 && (
                <span className="ml-2 inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm">
                  <Flame className="w-4 h-4" />
                  <span>{streakCount} Day Streak</span>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setShowTrackModal(true);
                setTrackCreationStep(1);
                setPendingGoal("");
                setPendingDuration(null);
                setShowCustomGoalInput(false);
                setCustomGoalInput("");
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              <Play className="w-4 h-4" />
              <span>Start Guided Track</span>
            </button>
          </div>

          {/* Guided Track Creation Modal (Two-Step) */}
          {showTrackModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="card-floating max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-primary">{trackCreationStep === 1 ? "What do you want to work on?" : "How long do you want to practice?"}</h3>
                  <button onClick={() => setShowTrackModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {trackCreationStep === 1 ? (
                  <div className="space-y-3">
                    {guidedTracks.map((track) => (
                      <button
                        key={track.goal}
                        onClick={() => {
                          setPendingGoal(track.goal);
                          setTrackCreationStep(2);
                        }}
                        className="w-full p-4 text-left border border-border/50 rounded-xl hover:border-cyan-400 hover:scale-[1.01] transition-all duration-300"
                      >
                        <div className="flex items-center space-x-3">
                          <Target className="w-5 h-5 text-accent" />
                          <div>
                            <h4 className="font-medium text-foreground">{track.goal}</h4>
                            <p className="text-sm text-muted-foreground">Template</p>
                          </div>
                        </div>
                      </button>
                    ))}
                    {/* Custom Goal */}
                    {!showCustomGoalInput ? (
                      <button
                        onClick={() => setShowCustomGoalInput(true)}
                        className="w-full p-4 text-center border border-dashed border-border/50 rounded-xl text-sm text-muted-foreground hover:border-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        + Set a Custom Goal
                      </button>
                    ) : (
                      <div className="p-4 border border-border/50 rounded-xl space-y-3">
                        <input
                          value={customGoalInput}
                          onChange={(e) => setCustomGoalInput(e.target.value)}
                          placeholder="e.g., Be more assertive"
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowCustomGoalInput(false)}
                            className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={!customGoalInput.trim()}
                            onClick={() => {
                              setPendingGoal(customGoalInput.trim());
                              setTrackCreationStep(2);
                            }}
                            className="px-3 py-2 rounded-lg bg-cyan-400 text-gray-900 font-semibold hover:bg-cyan-300 text-sm disabled:opacity-50"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-muted-foreground mb-3">Select a duration for: <span className="text-foreground font-medium">{pendingGoal}</span></p>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[5, 7, 14].map((d) => (
                        <button
                          key={d}
                          onClick={() => setPendingDuration(d)}
                          className={`px-3 py-2 rounded-lg border ${pendingDuration === d ? "border-cyan-400 text-cyan-300" : "border-border/50 text-gray-300"} hover:border-cyan-400 transition-colors`}
                        >
                          {d} Days
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={!pendingGoal || !pendingDuration}
                      onClick={() => {
                        const duration = pendingDuration || 5;
                        const goal = pendingGoal;
                        // Simulate Gemini plan generation prompt
                        // "Act as a compassionate personal growth coach... goal and duration ... produce numbered list"
                        setTimeout(() => {
                          const tasks = Array.from({ length: duration }, (_v, i) => `Day ${i + 1}: ${goal} — A simple, 5-minute micro-task for step ${i + 1}.`);
                          setSelectedTrack({ goal, tasks });
                          setShowTrackModal(false);
                          setShowTrackDetail(true);
                        }, 700);
                      }}
                      className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-cyan-400 text-gray-900 font-semibold hover:bg-cyan-300 disabled:opacity-50"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Generate My Plan</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Track Detail Modal */}
          {showTrackDetail && selectedTrack && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="card-floating max-w-lg w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-primary">{selectedTrack.goal}</h3>
                  <button onClick={() => setShowTrackDetail(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-muted-foreground mb-4">This track includes {selectedTrack.tasks.length} daily micro-tasks. Review them and start when ready.</p>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {selectedTrack.tasks.map((t, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/70 border border-gray-700">
                      <input type="checkbox" className="mt-1" disabled />
                      <div>
                        <div className="text-gray-300 text-sm font-medium">Day {i + 1}</div>
                        <div className="text-gray-400 text-sm">{t}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => startGuidedTrack(selectedTrack.goal, selectedTrack.tasks)}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-400 text-gray-900 font-semibold hover:bg-cyan-300"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start This {selectedTrack.tasks.length}-Day Track</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Active Track Progress - Compact two-column */}
          {activeTrack && (
            <div className="max-w-6xl mx-auto mb-6">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-gray-200 font-medium">{activeTrack.goal}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-500"
                      style={{ width: `${(activeTrack.day - 1) / activeTrack.tasks.length * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end md:space-x-4">
                  <span className="text-sm text-gray-300">Day {activeTrack.day} of {activeTrack.tasks.length}</span>
                  <button
                    onClick={() => {
                      setIsFocusOpen(true);
                      setDailyPrompt(activeTrack.task);
                      setFocusTask(activeTrack.task);
                      setTaskCompleted(false);
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-400 text-gray-900 font-semibold hover:bg-cyan-300"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>View Task</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FIX: Masonry grid history view */}
          {journalEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-24">
              <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Welcome to Your Journal Journey</h3>
              <p className="text-muted-foreground mb-6">Start your first entry and begin building your streak!</p>
              <button
                onClick={() => setIsFocusOpen(true)}
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Write Your First Entry</span>
              </button>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="columns-1 md:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">{/* Masonry columns */}
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="mb-4 break-inside-avoid">
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:bg-gray-700 hover:border-cyan-400 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-cyan-400">{entry.date}</span>
                        <div className="flex space-x-2">
                          <button className="text-muted-foreground hover:text-foreground transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 italic mb-2">“{entry.prompt}”</p>
                      <p className="text-sm text-gray-200 whitespace-pre-line">{entry.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FIX: Floating Action Button to open Focus Mode */}
          <button
            onClick={() => setIsFocusOpen(true)}
            className="fixed bottom-6 right-6 z-40 rounded-full p-4 bg-cyan-400 hover:bg-cyan-300 text-gray-900 shadow-lg transition-all duration-300 ease-in-out hover:scale-105"
            aria-label="New Entry"
            title="New Entry"
          >
            <Plus className="w-6 h-6" />
          </button>

          {/* FIX: Full-screen Focus Mode modal for writing */}
          {isFocusOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative w-full h-full bg-gray-900/95"
              >
                <div className="max-w-3xl mx-auto h-full flex flex-col p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{getCurrentDate()}</span>
                    </div>
                    <button
                      onClick={() => setIsFocusOpen(false)}
                      className="p-2 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center space-x-2 text-gray-300 italic">
                        <Star className="w-4 h-4 text-cyan-400" />
                        <span>Today's Reflection</span>
                      </div>
                      <button
                        onClick={() => setDailyPrompt(generatePersonalizedPrompt())}
                        className="p-2 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
                        title="New prompt"
                        aria-label="Refresh prompt"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-400 mt-1">
                      {dailyPrompt}
                    </p>
                  </div>

                  {/* Focus Task with completion checkbox */}
                  {focusTask && (
                    <div className="mb-4 p-4 rounded-xl border border-gray-700 bg-gray-800/60">
                      <div className="flex items-start justify-between">
                        <div className="text-gray-200 text-sm mr-4">{focusTask}</div>
                        <button
                          onClick={() => {
                            if (taskCompleted) return;
                            setTaskCompleted(true);
                            // Advance to next day with a small delay to allow check animation
                            setTimeout(() => {
                              getNextTrackTask();
                              setFocusTask(null);
                            }, 400);
                          }}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${taskCompleted ? "bg-emerald-500/20 text-emerald-300" : "bg-gray-700 text-gray-300 hover:bg-gray-600"} transition-all`}
                        >
                          <CheckCircle className={`w-4 h-4 ${taskCompleted ? "scale-110" : ""} transition-transform`} />
                          <span className="text-sm font-medium">{taskCompleted ? "Completed" : "Mark as Complete"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex-1">
                    <textarea
                      value={journalEntry}
                      onChange={(e) => setJournalEntry(e.target.value)}
                      className="w-full h-full min-h-[50vh] p-4 rounded-2xl border border-gray-700 bg-gray-800/70 focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/50 transition-all duration-300 resize-none text-gray-100"
                      placeholder="Pour your heart out here..."
                    />
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => {
                        saveJournalEntry();
                        setIsFocusOpen(false);
                      }}
                      disabled={!journalEntry.trim()}
                      className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-cyan-400 text-gray-900 font-semibold hover:bg-cyan-300 disabled:opacity-50 transition-colors duration-300"
                    >
                      <Save className="w-5 h-5" />
                      <span>Save Journal</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Toast Notification */}
          {showToast && (
            <div className="fixed top-4 right-4 z-[60]">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500/90 text-white shadow-lg animate-in slide-in-from-top-2 fade-in duration-300">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Journal Saved!</span>
              </div>
            </div>
          )}
        </div>
        {renderTopNavigation()}
      </div>
      </>
    );
  }

  if (currentView === "profile") {
    return (
      <>
        <div className="min-h-screen relative bg-gray-900 text-gray-200">
          <ThreeBackground />
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 pt-24">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Your Wellness Dashboard</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono">{anonId}</span>
                </div>
                <button onClick={() => setCurrentView("settings")} className="p-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition" aria-label="Open Settings">
                  <Settings className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 md:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Your Mood Journey</h3>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                {/* Mood input */}
                <div className="mb-4">
                  <div className="text-sm text-gray-300 mb-2">How are you feeling today?</div>
                  <div className="flex items-center gap-2">
                    {moodEmojis.map((m, idx) => {
                      const isSelected = selectedMood === idx + 1;
                      return (
                        <button
                          key={m.mood}
                          onClick={() => {
                            setSelectedMood(idx + 1);
                            setMoodHistory((prev) => {
                              const next = [...prev];
                              next[0] = idx + 1; // today
                              return next;
                            });
                          }}
                          className={`text-2xl p-2 rounded-lg transition-transform duration-150 hover:scale-110 border ${isSelected ? "border-cyan-400 shadow-[0_0_0_2px_rgba(34,211,238,0.2)]" : "border-transparent"}`}
                          aria-label={m.label}
                          title={m.label}
                        >
                          {m.emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Heatmap */}
                <div className="grid grid-cols-7 gap-1">
                  {moodHistory.slice(0, 35).map((val, i) => {
                    const palette = ["bg-gray-700","bg-teal-800","bg-teal-700","bg-teal-600","bg-teal-500"];
                    const intensity = palette[Math.min(Math.max(val - 1, 0), palette.length - 1)];
                    return <div key={i} className={`h-6 rounded-sm ${intensity}`}></div>;
                  })}
                </div>
                {/* Legend */}
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                  <span>Less Positive</span>
                  <div className="flex items-center gap-1">
                    {["bg-gray-700","bg-teal-800","bg-teal-700","bg-teal-600","bg-teal-500"].map((c) => (
                      <span key={c} className={`w-4 h-3 rounded-sm ${c}`}></span>
                    ))}
                  </div>
                  <span>More Positive</span>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-gray-900/70 border border-gray-700 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-300 mt-0.5" />
                  <p className="text-sm text-gray-300">AI Insight: You've consistently logged positive moods on weekends. Keep embracing what brings you joy!</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Journaling Snapshot</h3>
                  <BookOpen className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4 justify-center justify-items-center">
                  <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-700 text-center">
                    <div className="text-2xl">🔥</div>
                    <div className="text-sm text-gray-400">Current Streak</div>
                    <div className="text-2xl font-bold text-white">7 Days</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-700 text-center">
                    <div className="text-2xl">✍️</div>
                    <div className="text-sm text-gray-400">Total Entries</div>
                    <div className="text-2xl font-bold text-white">32</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-700 text-center">
                    <div className="text-2xl">🏆</div>
                    <div className="text-sm text-gray-400">Longest Streak</div>
                    <div className="text-2xl font-bold text-white">15 Days</div>
                  </div>
                </div>
                {/* Word Cloud removed as requested */}
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Your Growth Journey</h3>
                  <Target className="w-5 h-5 text-gray-400" />
                </div>
                {activeTrack ? (
                  <div>
                    <div className="text-sm text-gray-300 mb-2">Active Track</div>
                    <div className="font-semibold text-white mb-1">{activeTrack.goal}</div>
                    <div className="w-full h-2 rounded bg-gray-700 overflow-hidden">
                      <div className="h-2 bg-cyan-400" style={{ width: `${(activeTrack.day / activeTrack.tasks.length) * 100}%` }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Day {activeTrack.day} of {activeTrack.tasks.length}</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-gray-300 mb-2">Active Track</div>
                    <div className="font-semibold text-white mb-1">Improve Public Speaking</div>
                    <div className="w-full h-2 rounded bg-gray-700 overflow-hidden">
                      <div className="h-2 bg-cyan-400" style={{ width: "40%" }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Approximately 40% complete</div>
                  </div>
                )}
                <div className="mt-4">
                  <div className="text-sm text-gray-300 mb-2">Trophy Case</div>
                  <ul className="space-y-2">
                    {completedTracks.length === 0 && (
                      <li className="flex items-center gap-2 text-sm text-gray-200"><Trophy className="w-4 h-4 text-amber-400" /> Practice Mindfulness</li>
                    )}
                    {completedTracks.map((g) => (
                      <li key={g} className="flex items-center gap-2 text-sm text-gray-200"><Trophy className="w-4 h-4 text-amber-400" /> {g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Your Toolkit</h3>
                  <Square className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setIsBreathingOpen(true)} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-900/60 border border-gray-700 hover:bg-gray-700/50 transition">
                    <Wind className="w-6 h-6 text-cyan-300" />
                    <span className="text-sm text-gray-200 text-center">Breathing Exercises</span>
                  </button>
                  <button onClick={() => setCurrentView("helplines")} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-900/60 border border-gray-700 hover:bg-gray-700/50 transition">
                    <Phone className="w-6 h-6 text-emerald-300" />
                    <span className="text-sm text-gray-200 text-center">Helplines Directory</span>
                  </button>
                  <button onClick={() => setCurrentView("ai")} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-900/60 border border-gray-700 hover:bg-gray-700/50 transition">
                    <Sparkles className="w-6 h-6 text-violet-300" />
                    <span className="text-sm text-gray-200 text-center">AI First Steps</span>
                  </button>
                </div>
              </div>
            </div>

            {isBreathingOpen && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="relative w-full max-w-xl bg-gray-900 border border-gray-700 rounded-2xl p-8">
                  <button onClick={() => setIsBreathingOpen(false)} className="absolute top-3 right-3 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700" aria-label="Close">
                    <X className="w-5 h-5 text-gray-300" />
                  </button>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-white mb-1">Guided Breathing</h3>
                    <p className="text-sm text-gray-400">Breathe in for 4, hold for 4, breathe out for 6</p>
                  </div>
                  <div className="flex items-center justify-center py-8">
                    <div className="w-48 h-48 rounded-full bg-cyan-500/20 border-2 border-cyan-400 animate-pulse"></div>
                  </div>
                  <div className="text-center text-gray-300">Follow the circle as it gently expands and contracts</div>
                </div>
              </div>
            )}
          </div>
          {renderTopNavigation()}
        </div>
      </>
    )

  if (currentView === "helplines") {
    return (
      <div className="min-h-screen relative bg-gray-900 text-gray-200">
        <ThreeBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 pt-24">
          <div className="text-center mb-8">
            <Phone className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Crisis Support & Helplines</h2>
            <p className="text-lg text-gray-400">Professional help is available 24/7</p>
          </div>
          
          <div className="grid gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">National Helplines (India)</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/60 border border-gray-700">
                  <div>
                    <h4 className="font-medium text-white">KIRAN Mental Health Helpline</h4>
                    <p className="text-sm text-gray-400">24/7 Mental Health Support</p>
                  </div>
                  <a href="tel:1800-599-0019" className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Call Now
                  </a>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/60 border border-gray-700">
                  <div>
                    <h4 className="font-medium text-white">Vandrevala Foundation</h4>
                    <p className="text-sm text-gray-400">Crisis Support & Counseling</p>
                  </div>
                  <a href="tel:1860-2662-345" className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Call Now
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Emergency Contacts</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-red-900/20 border border-red-700">
                  <h4 className="font-medium text-red-300 mb-2">Police</h4>
                  <p className="text-2xl font-bold text-white">100</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-700">
                  <h4 className="font-medium text-blue-300 mb-2">Ambulance</h4>
                  <p className="text-2xl font-bold text-white">108</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderTopNavigation()}
      </div>
    );
  }

  if (currentView === "ai") {
    return (
      <div className="min-h-screen relative bg-gray-900 text-gray-200">
        <ThreeBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 pt-24">
          <div className="text-center mb-8">
            <Sparkles className="w-16 h-16 text-violet-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">AI-Powered First Steps</h2>
            <p className="text-lg text-gray-400">Let AI guide you through your wellness journey</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Assessment</h3>
              <p className="text-gray-400 mb-4">Get personalized recommendations based on your current state</p>
              <button 
                onClick={() => setCurrentView("chatbot")}
                className="w-full px-4 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                Start Assessment
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Guided Exercises</h3>
              <p className="text-gray-400 mb-4">Try AI-recommended mindfulness and breathing exercises</p>
              <button 
                onClick={() => setIsBreathingOpen(true)}
                className="w-full px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Try Breathing Exercise
              </button>
            </div>
          </div>
        </div>
        {renderTopNavigation()}
      </div>
    );
  }

  return null;
  }
}

export default SereneApp;
