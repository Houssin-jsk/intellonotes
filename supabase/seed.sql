-- Seed: IntelloNotes local development data
-- Run after: npx supabase db reset
--
-- NOTE: Auth users must be created via the Supabase dashboard or admin API.
-- The trigger handle_new_user() will auto-populate public.users.
-- These inserts use ON CONFLICT to safely re-run.

-- ============================================================
-- Admin user
-- UUID must match the auth.users id created via admin API or dashboard.
-- For local dev, create via: npx supabase auth admin create-user
-- ============================================================
INSERT INTO public.users (id, email, name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@intellonotes.ma',
  'Admin',
  'admin'
) ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ============================================================
-- Sample professor
-- ============================================================
INSERT INTO public.users (id, email, name, role, bio, expertise)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'prof.ahmed@intellonotes.ma',
  'Prof. Ahmed Benali',
  'professor',
  'Enseignant en informatique avec 10 ans d''expérience à l''Université Mohammed V.',
  'Python, JavaScript, Algorithmes'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Sample student
-- ============================================================
INSERT INTO public.users (id, email, name, role)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'student@intellonotes.ma',
  'Karim Idrissi',
  'student'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Sample approved course (Python)
-- ============================================================
INSERT INTO public.courses (id, professor_id, title, description, language, level, price, status)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000002',
  'Python pour débutants',
  'Apprenez les bases de Python : variables, boucles, fonctions et structures de données. Cours conçu pour les étudiants sans expérience préalable en programmation.',
  'python',
  'beginner',
  56,
  'approved'
) ON CONFLICT (id) DO NOTHING;

-- Sample approved course (JavaScript)
INSERT INTO public.courses (id, professor_id, title, description, language, level, price, status)
VALUES (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000002',
  'JavaScript essentiel',
  'Maîtrisez les fondamentaux de JavaScript : DOM, événements, fonctions et ES6+. Idéal pour créer des pages web interactives.',
  'javascript',
  'beginner',
  68,
  'approved'
) ON CONFLICT (id) DO NOTHING;

-- Sample pending course (Java)
INSERT INTO public.courses (id, professor_id, title, description, language, level, price, status)
VALUES (
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000002',
  'Java — Programmation orientée objet',
  'Comprendre la POO avec Java : classes, héritage, interfaces et gestion des exceptions.',
  'java',
  'intermediate',
  78,
  'pending'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Lessons for Python course (one lesson per axis)
-- ============================================================
INSERT INTO public.lessons (id, course_id, axis_number, title, content, display_order)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 1,
   'Introduction à Python',
   'Python est un langage de programmation interprété, simple et lisible. Dans ce cours, vous allez apprendre à écrire vos premiers programmes Python.',
   1),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 2,
   'Variables et types de données',
   'En Python, les variables sont déclarées sans type explicite. Les types principaux sont : int, float, str, bool, list, dict, tuple.',
   1),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 3,
   'Exercices pratiques : boucles et fonctions',
   'Mettez en pratique les boucles for/while et la définition de fonctions avec def.',
   1),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 4,
   'Synthèse : récapitulatif Python',
   'Résumé des points clés : variables, conditions, boucles, fonctions, listes.',
   1),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', 5,
   'Évaluation finale',
   'Évaluation complète des connaissances acquises dans ce cours Python.',
   1)
ON CONFLICT (course_id, axis_number, display_order) DO NOTHING;

-- ============================================================
-- Quizzes for Python course
-- ============================================================

-- Axe 1: intro quiz (1 MCQ, no minimum score)
INSERT INTO public.quizzes (lesson_id, axis_number, questions, passing_score)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  1,
  '[
    {
      "id": "q1",
      "type": "mcq",
      "text": "Parmi ces langages, lequel est connu pour sa lisibilité et sa simplicité ?",
      "options": ["C++", "Assembly", "Python", "Java"],
      "correct_index": 2,
      "explanation": "Python est reconnu pour sa syntaxe claire et lisible, proche du langage naturel."
    }
  ]'::jsonb,
  0
) ON CONFLICT (lesson_id) DO NOTHING;

-- Axe 2: theory quiz (2 MCQ, no minimum score)
INSERT INTO public.quizzes (lesson_id, axis_number, questions, passing_score)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  2,
  '[
    {
      "id": "q1",
      "type": "mcq",
      "text": "Quel est le type de la valeur 3.14 en Python ?",
      "options": ["int", "float", "str", "bool"],
      "correct_index": 1,
      "explanation": "3.14 est un nombre décimal, donc de type float."
    },
    {
      "id": "q2",
      "type": "mcq",
      "text": "Comment déclarer une liste vide en Python ?",
      "options": ["list = {}", "list = ()", "list = []", "list = <>"],
      "correct_index": 2,
      "explanation": "Les crochets [] créent une liste vide. {} crée un dictionnaire, () un tuple."
    }
  ]'::jsonb,
  0
) ON CONFLICT (lesson_id) DO NOTHING;

-- Axe 3: practice quiz (3 questions, no minimum score)
INSERT INTO public.quizzes (lesson_id, axis_number, questions, passing_score)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  3,
  '[
    {
      "id": "q1",
      "type": "mcq",
      "text": "Quelle est la syntaxe correcte pour définir une fonction en Python ?",
      "options": ["function maFonction():", "def maFonction():", "func maFonction():", "define maFonction():"],
      "correct_index": 1,
      "explanation": "En Python, on utilise le mot-clé def pour définir une fonction."
    },
    {
      "id": "q2",
      "type": "fill_blank",
      "text": "Pour répéter un bloc de code 5 fois, on utilise : {{BLANK}} i in range(5):",
      "correct_answers": ["for"],
      "case_sensitive": true,
      "explanation": "La boucle for est utilisée pour itérer sur une séquence."
    },
    {
      "id": "q3",
      "type": "mcq",
      "text": "Que retourne range(3) ?",
      "options": ["[1, 2, 3]", "[0, 1, 2]", "[0, 1, 2, 3]", "[1, 2]"],
      "correct_index": 1,
      "explanation": "range(3) génère les nombres 0, 1, 2 (commence à 0, s''arrête avant 3)."
    }
  ]'::jsonb,
  0
) ON CONFLICT (lesson_id) DO NOTHING;

-- Axe 4: synthesis quiz (2 questions, no minimum score)
INSERT INTO public.quizzes (lesson_id, axis_number, questions, passing_score)
VALUES (
  '10000000-0000-0000-0000-000000000004',
  4,
  '[
    {
      "id": "q1",
      "type": "true_false",
      "text": "En Python, les listes sont immuables.",
      "correct_answer": false,
      "explanation": "Les listes sont mutables (modifiables). Les tuples sont immuables."
    },
    {
      "id": "q2",
      "type": "true_false",
      "text": "Python utilise l''indentation pour délimiter les blocs de code.",
      "correct_answer": true,
      "explanation": "Contrairement à d''autres langages qui utilisent des accolades {}, Python utilise l''indentation."
    }
  ]'::jsonb,
  0
) ON CONFLICT (lesson_id) DO NOTHING;

-- Axe 5: final evaluation (12 questions, 70% minimum)
INSERT INTO public.quizzes (lesson_id, axis_number, questions, passing_score)
VALUES (
  '10000000-0000-0000-0000-000000000005',
  5,
  '[
    {"id":"q1","type":"mcq","text":"Quel mot-clé définit une fonction en Python ?","options":["func","def","function","define"],"correct_index":1,"explanation":"def est le mot-clé Python pour définir une fonction."},
    {"id":"q2","type":"mcq","text":"Quel est le type de la valeur True en Python ?","options":["int","str","bool","float"],"correct_index":2,"explanation":"True et False sont des valeurs booléennes de type bool."},
    {"id":"q3","type":"mcq","text":"Quelle fonction affiche du texte dans la console ?","options":["echo()","console.log()","print()","write()"],"correct_index":2,"explanation":"print() est la fonction Python pour afficher du texte."},
    {"id":"q4","type":"mcq","text":"Comment accéder au dernier élément de la liste L ?","options":["L[0]","L[-1]","L[last]","L.end()"],"correct_index":1,"explanation":"L[-1] retourne le dernier élément en Python."},
    {"id":"q5","type":"mcq","text":"Quel opérateur effectue la division entière ?","options":["/","//","%","**"],"correct_index":1,"explanation":"// effectue la division entière (floor division)."},
    {"id":"q6","type":"true_false","text":"range(5) génère les nombres de 1 à 5.","correct_answer":false,"explanation":"range(5) génère 0, 1, 2, 3, 4 — commence à 0."},
    {"id":"q7","type":"true_false","text":"En Python 3, print() est une fonction.","correct_answer":true,"explanation":"En Python 3, print() est une fonction et nécessite des parenthèses."},
    {"id":"q8","type":"true_false","text":"Un dictionnaire Python est une collection ordonnée de paires clé-valeur.","correct_answer":true,"explanation":"Depuis Python 3.7+, les dictionnaires maintiennent l''ordre d''insertion."},
    {"id":"q9","type":"fill_blank","text":"Le mot-clé pour définir une fonction en Python est {{BLANK}}.","correct_answers":["def"],"case_sensitive":true,"explanation":"def est utilisé pour définir une fonction."},
    {"id":"q10","type":"fill_blank","text":"Pour importer le module math, on écrit : {{BLANK}} math","correct_answers":["import"],"case_sensitive":true,"explanation":"Le mot-clé import charge un module."},
    {"id":"q11","type":"fill_blank","text":"La structure pour gérer les erreurs en Python est : {{BLANK}}/except","correct_answers":["try"],"case_sensitive":true,"explanation":"try/except permet de capturer et gérer les exceptions."},
    {"id":"q12","type":"mcq","text":"Quelle méthode ajoute un élément à la fin d''une liste ?","options":[".add()",".push()",".append()",".insert()"],"correct_index":2,"explanation":".append() ajoute un élément à la fin d''une liste Python."}
  ]'::jsonb,
  70
) ON CONFLICT (lesson_id) DO NOTHING;
