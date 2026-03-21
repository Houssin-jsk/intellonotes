/**
 * Seed script for IntelloNotes local development.
 * Run with: npx tsx src/lib/db/seed.ts
 * Or: npm run db:seed
 */

import bcrypt from "bcryptjs";
import { db } from "./index";
import { users, courses, lessons, quizzes } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  const adminHash = await bcrypt.hash("Admin@IntelloNotes2024!", 12);
  const profHash = await bcrypt.hash("Prof@IntelloNotes2024!", 12);
  const studentHash = await bcrypt.hash("Student@IntelloNotes2024!", 12);

  // ── Users ────────────────────────────────────────────────────────────────────
  db.insert(users)
    .values([
      {
        id: "00000000-0000-0000-0000-000000000001",
        email: "admin@intellonotes.ma",
        name: "Admin",
        role: "admin",
        password_hash: adminHash,
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        email: "prof.ahmed@intellonotes.ma",
        name: "Prof. Ahmed Benali",
        role: "professor",
        password_hash: profHash,
        bio: "Enseignant en informatique avec 10 ans d'expérience à l'Université Mohammed V.",
        expertise: "Python, JavaScript, Algorithmes",
      },
      {
        id: "00000000-0000-0000-0000-000000000003",
        email: "student@intellonotes.ma",
        name: "Karim Idrissi",
        role: "student",
        password_hash: studentHash,
      },
    ])
    .onConflictDoNothing()
    .run();

  console.log("  ✓ Users seeded");

  // ── Courses ──────────────────────────────────────────────────────────────────
  db.insert(courses)
    .values([
      {
        id: "00000000-0000-0000-0000-000000000010",
        professor_id: "00000000-0000-0000-0000-000000000002",
        title: "Python pour débutants",
        description:
          "Apprenez les bases de Python : variables, boucles, fonctions et structures de données. Cours conçu pour les étudiants sans expérience préalable en programmation.",
        language: "python",
        level: "beginner",
        price: 56,
        status: "approved",
      },
      {
        id: "00000000-0000-0000-0000-000000000011",
        professor_id: "00000000-0000-0000-0000-000000000002",
        title: "JavaScript essentiel",
        description:
          "Maîtrisez les fondamentaux de JavaScript : DOM, événements, fonctions et ES6+. Idéal pour créer des pages web interactives.",
        language: "javascript",
        level: "beginner",
        price: 68,
        status: "approved",
      },
      {
        id: "00000000-0000-0000-0000-000000000012",
        professor_id: "00000000-0000-0000-0000-000000000002",
        title: "Java — Programmation orientée objet",
        description:
          "Comprendre la POO avec Java : classes, héritage, interfaces et gestion des exceptions.",
        language: "java",
        level: "intermediate",
        price: 78,
        status: "pending",
      },
    ])
    .onConflictDoNothing()
    .run();

  console.log("  ✓ Courses seeded");

  // ── Lessons for Python course ─────────────────────────────────────────────────
  db.insert(lessons)
    .values([
      {
        id: "10000000-0000-0000-0000-000000000001",
        course_id: "00000000-0000-0000-0000-000000000010",
        axis_number: 1,
        title: "Introduction à Python",
        content:
          "Python est un langage de programmation interprété, simple et lisible. Dans ce cours, vous allez apprendre à écrire vos premiers programmes Python.",
        display_order: 1,
      },
      {
        id: "10000000-0000-0000-0000-000000000002",
        course_id: "00000000-0000-0000-0000-000000000010",
        axis_number: 2,
        title: "Variables et types de données",
        content:
          "En Python, les variables sont déclarées sans type explicite. Les types principaux sont : int, float, str, bool, list, dict, tuple.",
        display_order: 1,
      },
      {
        id: "10000000-0000-0000-0000-000000000003",
        course_id: "00000000-0000-0000-0000-000000000010",
        axis_number: 3,
        title: "Exercices pratiques : boucles et fonctions",
        content:
          "Mettez en pratique les boucles for/while et la définition de fonctions avec def.",
        display_order: 1,
      },
      {
        id: "10000000-0000-0000-0000-000000000004",
        course_id: "00000000-0000-0000-0000-000000000010",
        axis_number: 4,
        title: "Synthèse : récapitulatif Python",
        content:
          "Résumé des points clés : variables, conditions, boucles, fonctions, listes.",
        display_order: 1,
      },
      {
        id: "10000000-0000-0000-0000-000000000005",
        course_id: "00000000-0000-0000-0000-000000000010",
        axis_number: 5,
        title: "Évaluation finale",
        content:
          "Évaluation complète des connaissances acquises dans ce cours Python.",
        display_order: 1,
      },
    ])
    .onConflictDoNothing()
    .run();

  console.log("  ✓ Lessons seeded");

  // ── Quizzes for Python course ─────────────────────────────────────────────────
  db.insert(quizzes)
    .values([
      {
        lesson_id: "10000000-0000-0000-0000-000000000001",
        axis_number: 1,
        questions: [
          {
            id: "q1",
            type: "mcq",
            text: "Parmi ces langages, lequel est connu pour sa lisibilité et sa simplicité ?",
            options: ["C++", "Assembly", "Python", "Java"],
            correct_index: 2,
            explanation:
              "Python est reconnu pour sa syntaxe claire et lisible, proche du langage naturel.",
          },
        ],
        passing_score: 0,
      },
      {
        lesson_id: "10000000-0000-0000-0000-000000000002",
        axis_number: 2,
        questions: [
          {
            id: "q1",
            type: "mcq",
            text: "Quel est le type de la valeur 3.14 en Python ?",
            options: ["int", "float", "str", "bool"],
            correct_index: 1,
            explanation: "3.14 est un nombre décimal, donc de type float.",
          },
          {
            id: "q2",
            type: "mcq",
            text: "Comment déclarer une liste vide en Python ?",
            options: ["list = {}", "list = ()", "list = []", "list = <>"],
            correct_index: 2,
            explanation:
              "Les crochets [] créent une liste vide. {} crée un dictionnaire, () un tuple.",
          },
        ],
        passing_score: 0,
      },
      {
        lesson_id: "10000000-0000-0000-0000-000000000003",
        axis_number: 3,
        questions: [
          {
            id: "q1",
            type: "mcq",
            text: "Quelle est la syntaxe correcte pour définir une fonction en Python ?",
            options: [
              "function maFonction():",
              "def maFonction():",
              "func maFonction():",
              "define maFonction():",
            ],
            correct_index: 1,
            explanation:
              "En Python, on utilise le mot-clé def pour définir une fonction.",
          },
          {
            id: "q2",
            type: "fill_blank",
            text: "Pour répéter un bloc de code 5 fois, on utilise : {{BLANK}} i in range(5):",
            correct_answers: ["for"],
            case_sensitive: true,
            explanation:
              "La boucle for est utilisée pour itérer sur une séquence.",
          },
          {
            id: "q3",
            type: "mcq",
            text: "Que retourne range(3) ?",
            options: ["[1, 2, 3]", "[0, 1, 2]", "[0, 1, 2, 3]", "[1, 2]"],
            correct_index: 1,
            explanation:
              "range(3) génère les nombres 0, 1, 2 (commence à 0, s'arrête avant 3).",
          },
        ],
        passing_score: 0,
      },
      {
        lesson_id: "10000000-0000-0000-0000-000000000004",
        axis_number: 4,
        questions: [
          {
            id: "q1",
            type: "true_false",
            text: "En Python, les listes sont immuables.",
            correct_answer: false,
            explanation:
              "Les listes sont mutables (modifiables). Les tuples sont immuables.",
          },
          {
            id: "q2",
            type: "true_false",
            text: "Python utilise l'indentation pour délimiter les blocs de code.",
            correct_answer: true,
            explanation:
              "Contrairement à d'autres langages qui utilisent des accolades {}, Python utilise l'indentation.",
          },
        ],
        passing_score: 0,
      },
      {
        lesson_id: "10000000-0000-0000-0000-000000000005",
        axis_number: 5,
        questions: [
          {
            id: "q1",
            type: "mcq",
            text: "Quel mot-clé définit une fonction en Python ?",
            options: ["func", "def", "function", "define"],
            correct_index: 1,
            explanation: "def est le mot-clé Python pour définir une fonction.",
          },
          {
            id: "q2",
            type: "mcq",
            text: "Quel est le type de la valeur True en Python ?",
            options: ["int", "str", "bool", "float"],
            correct_index: 2,
            explanation:
              "True et False sont des valeurs booléennes de type bool.",
          },
          {
            id: "q3",
            type: "mcq",
            text: "Quelle fonction affiche du texte dans la console ?",
            options: ["echo()", "console.log()", "print()", "write()"],
            correct_index: 2,
            explanation: "print() est la fonction Python pour afficher du texte.",
          },
          {
            id: "q4",
            type: "mcq",
            text: "Comment accéder au dernier élément de la liste L ?",
            options: ["L[0]", "L[-1]", "L[last]", "L.end()"],
            correct_index: 1,
            explanation: "L[-1] retourne le dernier élément en Python.",
          },
          {
            id: "q5",
            type: "mcq",
            text: "Quel opérateur effectue la division entière ?",
            options: ["/", "//", "%", "**"],
            correct_index: 1,
            explanation: "// effectue la division entière (floor division).",
          },
          {
            id: "q6",
            type: "true_false",
            text: "range(5) génère les nombres de 1 à 5.",
            correct_answer: false,
            explanation: "range(5) génère 0, 1, 2, 3, 4 — commence à 0.",
          },
          {
            id: "q7",
            type: "true_false",
            text: "En Python 3, print() est une fonction.",
            correct_answer: true,
            explanation:
              "En Python 3, print() est une fonction et nécessite des parenthèses.",
          },
          {
            id: "q8",
            type: "true_false",
            text: "Un dictionnaire Python est une collection ordonnée de paires clé-valeur.",
            correct_answer: true,
            explanation:
              "Depuis Python 3.7+, les dictionnaires maintiennent l'ordre d'insertion.",
          },
          {
            id: "q9",
            type: "fill_blank",
            text: "Le mot-clé pour définir une fonction en Python est {{BLANK}}.",
            correct_answers: ["def"],
            case_sensitive: true,
            explanation: "def est utilisé pour définir une fonction.",
          },
          {
            id: "q10",
            type: "fill_blank",
            text: "Pour importer le module math, on écrit : {{BLANK}} math",
            correct_answers: ["import"],
            case_sensitive: true,
            explanation: "Le mot-clé import charge un module.",
          },
          {
            id: "q11",
            type: "fill_blank",
            text: "La structure pour gérer les erreurs en Python est : {{BLANK}}/except",
            correct_answers: ["try"],
            case_sensitive: true,
            explanation:
              "try/except permet de capturer et gérer les exceptions.",
          },
          {
            id: "q12",
            type: "mcq",
            text: "Quelle méthode ajoute un élément à la fin d'une liste ?",
            options: [".add()", ".push()", ".append()", ".insert()"],
            correct_index: 2,
            explanation:
              ".append() ajoute un élément à la fin d'une liste Python.",
          },
        ],
        passing_score: 70,
      },
    ])
    .onConflictDoNothing()
    .run();

  console.log("  ✓ Quizzes seeded");
  console.log("\n✅ Seeding complete!");
  console.log("\nDev credentials:");
  console.log("  admin@intellonotes.ma     / Admin@IntelloNotes2024!");
  console.log("  prof.ahmed@intellonotes.ma / Prof@IntelloNotes2024!");
  console.log("  student@intellonotes.ma   / Student@IntelloNotes2024!");
}

seed().catch(console.error);
