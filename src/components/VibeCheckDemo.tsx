import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import Papa from "papaparse";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Screen = "home" | "questions" | "sorting" | "final";

interface QuestionData {
  ILO: string;
  Question: string;
  Group_A?: string;
  Group_B?: string;
  Group_C?: string;
  Group_D?: string;
  Group_E?: string;
  Option_A?: string;
  Option_B?: string;
  Option_C?: string;
  Option_D?: string;
  Option_E?: string;
}

interface Legacy {
  name: string;
  text: string;
}

const ILO_ORDER = ["CR", "IC", "PD", "SW", "IE"];
const OPTION_KEYS = ["A", "B", "C", "D", "E"] as const;

const MINERVA_VIBES: Record<string, string[]> = {
  Civic: ["Stewardship", "Altruism", "Community"],
  Legion: ["Camaraderie", "Valor", "Solidarity"],
  Liberty: ["Autonomy", "Empowerment", "Liberation"],
  North: ["Vision", "Foresight", "Aspiration"],
  Tower: ["Courage", "Perspective", "Resilience"],
  Lands: ["Heritage", "Immersion", "Diversity"],
  Ocean: ["Voyage", "Depth", "Exploration"],
  Plaza: ["Inclusivity", "Exchange", "Openness"],
  Reserve: ["Discernment", "Essence", "Prudence"],
  Vista: ["Reflection", "Narrative", "Evolution"],
  Pier: ["Conviction", "Launch", "Promise"],
  Cable: ["Bonds", "Interdependence", "Network"],
  Chronicle: ["Veracity", "Documentation", "Accountability"],
  Pyramid: ["Identity", "Introspection", "Foundation"],
  Union: ["Alliance", "Commitment", "Loyalty"],
  Field: ["Cultivation", "Synergy", "Growth"],
  Gate: ["Progression", "Threshold", "Ambition"],
  Labyrinth: ["Journey", "Discovery", "Persistence"],
  Laurel: ["Innovation", "Inquiry", "Curiosity"],
  Mason: ["Craftsmanship", "Collaboration", "Education"],
  Circuit: ["Cycles", "Interconnectedness", "Flow"],
  Eureka: ["Breakthrough", "Revelation", "Ingenuity"],
  Hunter: ["Pursuit", "Instinct", "Tenacity"],
  Mission: ["Purpose", "Vocation", "Calling"],
  Octagon: ["Equilibrium", "Harmony", "Balance"],
};

const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  },
  slideLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.6 },
  },
  slideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.6 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  scaleSpring: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  container: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.1, delayChildren: 0.1 },
    },
    exit: { opacity: 0 },
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
} as const;

const interactions = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
  buttonHover: {
    scale: 1.05,
    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
    transition: { duration: 0.2 },
  },
  cardHover: {
    scale: 1.02,
    borderColor: "#9ca3af",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 },
  },
} as const;

function withDelay<T extends object>(variant: T, delay: number) {
  return { ...variant, transition: { delay } };
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}

function selectQuestions(allQuestions: QuestionData[]) {
  const grouped: Record<string, QuestionData[]> = {};

  for (const question of allQuestions) {
    if (!question.ILO || !question.Question) continue;
    grouped[question.ILO] ??= [];
    grouped[question.ILO].push(question);
  }

  const selected: QuestionData[] = [];
  for (const ilo of ILO_ORDER) {
    selected.push(...shuffle(grouped[ilo] ?? []).slice(0, 5));
  }

  return shuffle(selected);
}

function getGroupValue(
  question: QuestionData,
  option: (typeof OPTION_KEYS)[number]
) {
  return question[`Group_${option}`] ?? "";
}

function getOptionValue(
  question: QuestionData,
  option: (typeof OPTION_KEYS)[number]
) {
  return question[`Option_${option}`] ?? "";
}

function getLegacyGroups(legacies: Legacy[]) {
  return [
    legacies.slice(0, 5),
    legacies.slice(5, 10),
    legacies.slice(10, 15),
    legacies.slice(15, 20),
    legacies.slice(20, 25),
    legacies.slice(25, 30),
  ];
}

function ProgressBar({
  current,
  total,
  isCompleted = false,
}: {
  current: number;
  total: number;
  isCompleted?: boolean;
}) {
  const percent = Math.round(((current - 1) / total) * 100);
  const displayPercent = isCompleted ? 100 : percent;

  return (
    <motion.div
      className="fixed top-0 right-0 left-0 z-50 border-b border-gray-100 bg-white/90 p-4 backdrop-blur-sm"
      {...animationVariants.slideUp}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-800">
            Question {current} of {total}
          </span>
        </div>

        <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <motion.div
            className="absolute h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${displayPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "loop",
            }}
            style={{ width: "30%" }}
          />
        </div>

        <div className="mt-2 text-center">
          <motion.span
            className="text-xs text-gray-500"
            key={displayPercent}
            {...animationVariants.scaleIn}
          >
            {displayPercent}% Complete
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

function SortableItem({ id, children }: { id: string; children: ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? "transform 100ms ease",
        zIndex: isDragging ? 1000 : 0,
        position: "relative",
        opacity: isDragging ? 0.5 : 1,
        touchAction: "none",
      }}
      {...attributes}
      {...listeners}
      className="touch-none select-none"
    >
      {children}
    </div>
  );
}

export default function VibeCheckDemo() {
  const [screen, setScreen] = useState<Screen>("home");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [legacies, setLegacies] = useState<Legacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [rankings, setRankings] = useState<Record<number, string[]>>({});
  const [items, setItems] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [vibe, setVibe] = useState("");
  const autoScrollInterval = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const legacyGroups = useMemo(() => getLegacyGroups(legacies), [legacies]);
  const question = questions[currentQuestion];
  const selectedOption = answers[currentQuestion] ?? "";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjectData() {
      try {
        const [questionsResponse, legaciesResponse] = await Promise.all([
          fetch("/vibe-check/legacy_questions.csv", {
            signal: controller.signal,
          }),
          fetch("/vibe-check/legacies.csv", { signal: controller.signal }),
        ]);

        if (!questionsResponse.ok || !legaciesResponse.ok) {
          throw new Error("Unable to load the original questionnaire data.");
        }

        const [questionsCsv, legaciesCsv] = await Promise.all([
          questionsResponse.text(),
          legaciesResponse.text(),
        ]);
        const parsedQuestions = Papa.parse<QuestionData>(questionsCsv, {
          header: true,
          skipEmptyLines: true,
        }).data;
        const parsedLegacies = Papa.parse<Legacy>(legaciesCsv, {
          header: true,
          skipEmptyLines: true,
        }).data.filter(legacy => legacy.name?.trim());

        setQuestions(selectQuestions(parsedQuestions));
        setLegacies(parsedLegacies);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load the questionnaire."
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadProjectData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (screen !== "sorting") return;
    const group = legacyGroups[currentGroupIndex];
    if (!group) return;
    setItems(rankings[currentGroupIndex] ?? group.map(legacy => legacy.name));
  }, [currentGroupIndex, legacyGroups, rankings, screen]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const viewportHeight = window.innerHeight;
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
      if (event.clientY > viewportHeight - 80) {
        autoScrollInterval.current = setInterval(
          () => window.scrollBy(0, 20),
          50
        );
      } else if (event.clientY < 80) {
        autoScrollInterval.current = setInterval(
          () => window.scrollBy(0, -20),
          50
        );
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, [isDragging]);

  function startQuestionnaire() {
    if (isLoading || loadError || questions.length === 0) return;
    setAnswers({});
    setRankings({});
    setCurrentQuestion(0);
    setCurrentGroupIndex(0);
    setVibe("");
    setScreen("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToNextQuestion() {
    if (!selectedOption) return;
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(current => current + 1);
    } else {
      setCurrentGroupIndex(0);
      setScreen("sorting");
    }
  }

  function calculateVibe() {
    const tally: Record<string, number> = {};
    for (const answer of Object.values(answers)) {
      tally[answer] = (tally[answer] ?? 0) + 1;
    }

    const entries = Object.entries(tally);
    const highestCategory =
      entries.length > 0
        ? entries.reduce((left, right) =>
            left[1] > right[1] ? left : right
          )[0]
        : "";
    const pool = MINERVA_VIBES[highestCategory] ?? ["unique"];
    setVibe(pool[Math.floor(Math.random() * pool.length)] ?? "unique");
    setScreen("final");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSortingNext() {
    setRankings(current => ({ ...current, [currentGroupIndex]: items }));

    if (currentGroupIndex < legacyGroups.length - 1) {
      setCurrentGroupIndex(current => current + 1);
    } else {
      calculateVibe();
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
    setIsDragging(true);
    document.body.classList.add("dragging");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems(currentItems => {
        const oldIndex = currentItems.indexOf(String(active.id));
        const newIndex = currentItems.indexOf(String(over.id));
        return arrayMove(currentItems, oldIndex, newIndex);
      });
    }

    setActiveId(null);
    setIsDragging(false);
    document.body.classList.remove("dragging");
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  }

  const getProgressMessage = () => {
    const progress = (currentGroupIndex + 1) / legacyGroups.length;
    if (progress < 0.25) return "It's the last set!";
    if (progress < 0.5) return "Making good progress!";
    if (progress < 0.75) return "You're doing great!";
    return "You're almost there!";
  };

  return (
    <div className="vibe-copy min-h-screen font-sans text-gray-900">
      <style>{`
        .vibe-copy { font-family: "Open Sans Variable", ui-sans-serif, system-ui, sans-serif; }
        .vibe-copy h1, .vibe-copy h2, .vibe-copy h3 { font-family: inherit; letter-spacing: normal; }
        .vibe-copy .vibe-signature { font-family: "Kalam", "Comic Sans MS", cursive; }
        body.dragging { overflow: hidden; }
        @media (prefers-reduced-motion: reduce) {
          .vibe-copy *, .vibe-copy *::before, .vibe-copy *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <a
        href="/portfolio"
        className="fixed bottom-4 left-4 z-[70] rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-xs font-semibold text-gray-600 shadow-lg backdrop-blur-sm hover:bg-gray-50 hover:text-blue-600"
      >
        ← Portfolio
      </a>
      <div className="fixed right-4 bottom-4 z-[70] flex items-center gap-2">
        <a
          href="https://yourminervavibe.com"
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:from-blue-600 hover:to-purple-700"
        >
          Official site ↗
        </a>
        <a
          href="https://github.com/pekkimori/legacyquestionnaire"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-xs font-semibold text-gray-600 shadow-lg backdrop-blur-sm hover:bg-gray-50 hover:text-blue-600"
        >
          Source ↗
        </a>
      </div>

      <AnimatePresence mode="wait">
        {screen === "home" && (
          <motion.main
            key="home"
            className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white p-6"
            {...animationVariants.fadeIn}
          >
            <div className="flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row">
              <motion.div
                {...withDelay(animationVariants.slideLeft, 0.1)}
                className="flex-shrink-0"
              >
                <img
                  src="/vibe-check/minerva.svg"
                  alt="Minerva Logo"
                  width={280}
                  height={280}
                  className="h-[280px] w-[280px] drop-shadow-2xl"
                />
              </motion.div>

              <motion.div
                {...withDelay(animationVariants.slideRight, 0.2)}
                className="flex max-w-lg flex-col items-center"
              >
                <motion.div
                  className="w-full rounded-3xl border border-gray-200 bg-white/90 p-10 shadow-2xl backdrop-blur-lg"
                  {...withDelay(animationVariants.slideUp, 0.3)}
                >
                  <motion.h1
                    className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-center text-4xl leading-tight font-bold text-transparent"
                    {...withDelay(animationVariants.slideUp, 0.4)}
                  >
                    My Minerva Vibe Check ✔️
                  </motion.h1>

                  <motion.p
                    className="mb-8 text-center text-lg leading-relaxed text-gray-600"
                    {...withDelay(animationVariants.slideUp, 0.5)}
                  >
                    Discover your unique Minerva vibe and get ready for an
                    amazing Foundation Week experience!
                  </motion.p>

                  <motion.button
                    type="button"
                    onClick={startQuestionnaire}
                    disabled={isLoading || Boolean(loadError)}
                    className={`flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 font-semibold text-white shadow-lg ${
                      isLoading || loadError
                        ? "cursor-not-allowed bg-gray-300"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
                    }`}
                    whileHover={
                      isLoading || loadError ? {} : interactions.hover
                    }
                    whileTap={isLoading || loadError ? {} : interactions.tap}
                  >
                    {isLoading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Preparing questionnaire...
                      </>
                    ) : loadError ? (
                      "Questionnaire unavailable"
                    ) : (
                      "Start Vibe Check"
                    )}
                  </motion.button>

                  {loadError && (
                    <p className="mt-3 text-center text-sm text-red-600">
                      {loadError}
                    </p>
                  )}

                  <motion.a
                    href="mailto:legacies@minerva.edu"
                    className="mt-8 block w-full rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-3 text-center font-semibold text-white shadow-lg hover:from-gray-700 hover:to-gray-800 hover:shadow-xl"
                    {...withDelay(animationVariants.slideUp, 0)}
                    whileHover={interactions.hover}
                    whileTap={interactions.tap}
                  >
                    Contact Us
                  </motion.a>
                </motion.div>
              </motion.div>

              <motion.div
                {...withDelay(animationVariants.fadeIn, 1)}
                className="hidden h-[280px] w-[280px] flex-shrink-0 items-center justify-center lg:flex"
              >
                <div className="vibe-signature -rotate-6 transform text-center text-lg leading-relaxed text-gray-500">
                  <div className="mb-2">made with</div>
                  <div
                    className="mb-2 text-2xl select-none"
                    title={
                      "M23 Jacob, Haitham & Eric\nM25 Seoyoung & Matvii\nM27 Boss & Karolina\nM28 Rafael & Noku"
                    }
                  >
                    ❤️
                  </div>
                  <div className="mb-1">for Minerva University</div>
                  <div className="text-sm italic">- Vibe Check Crew</div>
                </div>
              </motion.div>
            </div>
          </motion.main>
        )}

        {screen === "questions" && question && (
          <motion.div
            key={`question-${currentQuestion}`}
            className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProgressBar
              current={currentQuestion + 1}
              total={questions.length}
            />
            <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-6 pt-32">
              <motion.div
                className="w-full max-w-2xl"
                {...animationVariants.scaleIn}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <motion.div className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-xl backdrop-blur-sm">
                  <motion.h2
                    className="mb-6 text-3xl leading-tight font-bold text-gray-900"
                    {...animationVariants.slideUp}
                  >
                    {question.Question}
                  </motion.h2>

                  <motion.form {...animationVariants.fadeIn}>
                    <motion.div
                      className="space-y-3"
                      variants={animationVariants.container}
                      initial="initial"
                      animate="animate"
                    >
                      {OPTION_KEYS.map(option => {
                        const value = getGroupValue(question, option);
                        return (
                          <motion.label
                            key={option}
                            className={`group relative block cursor-pointer rounded-xl border-2 p-6 ${
                              selectedOption === value
                                ? "border-blue-500 bg-blue-50 shadow-md"
                                : "border-gray-200 bg-white"
                            }`}
                            variants={animationVariants.item}
                            whileHover={interactions.cardHover}
                            whileTap={interactions.tap}
                          >
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name={`question${currentQuestion + 1}`}
                                value={value}
                                checked={selectedOption === value}
                                onChange={() =>
                                  setAnswers(current => ({
                                    ...current,
                                    [currentQuestion]: value,
                                  }))
                                }
                                className="mr-4 h-5 w-5 flex-shrink-0 border-gray-300 text-blue-600 focus:ring-0 focus:outline-none"
                              />
                              <span className="text-lg leading-relaxed text-gray-800 group-hover:text-gray-900">
                                {getOptionValue(question, option)}
                              </span>
                            </div>
                          </motion.label>
                        );
                      })}
                    </motion.div>
                  </motion.form>

                  <motion.div
                    className="mt-8 flex flex-col justify-between gap-4 sm:flex-row"
                    {...animationVariants.slideUp}
                  >
                    {currentQuestion > 0 && (
                      <motion.button
                        type="button"
                        onClick={() =>
                          setCurrentQuestion(current => current - 1)
                        }
                        className="order-2 flex w-full items-center justify-center space-x-2 rounded-xl bg-gray-100 px-8 py-4 font-semibold text-gray-700 shadow-lg transition-all duration-150 hover:bg-gray-200 sm:order-1 sm:w-auto"
                        whileHover={interactions.buttonHover}
                        whileTap={interactions.tap}
                      >
                        <span>←</span>
                        <span className="hidden sm:inline">
                          Previous Question
                        </span>
                        <span className="sm:hidden">Previous</span>
                      </motion.button>
                    )}

                    <motion.button
                      type="button"
                      onClick={goToNextQuestion}
                      disabled={!selectedOption}
                      className={`order-1 flex w-full items-center justify-center space-x-2 rounded-xl px-8 py-4 font-semibold text-white shadow-lg transition-all duration-150 sm:order-2 sm:w-auto ${
                        selectedOption
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
                          : "cursor-not-allowed bg-gray-300"
                      }`}
                      whileHover={
                        selectedOption ? interactions.buttonHover : {}
                      }
                      whileTap={selectedOption ? interactions.tap : {}}
                    >
                      <span>
                        {currentQuestion === questions.length - 1
                          ? "Complete Survey"
                          : "Next Question"}
                      </span>
                      <span>→</span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </main>
          </motion.div>
        )}

        {screen === "sorting" && legacyGroups[currentGroupIndex] && (
          <motion.div
            key={`sorting-${currentGroupIndex}`}
            className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProgressBar
              current={currentGroupIndex + 1}
              total={legacyGroups.length}
            />
            <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-6 pt-32">
              <motion.div
                className="w-full max-w-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="rounded-xl bg-white p-8 shadow-xl"
                  {...animationVariants.fadeIn}
                >
                  <motion.div
                    className="mb-6 text-center"
                    {...animationVariants.slideUp}
                  >
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">
                      Sort Your Mottos!
                    </h1>
                    <p className="bg-gradient-to-r from-red-500 via-blue-400 to-purple-500 bg-clip-text font-bold text-transparent">
                      {getProgressMessage()}
                    </p>
                    <p className="mt-2 text-gray-600">
                      <span className="hidden sm:inline">Drag and drop</span>
                      <span className="sm:hidden">Touch and drag</span> to rank
                      the following statements from most important to least
                      important.
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      <span className="sm:hidden">
                        Tip: Press and hold each item, then drag to reorder
                      </span>
                      <span className="hidden sm:inline">
                        Use the drag handles on the right to reorder items
                      </span>
                    </p>
                  </motion.div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={items}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {items.map((id, index) => (
                          <SortableItem key={id} id={id}>
                            <motion.div
                              layoutId={id}
                              className={`sortable-item group relative block cursor-grab rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 active:cursor-grabbing active:border-blue-500 active:bg-blue-50 ${
                                isDragging && activeId === id
                                  ? "scale-105 opacity-50"
                                  : ""
                              }`}
                              whileHover={interactions.cardHover}
                              whileTap={interactions.tap}
                              style={{
                                touchAction: "none",
                                userSelect: "none",
                              }}
                            >
                              <div className="flex items-center">
                                <span className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-500 transition-colors group-active:bg-blue-100 group-active:text-blue-600">
                                  {index + 1}
                                </span>
                                <span className="flex-grow text-left text-lg leading-relaxed text-gray-800 group-hover:text-gray-900">
                                  {legacyGroups[currentGroupIndex].find(
                                    legacy => legacy.name === id
                                  )?.text ?? ""}
                                </span>
                                <div className="ml-4 flex-shrink-0 text-2xl font-bold tracking-[-0.2em] text-gray-400 opacity-40 transition-opacity group-hover:opacity-60">
                                  ≡
                                </div>
                              </div>
                            </motion.div>
                          </SortableItem>
                        ))}
                      </div>
                    </SortableContext>

                    <DragOverlay>
                      {activeId ? (
                        <motion.div
                          layoutId={activeId}
                          className="group relative block scale-105 transform cursor-grabbing rounded-xl border-2 border-blue-500 bg-blue-50 p-6 text-center shadow-xl"
                        >
                          <div className="flex items-center">
                            <span className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                              {items.indexOf(activeId) + 1}
                            </span>
                            <span className="flex-grow text-lg leading-relaxed text-gray-800">
                              {legacyGroups[currentGroupIndex].find(
                                legacy => legacy.name === activeId
                              )?.text ?? ""}
                            </span>
                            <div className="ml-4 text-2xl font-bold text-blue-400 opacity-60">
                              ≡
                            </div>
                          </div>
                        </motion.div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>

                  <div className="mt-8 flex justify-end">
                    <motion.button
                      type="button"
                      onClick={handleSortingNext}
                      className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-150 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
                      whileHover={interactions.buttonHover}
                      whileTap={interactions.tap}
                    >
                      <span>
                        {currentGroupIndex < legacyGroups.length - 1
                          ? "Next Group"
                          : "Submit Rankings"}
                      </span>
                      <span>→</span>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </main>
          </motion.div>
        )}

        {screen === "final" && (
          <motion.div
            key="final"
            className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              {...animationVariants.scaleSpring}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full max-w-2xl text-center"
            >
              <motion.div className="relative rounded-3xl border border-gray-100 bg-white/90 p-12 shadow-2xl backdrop-blur-lg">
                <motion.div
                  {...withDelay(animationVariants.scaleSpring, 0.3)}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
                  className="mb-8"
                >
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-5xl text-white shadow-lg">
                    ✓
                  </div>
                </motion.div>

                <motion.h1
                  className="mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-5xl leading-tight font-bold text-transparent"
                  {...withDelay(animationVariants.slideUp, 0.4)}
                >
                  Your Minerva Vibe is...
                </motion.h1>

                <motion.div
                  {...withDelay(animationVariants.slideUp, 0.8)}
                  className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-8"
                >
                  <motion.div
                    {...withDelay(animationVariants.scaleSpring, 1)}
                    className="inline-block"
                  >
                    <span className="rounded-xl border-2 border-blue-200 bg-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text px-6 py-3 text-3xl font-bold text-transparent shadow-md">
                      {vibe}
                    </span>
                  </motion.div>
                </motion.div>

                <motion.p
                  className="text-xl leading-relaxed text-gray-600"
                  {...withDelay(animationVariants.slideUp, 0.6)}
                >
                  Get ready for an amazing Foundation Week experience!
                </motion.p>

                <motion.div
                  {...withDelay(animationVariants.fadeIn, 1.2)}
                  className="mt-8"
                >
                  <p className="text-sm text-gray-600">
                    Try finding other Minervans with similar vibes! 👀
                  </p>
                  <button
                    type="button"
                    onClick={startQuestionnaire}
                    className="mt-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-blue-600 hover:to-purple-700"
                  >
                    Take it again
                  </button>
                </motion.div>

                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                  {[12, 27, 44, 61, 76, 89].map((left, index) => (
                    <motion.div
                      key={left}
                      className="absolute h-2 w-2 rounded-full bg-blue-400 opacity-20"
                      animate={{
                        y: [0, -100, 0],
                        x: [
                          0,
                          (index % 2 === 0 ? 1 : -1) * (18 + index * 5),
                          0,
                        ],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5,
                        ease: "easeInOut",
                      }}
                      style={{ left: `${left}%`, top: "100%" }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
