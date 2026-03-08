export default function Home() {
  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3">
          Welcome to Vocabulary Builder
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-base">
          Learn new vocabulary words one at a time, delivered straight to you.
        </p>
      </div>
    </div>
  );
}
