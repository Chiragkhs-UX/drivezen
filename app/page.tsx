"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  ShieldCheck,
  Zap,
  Flame,
  Leaf,
  Clock,
  MapPin,
  Award,
  MessageSquare,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  Smile,
  Meh,
  Frown,
  Activity,
  BarChart3,
  Layers,
} from "lucide-react";

// ==========================================
// TYPES & DATA MODELS
// ==========================================

type DriverPersonality =
  | "patient"
  | "normal"
  | "aggressive"
  | "taxi"
  | "commuter";

type PreDriveMood = "relaxed" | "fine" | "tired" | "angry";

interface TelemetryPoint {
  timestamp: string;
  speed: number;
  acceleration: number;
  harshBrake: boolean;
  harshAccel: boolean;
  tailgating: boolean;
  laneChanges: number;
  trafficDensity: "low" | "medium" | "heavy";
  eventDescription?: string;
  patienceDelta?: number;
}

interface DrivingTrip {
  id: string;
  date: string;
  driverType: DriverPersonality;
  preMood: PreDriveMood;
  postMood?: PreDriveMood;
  patienceScore: number;
  category: "Zen Master" | "Calm Driver" | "Balanced" | "Impatient" | "Aggressive";
  distanceKm: number;
  durationMin: number;
  fuelSavedINR: number;
  co2SavedKg: number;
  aggressiveEventsCount: number;
  timeSavedSec: number;
  laneChangesCount: number;
  stressIndex: number;
  smoothnessRating: number;
  telemetry: TelemetryPoint[];
  aiInsight: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  progress: number;
  completed: boolean;
  icon: string;
}

interface Badge {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

// ==========================================
// CONSTANTS & DETERMINISTIC MOCK DATA
// ==========================================

const DRIVER_PROFILES: Record<
  DriverPersonality,
  { name: string; desc: string; baseScore: number; color: string }
> = {
  patient: { name: "Zen Monk", desc: "Predictable, wide gaps, zero rush", baseScore: 96, color: "#10b981" },
  normal: { name: "Balanced Commuter", desc: "Flows with traffic, occasional rush", baseScore: 84, color: "#3b82f6" },
  aggressive: { name: "Aggressive Weaver", desc: "Frequent tailgating, sudden acceleration", baseScore: 48, color: "#ef4444" },
  taxi: { name: "Urban Taxi", desc: "High lane weaving, quick stops", baseScore: 62, color: "#f59e0b" },
  commuter: { name: "Late Office Worker", desc: "High urgency, frequent horn/accel", baseScore: 55, color: "#8b5cf6" },
};

const INITIAL_TRIPS: DrivingTrip[] = [
  {
    id: "trip-1",
    date: "2026-08-05 08:30",
    driverType: "normal",
    preMood: "fine",
    postMood: "relaxed",
    patienceScore: 88,
    category: "Calm Driver",
    distanceKm: 18.4,
    durationMin: 34,
    fuelSavedINR: 42,
    co2SavedKg: 0.8,
    aggressiveEventsCount: 3,
    timeSavedSec: 28,
    laneChangesCount: 7,
    stressIndex: 22,
    smoothnessRating: 89,
    aiInsight:
      "You accelerated aggressively 3 times on Western Express Highway. Despite that, you only arrived 28 seconds earlier while increasing stress by 35%. Driving smoothly saved ~₹42 in fuel.",
    telemetry: [
      { timestamp: "08:15", speed: 40, acceleration: 0.2, harshBrake: false, harshAccel: false, tailgating: false, laneChanges: 0, trafficDensity: "medium" },
      { timestamp: "08:16", speed: 45, acceleration: 0.5, harshBrake: false, harshAccel: false, tailgating: false, laneChanges: 0, trafficDensity: "medium" },
      { timestamp: "08:17", speed: 52, acceleration: 0.8, harshBrake: false, harshAccel: false, tailgating: false, laneChanges: 0, trafficDensity: "medium" },
      { timestamp: "08:18", speed: 35, acceleration: -1.2, harshBrake: false, harshAccel: false, tailgating: false, laneChanges: 0, trafficDensity: "medium" },
      { timestamp: "08:19", speed: 28, acceleration: -0.8, harshBrake: false, harshAccel: false, tailgating: false, laneChanges: 1, trafficDensity: "medium" },
      { timestamp: "08:20", speed: 18, acceleration: -1.5, harshBrake: false, harshAccel: false, tailgating: false, laneChanges: 0, trafficDensity: "heavy" },
      { timestamp: "08:21", speed: 12, acceleration: -3.8, harshBrake: true, harshAccel: false, tailgating: false, laneChanges: 0, trafficDensity: "heavy", eventDescription: "Sudden braking due to cut-off" },
      { timestamp: "08:22", speed: 25, acceleration: 1.1, harshBrake: false, harshAccel: false, tailgating: false, laneChanges: 0, trafficDensity: "heavy" },
      { timestamp: "08:23", speed: 32, acceleration: 0.9, harshBrake: false, harshAccel: false, tailgating: false, laneChanges: 0, trafficDensity: "heavy" },
      { timestamp: "08:24", speed: 48, acceleration: 1.4, harshBrake: false, harshAccel: false, tailgating: false, laneChanges: 0, trafficDensity: "medium" },
      { timestamp: "08:25", speed: 65, acceleration: 3.2, harshBrake: false, harshAccel: true, tailgating: false, laneChanges: 0, trafficDensity: "medium", eventDescription: "Hard acceleration overtaking slow car" },
      { timestamp: "08:26", speed: 58, acceleration: -0.4, harshBrake: false, harshAccel: false, tailgating: false, laneChanges: 1, trafficDensity: "medium" },
      { timestamp: "08:27", speed: 50, acceleration: -0.2, harshBrake: false, harshAccel: false, tailgating: false, laneChanges: 0, trafficDensity: "medium" },
      { timestamp: "08:28", speed: 44, acceleration: -0.5, harshBrake: false, harshAccel: false, tailgating: false, laneChanges: 0, trafficDensity: "medium" },
      { timestamp: "08:29", speed: 38, acceleration: -0.1, harshBrake: false, harshAccel: false, tailgating: false, laneChanges: 0, trafficDensity: "medium" }
    ],
  },
];

const INITIAL_CHALLENGES: Challenge[] = [
  { id: "c1", title: "Zen Master Streak", description: "Keep patience score above 90 for 3 consecutive trips", rewardXp: 350, progress: 66, completed: false, icon: "🧘" },
  { id: "c2", title: "Smooth Pedal", description: "Zero harsh acceleration events in a single 10+ km trip", rewardXp: 200, progress: 100, completed: true, icon: "🍃" },
  { id: "c3", title: "Lane Anchor", description: "Complete a highway drive with under 3 lane changes", rewardXp: 250, progress: 30, completed: false, icon: "⚓" },
];

const INITIAL_BADGES: Badge[] = [
  { id: "b1", title: "7-Day Calm Streak", description: "Drove with a 85+ score every day for a week", unlocked: true, icon: "🔥" },
  { id: "b2", title: "1000 km Smoothness", description: "Accumulated 1,000 km of smooth driving", unlocked: true, icon: "🌐" },
  { id: "b3", title: "Zero Hard Brakes", description: "Completed 5 full trips with zero hard braking", unlocked: false, icon: "🛡️" },
  { id: "b4", title: "Fuel Saver Master", description: "Saved over ₹1,500 in fuel via zen driving", unlocked: true, icon: "⛽" },
];

function calculateScoreCategory(score: number): DrivingTrip["category"] {
  if (score >= 95) return "Zen Master";
  if (score >= 85) return "Calm Driver";
  if (score >= 70) return "Balanced";
  if (score >= 50) return "Impatient";
  return "Aggressive";
}

function generateDynamicTrip(
  personality: DriverPersonality,
  preMood: PreDriveMood
): DrivingTrip {
  const profile = DRIVER_PROFILES[personality];
  const noise = Math.floor((Math.random() - 0.5) * 12);
  const score = Math.max(25, Math.min(100, profile.baseScore + noise));
  const category = calculateScoreCategory(score);

  const harshBrakes = Math.max(0, Math.floor((100 - score) / 8 + (Math.random() - 0.5) * 2));
  const harshAccels = Math.max(0, Math.floor((100 - score) / 7 + (Math.random() - 0.5) * 2));
  const laneChanges = Math.floor((100 - score) / 4 + Math.random() * 3);
  const timeSavedSec = Math.floor(laneChanges * 2.2 + harshAccels * 1.5);
  const fuelSavedINR = Math.floor((score - 60) * 1.4);
  const stressIndex = Math.max(10, Math.min(95, 100 - score + Math.floor(Math.random() * 15)));

  const telemetry: TelemetryPoint[] = Array.from({ length: 12 }, (_, i) => {
    const isBrake = i === 3 && harshBrakes > 0;
    const isAccel = i === 7 && harshAccels > 0;
    return {
      timestamp: `10:${i * 3 < 10 ? "0" + i * 3 : i * 3}`,
      speed: Math.max(10, Math.min(90, 45 + Math.sin(i) * 20 + (score < 60 ? 15 : 0))),
      acceleration: isAccel ? 3.8 : isBrake ? -4.2 : (Math.random() - 0.5) * 1.5,
      harshBrake: isBrake,
      harshAccel: isAccel,
      tailgating: score < 60 && i % 3 === 0,
      laneChanges: i % 4 === 0 ? 1 : 0,
      trafficDensity: i > 4 && i < 8 ? "heavy" : "medium",
      eventDescription: isBrake
        ? "Hard braking: vehicle ahead stopped unexpectedly"
        : isAccel
        ? "Sudden throttle: overtaking slow vehicle"
        : undefined,
    };
  });

  const aiInsight =
    score > 85
      ? `Exceptional mindfulness! You maintained steady gaps and avoided aggressive spurts. You saved ~₹${fuelSavedINR} in fuel and kept stress low.`
      : `You made ${laneChanges} lane changes and ${harshAccels + harshBrakes} sudden speed bursts. Total time gained: only ${timeSavedSec}s. Smooth driving could save ₹${Math.abs(fuelSavedINR)} per trip.`;

  return {
    id: `trip-${Date.now()}`,
    date: new Date().toISOString().replace("T", " ").substring(0, 16),
    driverType: personality,
    preMood,
    postMood: score > 75 ? "relaxed" : "tired",
    patienceScore: score,
    category,
    distanceKm: parseFloat((12 + Math.random() * 15).toFixed(1)),
    durationMin: Math.floor(20 + Math.random() * 25),
    fuelSavedINR,
    co2SavedKg: parseFloat((fuelSavedINR * 0.02).toFixed(2)),
    aggressiveEventsCount: harshBrakes + harshAccels,
    timeSavedSec,
    laneChangesCount: laneChanges,
    stressIndex,
    smoothnessRating: Math.min(100, Math.max(30, score + 4)),
    telemetry,
    aiInsight,
  };
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function DriveZenApp() {
  const [mounted, setMounted] = useState(false);
  const [trips, setTrips] = useState<DrivingTrip[]>(INITIAL_TRIPS);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "replay" | "analytics" | "challenges" | "coach" | "routes" | "didItMatter"
  >("dashboard");
  const [currentTrip, setCurrentTrip] = useState<DrivingTrip>(INITIAL_TRIPS[0]);
  const [selectedPersonality, setSelectedPersonality] = useState<DriverPersonality>("normal");
  const [selectedMood, setSelectedMood] = useState<PreDriveMood>("relaxed");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState(10);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "ai"; text: string; timestamp: string }[]
  >([
    {
      sender: "ai",
      text: "Hello! I am ZenCoach. Ask me anything about your recent drives, fuel savings, or how to boost your Patience Score.",
      timestamp: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Level & XP State
  const [userXp, setUserXp] = useState(2450);
  const userLevel = useMemo(() => Math.floor(userXp / 200) + 1, [userXp]);

  // Prevent Hydration Mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Emergency Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emergencyActive && emergencyCountdown > 0) {
      timer = setInterval(() => {
        setEmergencyCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emergencyActive, emergencyCountdown]);

  if (!mounted) return null;

  // Simulation Trigger
  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimProgress(0);

    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          const newTrip = generateDynamicTrip(selectedPersonality, selectedMood);
          setTrips((existing) => [newTrip, ...existing]);
          setCurrentTrip(newTrip);
          setUserXp((xp) => xp + 120);
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  // AI Chat Message Sender
  const handleSendChatMessage = (queryText?: string) => {
    const textToSend = queryText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = { sender: "user" as const, text: textToSend, timestamp: "Just now" };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!queryText) setChatInput("");

    setTimeout(() => {
      let aiText = "Analyzing your driving telemetry data...";
      const lower = textToSend.toLowerCase();

      if (lower.includes("low") || lower.includes("score")) {
        aiText = `Your last score was ${currentTrip.patienceScore}/100. The primary culprit was ${currentTrip.aggressiveEventsCount} harsh braking/acceleration events and high lane-weaving during traffic congestion.`;
      } else if (lower.includes("fuel")) {
        aiText = `Driving with smooth throttle input saves an estimated ₹${Math.abs(
          currentTrip.fuelSavedINR * 4
        )} per week. Reducing harsh accelerations yields an immediate 12% drop in fuel consumption.`;
      } else if (lower.includes("stress")) {
        aiText = `Your stress index spikes to ${currentTrip.stressIndex}% during tailgating. Maintaining a 3-second gap reduces cortisol levels and yields a smoother ride.`;
      } else {
        aiText = `Based on your recent trip on ${currentTrip.date}, staying in your lane saves you energy without losing significant time. Try maintaining a 90+ Zen Master score on your next commute!`;
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: "ai", text: aiText, timestamp: "Just now" },
      ]);
    }, 600);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans text-slate-100 bg-slate-950">
      {/* ================= HEADER / TOP BAR ================= */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/60 px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                DriveZen
              </h1>
              <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                PWA Active
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI Driver Patience & Calmness Companion
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center space-x-3">
          {/* Level Badge */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
            <Award className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-medium text-slate-300">
              Lvl <span className="font-bold text-white">{userLevel}</span>
            </span>
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400"
                style={{ width: `${(userXp % 200) / 2}%` }}
              />
            </div>
          </div>

          {/* Voice Coach Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-full border transition-all ${
              voiceEnabled
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
            title="Toggle Voice Coach Alerts"
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Emergency SOS Trigger */}
          <button
            onClick={() => {
              setEmergencyActive(true);
              setEmergencyCountdown(10);
            }}
            className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-all flex items-center space-x-1"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Emergency SOS</span>
          </button>
        </div>
      </header>

      {/* ================= EMERGENCY MODAL ================= */}
      <AnimatePresence>
        {emergencyActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Hard Impact Detected</h2>
              <p className="text-sm text-slate-300 mb-6">
                Are you okay? Automatically notifying your emergency contacts in:
              </p>
              <div className="text-6xl font-black text-rose-500 my-4 tracking-tight">
                {emergencyCountdown}s
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEmergencyActive(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-all border border-slate-700"
                >
                  I'm Safe (Cancel)
                </button>
                <button
                  onClick={() => alert("Emergency contacts and GPS dispatch notified.")}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-rose-600/30"
                >
                  Call Help Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MAIN CONTAINER ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 pb-28">
        {/* SIMULATOR CONTROLLER BAR */}
        <section className="mb-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 backdrop-blur-md shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  AI Driving Simulator & Personality Telemetry
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Select driver profile & mood to test the AI Patience Engine offline
              </p>
            </div>

            {/* Simulation Trigger Button */}
            <button
              onClick={handleStartSimulation}
              disabled={isSimulating}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  <span>Analyzing Drive ({simProgress}%)...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Simulate Real-time Drive</span>
                </>
              )}
            </button>
          </div>

          {/* Personality Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-800/80">
            {(Object.keys(DRIVER_PROFILES) as DriverPersonality[]).map((key) => {
              const prof = DRIVER_PROFILES[key];
              const isSelected = selectedPersonality === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPersonality(key)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-slate-800 border-emerald-500/50 shadow-md shadow-emerald-500/5"
                      : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{prof.name}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: prof.color }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{prof.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Pre-drive Mood Selection */}
          <div className="mt-4 flex items-center space-x-3 pt-3 border-t border-slate-800/50">
            <span className="text-xs text-slate-400 font-medium">Pre-Drive Mood:</span>
            <div className="flex space-x-2">
              {[
                { id: "relaxed", label: "Relaxed", icon: Smile },
                { id: "fine", label: "Fine", icon: Meh },
                { id: "tired", label: "Tired", icon: Activity },
                { id: "angry", label: "Angry", icon: Frown },
              ].map((mood) => {
                const Icon = mood.icon;
                const active = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id as PreDriveMood)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center space-x-1.5 border transition-all ${
                      active
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= TAB NAVIGATION ================= */}
        <nav className="flex space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {[
            { id: "dashboard", label: "Dashboard", icon: Activity },
            { id: "replay", label: "Trip Replay", icon: Compass },
            { id: "didItMatter", label: "Did It Matter?", icon: Zap },
            { id: "analytics", label: "Weekly Analytics", icon: BarChart3 },
            { id: "challenges", label: "Challenges & XP", icon: Award },
            { id: "coach", label: "AI Coach", icon: MessageSquare },
            { id: "routes", label: "Zen Routes", icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap flex items-center space-x-2 border transition-all ${
                  active
                    ? "bg-slate-800 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10"
                    : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* HERO SCORE SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Patience Gauge Card */}
              <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
                
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
                  Patience Score
                </span>

                {/* Circular Score Visualizer */}
                <div className="relative w-56 h-56 flex items-center justify-center my-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="112"
                      cy="112"
                      r="96"
                      stroke="currentColor"
                      strokeWidth="14"
                      className="text-slate-800/60"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="112"
                      cy="112"
                      r="96"
                      stroke="url(#scoreGradient)"
                      strokeWidth="14"
                      strokeDasharray={2 * Math.PI * 96}
                      strokeDashoffset={
                        2 * Math.PI * 96 * (1 - currentTrip.patienceScore / 100)
                      }
                      strokeLinecap="round"
                      fill="transparent"
                      initial={{ strokeDashoffset: 2 * Math.PI * 96 }}
                      animate={{
                        strokeDashoffset:
                          2 * Math.PI * 96 * (1 - currentTrip.patienceScore / 100),
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="absolute flex flex-col items-center justify-center">
                    <motion.span
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="text-6xl font-black tracking-tight text-white"
                    >
                      {currentTrip.patienceScore}
                    </motion.span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                      {currentTrip.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 max-w-xs mt-4">
                  Adjusted for traffic density, smooth deceleration, and lane stability.
                </p>
              </div>

              {/* Trip Key Stats Grid */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Distance", val: `${currentTrip.distanceKm} km`, icon: MapPin, color: "text-sky-400" },
                  { label: "Fuel Saved", val: `₹${currentTrip.fuelSavedINR}`, icon: Leaf, color: "text-emerald-400" },
                  { label: "CO₂ Reduced", val: `${currentTrip.co2SavedKg} kg`, icon: Flame, color: "text-teal-400" },
                  { label: "Stress Level", val: `${currentTrip.stressIndex}%`, icon: Activity, color: "text-amber-400" },
                  { label: "Aggressive Events", val: currentTrip.aggressiveEventsCount, icon: AlertTriangle, color: "text-rose-400" },
                  { label: "Smoothness", val: `${currentTrip.smoothnessRating}/100`, icon: ShieldCheck, color: "text-indigo-400" },
                  { label: "Drive Duration", val: `${currentTrip.durationMin} m`, icon: Clock, color: "text-purple-400" },
                  { label: "Lane Changes", val: currentTrip.laneChangesCount, icon: Layers, color: "text-cyan-400" },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <span className="text-2xl font-bold text-white tracking-tight">{stat.val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI INSIGHT CARD */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 shrink-0">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    AI Behavioral Reflection
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentTrip.aiInsight}</p>
                </div>
              </div>
            </div>

            {/* TRIP TIMELINE */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                <span>Drive Event Timeline</span>
              </h3>

              <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-800">
                {currentTrip.telemetry.map((pt, idx) => (
                  <div key={idx} className="relative flex items-start space-x-4 pl-8">
                    <div
                      className={`absolute left-2.5 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full border-2 ${
                        pt.harshBrake || pt.harshAccel
                          ? "bg-rose-500 border-rose-300"
                          : "bg-emerald-500 border-emerald-300"
                      }`}
                    />
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-slate-400">{pt.timestamp}</span>
                          <span className="text-xs font-semibold text-white">{pt.speed.toFixed(0)} km/h</span>
                          {pt.trafficDensity === "heavy" && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                              Heavy Traffic
                            </span>
                          )}
                        </div>
                        {pt.eventDescription ? (
                          <p className="text-xs text-rose-300 mt-1 font-medium">⚠️ {pt.eventDescription}</p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-1">Smooth speed maintenance.</p>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        Accel: <span className="text-slate-200 font-mono">{pt.acceleration.toFixed(1)} m/s²</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= TAB 2: TRIP REPLAY ================= */}
        {activeTab === "replay" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Compass className="h-5 w-5 text-emerald-400" />
                    <span>Interactive Journey Playback</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Replay drive trajectory and inspect speed & aggression spikes
                  </p>
                </div>
                <div className="text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  Trip Date: <span className="font-bold text-emerald-400">{currentTrip.date}</span>
                </div>
              </div>

              {/* Map Mock */}
              <div className="w-full h-72 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                <svg className="w-full h-full absolute inset-0">
                  <path
                    d="M 50 200 Q 150 50, 300 180 T 600 100 T 900 220"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeDasharray="8 4"
                  />
                  <circle cx="300" cy="180" r="8" fill="#ef4444" className="animate-ping" />
                  <circle cx="300" cy="180" r="6" fill="#ef4444" />
                </svg>
                <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-4 py-2 rounded-xl text-xs space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>Zen Cruise Zone</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Hard Brake Event (300m mark)</span>
                  </div>
                </div>
              </div>

              {/* Speed Chart */}
              <div className="mt-6">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Speed (km/h) Profile
                </h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentTrip.telemetry}>
                      <defs>
                        <linearGradient id="speedG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="speed"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#speedG)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= TAB 3: DID IT MATTER? ================= */}
        {activeTab === "didItMatter" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">"Did The Aggression Matter?"</h2>
              <p className="text-sm text-slate-400 mb-8">
                Reality check on time saved vs. stress incurred during your latest drive.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Lane Changes</span>
                  <span className="text-2xl font-extrabold text-white">{currentTrip.laneChangesCount}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Time Gained</span>
                  <span className="text-2xl font-extrabold text-emerald-400">{currentTrip.timeSavedSec}s</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Fuel Wasted</span>
                  <span className="text-2xl font-extrabold text-rose-400">₹{Math.abs(currentTrip.fuelSavedINR)}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Stress Multiplier</span>
                  <span className="text-2xl font-extrabold text-amber-400">+{currentTrip.stressIndex}%</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 mb-6">
                <h4 className="text-lg font-black uppercase tracking-wider mb-1">Conclusion: It wasn't worth it.</h4>
                <p className="text-xs leading-relaxed opacity-90">
                  By weaving through traffic, you gained less than 1 minute, but burned extra fuel and significantly elevated heart rate and crash risk.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("dashboard")}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= TAB 4: WEEKLY ANALYTICS ================= */}
        {activeTab === "analytics" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">7-Day Patience Score Trend</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { day: "Mon", score: 82 },
                        { day: "Tue", score: 88 },
                        { day: "Wed", score: 74 },
                        { day: "Thu", score: 92 },
                        { day: "Fri", score: 68 },
                        { day: "Sat", score: 95 },
                        { day: "Sun", score: 91 },
                      ]}
                    >
                      <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "12px",
                        }}
                      />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {[82, 88, 74, 92, 68, 95, 91].map((val, idx) => (
                          <Cell
                            key={idx}
                            fill={val > 85 ? "#10b981" : val > 70 ? "#3b82f6" : "#f59e0b"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Driver Balance Radar</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={[
                        { subject: "Smooth Accel", A: 85 },
                        { subject: "Gapping", A: 90 },
                        { subject: "Braking", A: 78 },
                        { subject: "Lane Stability", A: 88 },
                        { subject: "Calmness", A: 92 },
                      ]}
                    >
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                      <PolarRadiusAxis stroke="#475569" />
                      <Radar
                        name="Driver"
                        dataKey="A"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= TAB 5: CHALLENGES & XP ================= */}
        {activeTab === "challenges" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-2xl">
                  {userLevel}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Calm Explorer</h3>
                  <p className="text-xs text-slate-400">Total Experience Points: {userXp} XP</p>
                </div>
              </div>
              <div className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
                +120 XP earned per Zen Drive
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INITIAL_CHALLENGES.map((ch) => (
                <div
                  key={ch.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{ch.icon}</span>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        +{ch.rewardXp} XP
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{ch.title}</h4>
                    <p className="text-xs text-slate-400 mb-4">{ch.description}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{ch.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        style={{ width: `${ch.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Earned Zen Badges</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {INITIAL_BADGES.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      badge.unlocked
                        ? "bg-slate-950 border-emerald-500/30"
                        : "bg-slate-950/40 border-slate-800/60 opacity-40"
                    }`}
                  >
                    <span className="text-3xl block mb-2">{badge.icon}</span>
                    <h5 className="text-xs font-bold text-slate-200">{badge.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-1">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= TAB 6: AI COACH ================= */}
        {activeTab === "coach" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-[520px]">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">ZenCoach Natural Intelligence</h3>
                  <p className="text-xs text-slate-400">Ask questions regarding your driving behavior</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-none">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-emerald-500 text-slate-950 font-medium rounded-br-none"
                          : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2 overflow-x-auto py-2 scrollbar-none">
                {[
                  "Why is my patience score low?",
                  "Did I save fuel today?",
                  "What caused my stress peak?",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChatMessage(prompt)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 whitespace-nowrap transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                  placeholder="Ask ZenCoach..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={() => handleSendChatMessage()}
                  className="px-4 py-2.5 bg-emerald-500 text-slate-950 rounded-2xl font-bold text-xs hover:bg-emerald-400 transition-all"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= TAB 7: ZEN ROUTES ================= */}
        {activeTab === "routes" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-2">Smart Route Optimizer</h3>
              <p className="text-xs text-slate-400 mb-6">
                Routes selected not just for speed, but for emotional calmness and low stress.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Fastest Route",
                    tag: "High Traffic Volatility",
                    time: "28 min",
                    stress: "High (74%)",
                    fuel: "₹140",
                    badgeColor: "text-rose-400 border-rose-500/20 bg-rose-500/10",
                  },
                  {
                    title: "Balanced Flow",
                    tag: "Moderate Signals",
                    time: "31 min",
                    stress: "Medium (42%)",
                    fuel: "₹115",
                    badgeColor: "text-amber-400 border-amber-500/20 bg-amber-500/10",
                  },
                  {
                    title: "Calm Zen Route",
                    tag: "Recommended for Calmness",
                    time: "33 min",
                    stress: "Lowest (14%)",
                    fuel: "₹92",
                    badgeColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
                  },
                ].map((rt, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all"
                  >
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${rt.badgeColor} uppercase tracking-wider block w-max mb-3`}
                      >
                        {rt.tag}
                      </span>
                      <h4 className="text-sm font-bold text-white mb-2">{rt.title}</h4>
                      <div className="space-y-1.5 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span>ETA:</span>
                          <span className="font-semibold text-slate-200">{rt.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Est. Stress:</span>
                          <span className="font-semibold text-slate-200">{rt.stress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fuel Cost:</span>
                          <span className="font-semibold text-slate-200">{rt.fuel}</span>
                        </div>
                      </div>
                    </div>

                    <button className="mt-5 w-full py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 rounded-xl border border-slate-800 transition-all">
                      Select Route
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <footer className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2 sm:hidden">
        <div className="flex items-center justify-around">
          {[
            { id: "dashboard", label: "Home", icon: Activity },
            { id: "replay", label: "Replay", icon: Compass },
            { id: "didItMatter", label: "Verdict", icon: Zap },
            { id: "analytics", label: "Stats", icon: BarChart3 },
            { id: "coach", label: "Coach", icon: MessageSquare },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                  active ? "text-emerald-400" : "text-slate-500"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
