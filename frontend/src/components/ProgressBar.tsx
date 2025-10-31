interface Progress {
  totalMessages: number;
  topicsDiscussed: string[];
  difficultyLevel: string;
  understandingScore: number;
}

interface ProgressBarProps {
  progress: Progress;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-blue-600 bg-blue-100';
      case 'advanced':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case 'beginner':
        return '🌱';
      case 'intermediate':
        return '🚀';
      case 'advanced':
        return '⭐';
      default:
        return '📚';
    }
  };

  return (
    <div className="space-y-6">
      {/* Difficulty Level */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Difficulty Level
          </span>
        </div>
        <div
          className={`px-4 py-2 rounded-lg font-medium text-center ${getDifficultyColor(
            progress.difficultyLevel
          )}`}
        >
          {getDifficultyIcon(progress.difficultyLevel)}{' '}
          {progress.difficultyLevel.charAt(0).toUpperCase() +
            progress.difficultyLevel.slice(1)}
        </div>
      </div>

      {/* Understanding Score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Understanding
          </span>
          <span className="text-sm font-bold text-gray-900">
            {progress.understandingScore}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              progress.understandingScore >= 80 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                : progress.understandingScore >= 50
                ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                : progress.understandingScore >= 1
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                : 'bg-gray-300'
            }`}
            style={{ width: `${progress.understandingScore}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {progress.understandingScore >= 80 && "🎉 Excellent understanding!"}
          {progress.understandingScore >= 50 && progress.understandingScore < 80 && "👍 Good progress!"}
          {progress.understandingScore >= 1 && progress.understandingScore < 50 && "💪 Keep learning!"}
          {progress.understandingScore === 0 && "🌱 Start your learning journey!"}
        </p>
      </div>

      {/* Messages Count */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">💬</span>
          <span className="text-sm font-medium text-gray-700">Messages</span>
        </div>
        <span className="text-2xl font-bold text-gray-900">
          {progress.totalMessages}
        </span>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-gray-700">
          {progress.understandingScore >= 80 && (
            <>🎉 Great job! You're mastering these concepts!</>
          )}
          {progress.understandingScore >= 50 && progress.understandingScore < 80 && (
            <>👍 Keep going! You're making good progress!</>
          )}
          {progress.understandingScore >= 1 && progress.understandingScore < 50 && (
            <>💪 Keep learning! Every question helps you grow!</>
          )}
          {progress.understandingScore === 0 && (
            <>🌟 Ready to learn? Ask your first question!</>
          )}
        </p>
      </div>
    </div>
  );
}