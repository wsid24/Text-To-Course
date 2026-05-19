/**
 * Stress test for the multi-stage GenAI pipeline.
 *
 * Generates N courses and N lessons against the live LLM provider chain
 * (Groq → Gemini → mock) and reports two separate integrity numbers:
 *
 *   raw_pass_rate      — % of LLM outputs that pass Zod on the first
 *                        try, with no repair. Tests prompt + schema
 *                        adherence of the model.
 *
 *   pipeline_pass_rate — % that pass after ValidatorAgent.repair() runs.
 *                        This is the number that backs the resume's
 *                        "99%+ JSON data integrity" claim, because it
 *                        reflects what actually reaches the DB.
 *
 * Cache is bypassed by appending a unique nonce to every topic, so we
 * exercise the real pipeline on every call.
 *
 * Run:
 *   node tests/stress.js              # default 50 courses + 50 lessons
 *   N=20 node tests/stress.js         # 20 each
 */
require("dotenv").config();

// Force the chain to real providers only for measurement — mock would
// always succeed and silently inflate the integrity numbers. Set BEFORE
// requiring LLMRouter (singleton reads env on first init).
if (!process.env.STRESS_KEEP_MOCK) {
  process.env.LLM_PROVIDERS = process.env.STRESS_PROVIDERS || "groq,gemini";
}

const PlannerAgent = require("../services/agents/PlannerAgent");
const WriterAgent = require("../services/agents/WriterAgent");
const ValidatorAgent = require("../services/agents/ValidatorAgent");
const { courseOutlineZ } = require("../schemas/course.schema");
const { lessonZ } = require("../schemas/lesson.schema");

const N = parseInt(process.env.N || "50", 10);

const TOPICS = [
  "Introduction to React", "Python for Data Science", "Linear Algebra Basics",
  "Cloud Architecture on AWS", "Modern CSS Layouts", "Rust Programming Fundamentals",
  "Docker and Containers", "GraphQL APIs", "Kubernetes for Beginners",
  "Machine Learning with PyTorch", "SQL Performance Tuning", "TypeScript Generics",
  "WebAssembly Deep Dive", "Functional Programming in JavaScript", "Network Security Essentials",
  "iOS Development with Swift", "Android Jetpack Compose", "Game Dev with Unity",
  "Solidity and Smart Contracts", "Computer Vision Basics", "Natural Language Processing",
  "DevOps with GitHub Actions", "Microservices Patterns", "Event-Driven Architecture",
  "Test-Driven Development", "Behavioral Interview Prep", "System Design Interview Prep",
  "Algorithms in Go", "Compilers from Scratch", "Linux Kernel Internals",
  "Quantum Computing Intro", "Blockchain Fundamentals", "Data Structures in C++",
  "iOS SwiftUI Animations", "AWS Lambda Deep Dive", "PostgreSQL Internals",
  "Vue 3 Composition API", "Svelte for React Devs", "Flutter Cross-Platform Apps",
  "Distributed Systems Theory", "Operating Systems Concepts", "Bash Scripting Mastery",
  "Regex Patterns", "Cryptography Foundations", "Web Accessibility (a11y)",
  "Performance Optimization for Web", "Mobile App Security", "REST API Design",
  "Async Patterns in JavaScript", "Memory Management in Java",
];

function pickTopic(i) {
  return `${TOPICS[i % TOPICS.length]} (run ${i + 1})`;
}

function pct(part, total) {
  return total === 0 ? "0.00%" : ((part / total) * 100).toFixed(2) + "%";
}

function summarize(label, results) {
  const total = results.length;
  const rawPass = results.filter((r) => r.rawValid).length;
  const repairPass = results.filter((r) => r.repairValid).length;
  const pipelinePass = results.filter((r) => r.pipelineValid).length;
  const fail = results.filter((r) => !r.pipelineValid);
  const lats = results.filter((r) => r.pipelineValid).map((r) => r.latencyMs);
  lats.sort((a, b) => a - b);
  const mean = lats.length ? lats.reduce((a, b) => a + b, 0) / lats.length : 0;
  const p95 = lats.length ? lats[Math.floor(lats.length * 0.95)] : 0;

  console.log(`\n── ${label} (N=${total}) ─────────────────────`);
  console.log(`  raw pass (model adherence)   : ${rawPass}/${total}  ${pct(rawPass, total)}`);
  console.log(`  after repair (1st attempt)   : ${repairPass}/${total}  ${pct(repairPass, total)}`);
  console.log(`  pipeline pass (with retry)   : ${pipelinePass}/${total}  ${pct(pipelinePass, total)}    ← user-facing`);
  console.log(`  mean latency                 : ${mean.toFixed(0)} ms`);
  console.log(`  p95 latency                  : ${p95.toFixed(0)} ms`);

  if (fail.length) {
    console.log(`  failure samples:`);
    fail.slice(0, 3).forEach((f) => {
      console.log(`    [${f.topic}] ${(f.error || "").slice(0, 160)}`);
    });
  }
  return { total, rawPass, repairPass, pipelinePass };
}

async function attemptCourse(topic) {
  const raw = await PlannerAgent.run(topic);
  let rawValid = false;
  let repairValid = false;
  try { courseOutlineZ.parse(raw); rawValid = true; } catch (_) {}
  try { ValidatorAgent.validateCourse(raw); repairValid = true; } catch (_) {}
  return { raw, rawValid, repairValid };
}

async function runCourse(i) {
  const topic = pickTopic(i);
  const start = Date.now();
  const out = { topic, rawValid: false, repairValid: false, pipelineValid: false, latencyMs: 0, error: null };
  try {
    const a1 = await attemptCourse(topic);
    out.rawValid = a1.rawValid;
    out.repairValid = a1.repairValid;
    out.pipelineValid = a1.repairValid;

    if (!a1.repairValid) {
      // Mirror CoursePipeline's single retry on validation failure
      try {
        const a2 = await attemptCourse(topic);
        out.pipelineValid = a2.repairValid;
        if (!a2.repairValid) out.error = "validation failed after retry";
      } catch (e) {
        out.error = `retry LLM error: ${e.message.slice(0, 200)}`;
      }
    }
  } catch (e) {
    out.error = `LLM error: ${e.message.slice(0, 200)}`;
  }
  out.latencyMs = Date.now() - start;
  return out;
}

async function attemptLesson(courseTitle, moduleTitle, lessonTitle) {
  const raw = await WriterAgent.run({ courseTitle, moduleTitle, lessonTitle });
  let rawValid = false;
  let repairValid = false;
  try { lessonZ.parse(raw); rawValid = true; } catch (_) {}
  try { ValidatorAgent.validateLesson(raw); repairValid = true; } catch (_) {}
  return { raw, rawValid, repairValid };
}

async function runLesson(i, courseTitle = "Demo Course") {
  const lessonTitle = `Lesson ${i + 1}: ${TOPICS[i % TOPICS.length]} fundamentals`;
  const moduleTitle = `Module ${(i % 5) + 1}`;
  const start = Date.now();
  const out = { topic: lessonTitle, rawValid: false, repairValid: false, pipelineValid: false, latencyMs: 0, error: null };
  try {
    const a1 = await attemptLesson(courseTitle, moduleTitle, lessonTitle);
    out.rawValid = a1.rawValid;
    out.repairValid = a1.repairValid;
    out.pipelineValid = a1.repairValid;

    if (!a1.repairValid) {
      try {
        const a2 = await attemptLesson(courseTitle, moduleTitle, lessonTitle);
        out.pipelineValid = a2.repairValid;
        if (!a2.repairValid) out.error = "validation failed after retry";
      } catch (e) {
        out.error = `retry LLM error: ${e.message.slice(0, 200)}`;
      }
    }
  } catch (e) {
    out.error = `LLM error: ${e.message.slice(0, 200)}`;
  }
  out.latencyMs = Date.now() - start;
  return out;
}

async function runBatch(label, n, makeJob) {
  // Groq free tier is ~30 req/min. With one retry on failure we can hit
  // ~2x that per logical run, so we throttle to one job every 2.5s to
  // stay comfortably under the limit and avoid breaker trips that would
  // pollute the integrity numbers.
  const throttleMs = parseInt(process.env.STRESS_THROTTLE_MS || "2500", 10);

  console.log(`\nRunning ${n} ${label}… (throttle ${throttleMs}ms/req)`);
  const results = [];
  for (let i = 0; i < n; i += 1) {
    process.stdout.write(`\r  progress: ${i + 1}/${n}`);
    const t = Date.now();
    const r = await makeJob(i);
    results.push(r);
    const remaining = throttleMs - (Date.now() - t);
    if (remaining > 0 && i < n - 1) await new Promise((r) => setTimeout(r, remaining));
  }
  process.stdout.write("\n");
  return results;
}

(async () => {
  console.log(`\n📊 Pipeline stress test  N=${N}  (will make ~${N * 2} LLM calls)`);

  const courseResults = await runBatch("courses", N, runCourse);
  const courseStats = summarize("COURSES", courseResults);

  const lessonResults = await runBatch("lessons", N, runLesson);
  const lessonStats = summarize("LESSONS", lessonResults);

  const totalRuns = courseStats.total + lessonStats.total;
  const totalRaw = courseStats.rawPass + lessonStats.rawPass;
  const totalRepair = courseStats.repairPass + lessonStats.repairPass;
  const totalPipeline = courseStats.pipelinePass + lessonStats.pipelinePass;

  console.log(`\n══ OVERALL ══════════════════════════════════`);
  console.log(`  total runs                   : ${totalRuns}`);
  console.log(`  raw pass (model alone)       : ${totalRaw}/${totalRuns}  ${pct(totalRaw, totalRuns)}`);
  console.log(`  after repair (no retry)      : ${totalRepair}/${totalRuns}  ${pct(totalRepair, totalRuns)}`);
  console.log(`  pipeline pass (full system)  : ${totalPipeline}/${totalRuns}  ${pct(totalPipeline, totalRuns)}    ← resume metric`);
  console.log(`──────────────────────────────────────────────\n`);

  process.exit(totalPipeline === totalRuns ? 0 : 1);
})().catch((e) => {
  console.error("Stress test crashed:", e);
  process.exit(2);
});
