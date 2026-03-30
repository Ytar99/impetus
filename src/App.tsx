"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useQuery,
  useMutation,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, LogOut } from "lucide-react";

// Helper function to format date in local timezone (YYYY-MM-DD)
function formatDateLocal(date: Date): string {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}

// Russian translations
const translations = {
  welcome: "Добро пожаловать",
  trackProgress: "Стройте привычки и отслеживайте прогресс",
  weekProgress: "Прогресс недели",
  skills: "Навыки",
  tasks: "Задачи",
  noTasks: "Нет задач на этот день",
  noActiveWeek: "Нет активной недели",
  startTracking: "Начните отслеживать свой прогресс",
  startNewWeek: "Начать новую неделю",
  signIn: "Войти",
  signUp: "Зарегистрироваться",
  email: "Email",
  password: "Пароль",
  noAccount: "Нет аккаунта?",
  haveAccount: "Уже есть аккаунт?",
  signUpInstead: "Зарегистрироваться",
  signInInstead: "Войти",
  addSkill: "Добавить навык",
  editSkill: "Редактировать навык",
  removeSkill: "Удалить навык",
  cancel: "Отмена",
  save: "Сохранить",
  skillName: "Название навыка",
  daysPerWeek: "Дней в неделю",
  adding: "Добавление...",
  add: "Добавить",
  updating: "Обновление...",
  updateDay: "Обновить день",
  currentWeek: "Текущая неделя",
  viewingPastWeek: "Просмотр прошлой недели",
  weeksAgo: "недель назад",
  inProgress: "В процессе",
  completed: "Завершено",
  missed: "Пропущено",
  empty: "Пусто",
  today: "Сегодня",
  signInForm: "Добро пожаловать в Impetus",
  error: "Ошибка",
  dismiss: "Закрыть",
  skillCannotBeEmpty: "Название навыка не может быть пустым",
  daysMustBeBetween: "Количество дней в неделю должно быть от 1 до 7",
  failedToAddSkill: "Не удалось добавить навык",
  failedToUpdateSkill: "Не удалось обновить навык",
  failedToRemoveSkill: "Не удалось удалить навык",
  failedToStartWeek: "Не удалось начать неделю",
  failedToUpdateDay: "Не удалось обновить день",
  welcomeForm: "Добро пожаловать в Impetus",
  dontHaveAccount: "Нет аккаунта?",
  alreadyHaveAccount: "Уже есть аккаунт?",
  signInButton: "Войти",
  signUpButton: "Зарегистрироваться",
  errorPrefix: "Ошибка:",
  currentWeekButton: "Текущая неделя",
  updateDayButton: "Обновить день",
  noActiveWeekTitle: "Нет активной недели",
  startTrackingProgress: "Начните отслеживать свой прогресс",
  starting: "Запуск...",
  startNewWeekButton: "Начать новую неделю",
  selectedDay: "Выбранный день",
  unknownTask: "Неизвестно",
  noSkillsYet: "Навыков пока нет",
  addSkillButton: "Добавить навык",
  saveButton: "Сохранить",
  cancelButton: "Отмена",
  daysPerWeekShort: "дн/нед",
  cancelLabel: "Отмена",
  signOutLabel: "Выйти",
  addSkillLabel: "Добавить навык",
  editSkillLabel: "Редактировать навык",
  removeSkillLabel: "Удалить навык",
  saveLabel: "Сохранить",
  inProgressLabel: "В процессе",
  noActiveWeekLabel: "Нет активной недели",
  startTrackingLabel: "Начать новую неделю для отслеживания прогресса",
  previousWeekLabel: "Предыдущая неделя",
  nextWeekLabel: "Следующая неделя",
  dismissLabel: "Закрыть",
  failedToAddSkillLabel: "Не удалось добавить навык",
  failedToUpdateSkillLabel: "Не удалось обновить навык",
  failedToRemoveSkillLabel: "Не удалось удалить навык",
  failedToStartWeekLabel: "Не удалось начать неделю",
  failedToUpdateDayLabel: "Не удалось обновить день",
  daysMustBeBetweenLabel: "Количество дней в неделю должно быть от 1 до 7",
  noSkillsYetLabel: "Навыков пока нет",
  userLabel: "Пользователь",
  activeWeek: "Активная неделя",
};

function getUserInitials(user: any) {
  if (!user) return "U";
  const name = user.name || user.email || "User";
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function App() {
  const user = useQuery(api.myFunctions.getCurrentUser);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Impetus</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold">
                    {getUserInitials(user)}
                  </div>
                </div>
                <SignOutButton />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <Authenticated>
              <Content />
            </Authenticated>
            <Unauthenticated>
              <SignInForm />
            </Unauthenticated>
          </div>
        </main>
      </div>
    </div>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  return (
    <>
      {isAuthenticated && (
        <button
          className="bg-slate-200 dark:bg-slate-800 text-dark dark:text-light rounded-md p-2 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          onClick={() => void signOut()}
          aria-label={translations.signOutLabel}
          title={translations.signOutLabel}
        >
          <LogOut size={20} />
        </button>
      )}
    </>
  );
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-6 w-80 sm:w-96 mx-auto max-w-sm">
      <p className="text-center text-lg">{translations.welcomeForm}</p>
      <form
        className="flex flex-col gap-3 sm:gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);

          // set email to lowercase
          const email = formData.get("email") as string;
          formData.set("email", email.toLowerCase());
          formData.set("flow", flow);

          void signIn("password", formData).catch((error) => {
            setError(error.message);
          });
        }}
      >
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 sm:p-3 border-2 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          name="email"
          placeholder={translations.email}
          required
        />
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 sm:p-3 border-2 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          name="password"
          placeholder={translations.password}
          required
        />
        <button
          className="bg-dark dark:bg-light text-light dark:text-dark rounded-md py-2 sm:py-3 font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          type="submit"
        >
          {flow === "signIn"
            ? translations.signInButton
            : translations.signUpButton}
        </button>
        <div className="flex justify-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {flow === "signIn"
              ? translations.dontHaveAccount
              : translations.alreadyHaveAccount}
          </span>
          <span
            className="text-blue-600 dark:text-blue-400 underline hover:no-underline cursor-pointer"
            onClick={() => {
              setFlow(flow === "signIn" ? "signUp" : "signIn");
            }}
          >
            {flow === "signIn"
              ? translations.signUpInstead
              : translations.signInInstead}
          </span>
        </div>
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-3">
            <p className="text-dark dark:text-light font-mono text-sm">
              {translations.errorPrefix}: {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              {translations.dismiss}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function Content() {
  const user = useQuery(api.myFunctions.getCurrentUser);
  const { weeks, currentWeek, weekExpired } =
    useQuery(api.myFunctions.getWeeks) ?? {};

  const [showAddSkill, setShowAddSkill] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Track selected day
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const createWeekMutation = useMutation(api.myFunctions.createWeek);
  const addSkillMutation = useMutation(api.myFunctions.addSkill);
  const distributeSkillsMutation = useMutation(
    api.myFunctions.distributeSkills,
  );
  const updateDayMutation = useMutation(api.myFunctions.updateDay);
  const toggleSkillMutation = useMutation(api.myFunctions.toggleSkill);
  const completeExpiredWeekMutation = useMutation(
    api.myFunctions.completeExpiredWeek,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle expired week - complete it automatically
  useEffect(() => {
    if (weekExpired) {
      setLoading(true);
      completeExpiredWeekMutation()
        .then(() => {
          // Week completed successfully, data will refresh automatically
        })
        .catch((err) => {
          console.error("Error completing expired week:", err);
          setError("Не удалось завершить прошедшую неделю");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [weekExpired]);

  if (user === undefined || weeks === undefined || currentWeek === undefined) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  const handleStartWeek = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calculate week dates (Monday to Sunday)
      const today = new Date();
      const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      // Calculate days since Monday: Sunday=6, Monday=0, Tuesday=1, ..., Saturday=5
      const daysSinceMonday = day === 0 ? 6 : day - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - daysSinceMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startDate = formatDateLocal(monday);
      const endDate = formatDateLocal(sunday);

      await createWeekMutation({ startDate, endDate });
      await distributeSkillsMutation();
      setSelectedDayIndex(0); // Reset to today
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : translations.failedToStartWeek;
      setError(errorMessage);
      console.error("Error starting week:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (name: string, daysPerWeek: number) => {
    setLoading(true);
    setError(null);
    try {
      if (!name.trim()) {
        setError(translations.skillCannotBeEmpty);
        return;
      }
      if (daysPerWeek < 1 || daysPerWeek > 7) {
        setError(translations.daysMustBeBetween);
        return;
      }

      await addSkillMutation({
        name: name.trim(),
        targetDaysPerWeek: daysPerWeek,
      });
      await distributeSkillsMutation();
      setShowAddSkill(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : translations.failedToAddSkill;
      setError(errorMessage);
      console.error("Error adding skill:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDay = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateDayMutation();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : translations.failedToUpdateDay;
      setError(errorMessage);
      console.error("Error updating day:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
  };

  // Determine if we're in read-only mode (viewing past weeks or no active week)
  const isReadOnly = selectedWeekIndex > 0 || !currentWeek;

  return (
    <div className="max-w-full lg:max-w-6xl mx-auto">
      {error && (
        <div className="mb-4 bg-red-500/20 border-2 border-red-500/50 rounded-md p-3">
          <p className="text-dark dark:text-light font-mono text-sm">
            Error: {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <WeekTracker
            onStartWeek={handleStartWeek}
            onUpdateDay={handleUpdateDay}
            loading={loading}
            selectedDayIndex={selectedDayIndex}
            selectedWeekIndex={selectedWeekIndex}
            onDayClick={handleDayClick}
            onWeekIndexChange={setSelectedWeekIndex}
          />
          <CurrentTasks
            onToggleSkill={toggleSkillMutation}
            loading={loading}
            selectedDayIndex={selectedDayIndex}
            isReadOnly={isReadOnly}
          />
        </div>
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          <div className="bg-white rounded-lg p-3 border border-gray-100 min-h-[200px]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                {translations.skills}
              </h3>
              {!isReadOnly && (
                <button
                  onClick={() => setShowAddSkill(!showAddSkill)}
                  className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                  aria-label={translations.addSkillLabel}
                  title={translations.addSkillLabel}
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
            {showAddSkill && (
              <AddSkillForm
                onAddSkill={handleAddSkill}
                onClose={() => setShowAddSkill(false)}
                loading={loading}
              />
            )}
            <SkillList isReadOnly={isReadOnly} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to create an empty week object
function createEmptyWeek() {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Calculate days since Monday: Sunday=6, Monday=0, Tuesday=1, ..., Saturday=5
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysSinceMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDate = formatDateLocal(monday);
  const endDate = formatDateLocal(sunday);

  return {
    _id: "empty",
    startDate,
    endDate,
    status: "empty", // Используем существующий статус
    days: Array.from({ length: 7 }, (_, index) => ({
      date: formatDateLocal(
        new Date(monday.getTime() + index * 24 * 60 * 60 * 1000),
      ),
      status: index === daysSinceMonday ? "today" : "empty",
      taskCount: 0,
      completedCount: 0,
    })),
  };
}

// Function to get normalized status text for display
function getWeekStatusText(status: string): string {
  switch (status) {
    case "active":
      return translations.inProgress;
    case "completed":
      return translations.completed;
    case "empty":
      return translations.empty;
    case "start":
      return translations.startNewWeek;
    default:
      return status; // Fallback for unknown statuses
  }
}

// Function to render start week interface
function renderStartWeekInterface({
  onStartWeek,
  loading,
}: {
  onStartWeek: () => Promise<void>;
  loading: boolean;
}) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full mx-auto mb-4 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {translations.noActiveWeekTitle}
      </h4>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {translations.startTrackingProgress}
      </p>
      <button
        onClick={() => void onStartWeek()}
        disabled={loading}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
      >
        {loading ? translations.starting : translations.startNewWeekButton}
      </button>
    </div>
  );
}

function WeekTracker({
  onStartWeek,
  onUpdateDay,
  loading,
  selectedDayIndex,
  selectedWeekIndex,
  onDayClick,
  onWeekIndexChange,
}: {
  onStartWeek: () => Promise<void>;
  onUpdateDay: () => Promise<void>;
  loading: boolean;
  selectedDayIndex?: number;
  selectedWeekIndex?: number;
  onDayClick?: (dayIndex: number) => void;
  onWeekIndexChange?: (index: number) => void;
}) {
  const { weeks, currentWeek, needsUpdate } =
    useQuery(api.myFunctions.getWeeks) ?? {};

  if (weeks === undefined || currentWeek === undefined) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
      </div>
    );
  }

  const actualSelectedWeekIndex = selectedWeekIndex ?? 0;
  const selectedWeek =
    weeks[actualSelectedWeekIndex] || currentWeek || createEmptyWeek();
  const canGoBack = actualSelectedWeekIndex < weeks.length - 1;
  const canGoForward = actualSelectedWeekIndex > 0;

  const handlePreviousWeek = () => {
    if (canGoBack && onWeekIndexChange) {
      onWeekIndexChange(actualSelectedWeekIndex + 1);
    }
  };

  const handleNextWeek = () => {
    if (canGoForward && onWeekIndexChange) {
      onWeekIndexChange(actualSelectedWeekIndex - 1);
    }
  };

  const handleGoToCurrent = () => {
    if (onWeekIndexChange) {
      onWeekIndexChange(0);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          {selectedWeek ? (
            <>
              {(selectedWeek.status as string) !== "start" && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {translations.weekProgress}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedWeek.startDate} - {selectedWeek.endDate}
                  </p>
                </>
              )}
              {actualSelectedWeekIndex > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {/* Перевести на русский */}
                  Просмотр истории: ({actualSelectedWeekIndex} недель назад)
                  {/* Viewing past week ({actualSelectedWeekIndex} weeks ago) */}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">
              {translations.noActiveWeekLabel}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {actualSelectedWeekIndex > 0 && (
            <button
              onClick={handleGoToCurrent}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              {translations.currentWeekButton}
            </button>
          )}
          {needsUpdate && (
            <button
              onClick={() => void onUpdateDay()}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? translations.updating : translations.updateDayButton}
            </button>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex justify-center items-center mb-4 sm:mb-6">
        <button
          onClick={handlePreviousWeek}
          disabled={!canGoBack || loading}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={translations.previousWeekLabel}
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="mx-2 sm:mx-4 text-center">
          <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            {getWeekStatusText(selectedWeek.status)}
          </span>
        </div>

        <button
          onClick={handleNextWeek}
          disabled={!canGoForward || loading}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={translations.nextWeekLabel}
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {(selectedWeek.status as string) === "start" ? (
        renderStartWeekInterface({ onStartWeek, loading })
      ) : (
        <div className="space-y-6">
          {/* Day Dots */}
          <div className="flex flex-col gap-4 justify-center items-center mx-auto sm:flex-row sm:gap-2 md:min-w-[280px] w-full max-w-[280px]">
            {selectedWeek.days.map((day: any, index: number) => (
              <DayDot
                key={index}
                day={day}
                index={index}
                onDayClick={onDayClick}
                isSelected={selectedDayIndex === index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DayDot({
  day,
  index,
  onDayClick,
  isSelected,
}: {
  day: any;
  index: number;
  onDayClick?: (index: number) => void;
  isSelected?: boolean;
}) {
  const colors = {
    completed: "bg-green-500 shadow-lg shadow-green-500/20",
    missed: "bg-red-500 shadow-lg shadow-red-500/20",
    today:
      "bg-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-white dark:ring-gray-800",
    empty: "bg-gray-200 dark:bg-gray-600",
  };

  const status = day.status as keyof typeof colors;
  const colorClass = colors[status] || colors.empty;

  const date = new Date(day.date);
  const dayName = date.toLocaleDateString("ru-RU", {
    weekday: "short",
  });

  // Calculate progress for this day
  // Note: tasks are stored in separate collection, we'll use a simplified approach
  // for now since we don't have direct access to daySkills in this component
  const totalTasks = day?.taskCount || 0;
  const completedTasks = day?.completedCount || 0;
  const progressText =
    totalTasks > 0 ? `${completedTasks}/${totalTasks}` : "0/0";

  return (
    <div
      className="flex flex-col items-center space-y-1 cursor-pointer group"
      onClick={() => onDayClick?.(index)}
    >
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${colorClass} hover:scale-110 transition-all duration-200 transform hover:-translate-y-1 ${
          isSelected ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""
        }`}
        title={`${day.date} - ${day.status}`}
      >
        {day.status === "today" && (
          <div className="w-full h-full rounded-full bg-blue-400 animate-pulse opacity-50"></div>
        )}
      </div>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {dayName}
      </span>
      <span
        className={`text-xs font-medium ${
          totalTasks > 0
            ? completedTasks === totalTasks
              ? "text-green-600"
              : "text-gray-600 dark:text-gray-400"
            : "text-gray-400"
        }`}
      >
        {progressText}
      </span>
    </div>
  );
}

function CurrentTasks({
  onToggleSkill,
  loading,
  selectedDayIndex,
  isReadOnly,
}: {
  onToggleSkill: any;
  loading: boolean;
  selectedDayIndex?: number;
  selectedWeek?: any;
  isReadOnly?: boolean;
}) {
  const { dayTasks } =
    useQuery(api.myFunctions.getDayTasks, {
      dayIndex: selectedDayIndex ?? 0,
    }) ?? {};

  if (dayTasks === undefined) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-100">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-semibold text-gray-900">
          Задачи на день:
        </h3>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {dayTasks.length} {translations.tasks.toLowerCase()}
          {dayTasks.length !== 1 ? "" : ""}
        </span>
      </div>

      {dayTasks.length > 0 ? (
        <div className="space-y-2">
          {dayTasks.map((task: any, index: number) => (
            <label
              key={index}
              className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded-md checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors cursor-pointer"
                checked={task?.completed || false}
                onChange={() => {
                  void onToggleSkill({
                    dayId: task?.dayId || "today",
                    skillId: task?.id,
                    completed: !(task?.completed || false),
                  });
                }}
                disabled={loading || isReadOnly}
              />
              <span
                className={`text-sm ${
                  task?.completed
                    ? "text-gray-500 line-through"
                    : "text-gray-900"
                }`}
              >
                {task?.name || translations.unknownTask}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <div className="w-8 h-8 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-500">{translations.noTasks}</p>
        </div>
      )}
    </div>
  );
}

function AddSkillForm({
  onAddSkill,
  onClose,
  loading,
}: {
  onAddSkill: (name: string, daysPerWeek: number) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const [days, setDays] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddSkill(name.trim(), days)
      .then(() => {
        // Handle success here
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Название навыка"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-300 dark:border-gray-600"
            disabled={loading}
          />
          <input
            type="number"
            min="1"
            max="7"
            placeholder="Количество дн/нед"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-300 dark:border-gray-600"
            disabled={loading}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? translations.adding : translations.add}
          </button>
          <button
            className="bg-white text-gray-600 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors font-medium"
            onClick={() => {
              onClose();
              return;
            }}
          >
            {translations.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}

function SkillList({ isReadOnly }: { isReadOnly?: boolean }) {
  const { skills } = useQuery(api.myFunctions.getSkills) ?? {};
  const updateSkillMutation = useMutation(api.myFunctions.updateSkill);
  const removeSkillMutation = useMutation(api.myFunctions.removeSkill);
  const distributeSkillsMutation = useMutation(
    api.myFunctions.distributeSkills,
  );

  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDays, setEditDays] = useState(1);

  if (skills === undefined) {
    return (
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mx-auto"></div>
    );
  }

  const handleEdit = (skill: any) => {
    setEditingSkill(skill._id);
    setEditName(skill.name);
    setEditDays(skill.targetDaysPerWeek);
  };

  const handleSave = async (skillId: any) => {
    try {
      await updateSkillMutation({
        skillId,
        name: editName,
        targetDaysPerWeek: editDays,
      });
      await distributeSkillsMutation();
      setEditingSkill(null);
    } catch (error) {
      console.error("Failed to update skill:", error);
    }
  };

  const handleRemove = async (skillId: any) => {
    try {
      await removeSkillMutation({ skillId });
      await distributeSkillsMutation();
    } catch (error) {
      console.error("Failed to remove skill:", error);
    }
  };

  return (
    <div className="space-y-1">
      {skills.map((skill, index) => (
        <div
          key={index}
          className="flex justify-between items-center p-1 rounded hover:bg-gray-50"
        >
          {editingSkill === skill._id ? (
            <div className="flex-1 space-y-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 p-1 rounded border border-gray-300 dark:border-gray-600 text-xs"
              />
              <div className="flex gap-1">
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={editDays}
                  onChange={(e) => setEditDays(parseInt(e.target.value))}
                  className="w-16 bg-white dark:bg-gray-800 p-1 rounded border border-gray-300 dark:border-gray-600 text-xs"
                />
                <button
                  onClick={() => {
                    void handleSave(skill._id);
                  }}
                  className="bg-green-600 text-white px-2 py-0.5 rounded text-xs hover:bg-green-700"
                >
                  {translations.save}
                </button>
                <button
                  onClick={() => setEditingSkill(null)}
                  className="bg-gray-300 text-gray-700 p-1 rounded hover:bg-gray-400 transition-colors"
                  aria-label={translations.cancelLabel}
                  title={translations.cancelLabel}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <span className="text-sm text-gray-900">{skill.name}</span>
                <span className="text-xs text-gray-500 ml-1">
                  {skill.targetDaysPerWeek}
                  {translations.daysPerWeekShort}
                </span>
              </div>
              {!isReadOnly && (
                <div className="flex gap-1">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => {
                      void handleEdit(skill);
                    }}
                    aria-label={translations.editSkillLabel}
                    title={translations.editSkillLabel}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      void handleRemove(skill._id);
                    }}
                    aria-label={translations.removeSkillLabel}
                    title={translations.removeSkillLabel}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
      {skills.length === 0 && (
        <div className="text-center py-2 text-gray-500 text-xs">
          {translations.noSkillsYet}
        </div>
      )}
    </div>
  );
}
