import type { QuizQuestion } from "@/types/quiz";

export interface StudentAnswer {
  questionId: string;
  answer: number | boolean | string;
}

export interface GradingResult {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  details: {
    questionId: string;
    correct: boolean;
    correctAnswer: string;
  }[];
}

export function gradeQuiz(
  questions: QuizQuestion[],
  answers: StudentAnswer[],
  passingScore: number = 0
): GradingResult {
  const details = questions.map((q) => {
    const studentAnswer = answers.find((a) => a.questionId === q.id);

    if (!studentAnswer) {
      return { questionId: q.id, correct: false, correctAnswer: getCorrectAnswer(q) };
    }

    let isCorrect = false;

    switch (q.type) {
      case "mcq":
        isCorrect = studentAnswer.answer === q.correct_index;
        break;
      case "true_false":
        isCorrect = studentAnswer.answer === q.correct_answer;
        break;
      case "fill_blank": {
        const studentText = String(studentAnswer.answer).trim();
        isCorrect = q.correct_answers.some((valid) =>
          q.case_sensitive
            ? studentText === valid.trim()
            : studentText.toLowerCase() === valid.trim().toLowerCase()
        );
        break;
      }
    }

    return {
      questionId: q.id,
      correct: isCorrect,
      correctAnswer: getCorrectAnswer(q),
    };
  });

  const correct = details.filter((d) => d.correct).length;
  const total = questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    score,
    correct,
    total,
    passed: score >= passingScore,
    details,
  };
}

function getCorrectAnswer(q: QuizQuestion): string {
  switch (q.type) {
    case "mcq":
      return q.options[q.correct_index];
    case "true_false":
      // Return raw boolean string — callers must translate for display
      return String(q.correct_answer);
    case "fill_blank":
      return q.correct_answers[0];
  }
}
