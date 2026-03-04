# Lango - Language Learning App Plan

## Overview

A mobile language learning app built with **React Native (Expo)** that teaches **Spanish** and **Italian** from **Serbian** and **English**. Combines structured lessons with AI-powered conversation practice.

---

## Language Matrix

| Learning    | From Serbian | From English |
|-------------|-------------|-------------|
| Spanish     | SR → ES     | EN → ES     |
| Italian     | SR → IT     | EN → IT     |

Users pick their native language (Serbian or English) and target language (Spanish or Italian) at onboarding. They can switch anytime.

---

## Tech Stack

| Layer        | Technology                        |
|-------------|-----------------------------------|
| Mobile      | Expo (SDK 52) + Expo Router v4    |
| UI          | React Native Paper + custom       |
| State       | Zustand (local) + React Query     |
| Backend     | Firebase (Auth, Firestore, Functions) |
| AI          | Claude API (Anthropic)            |
| Language    | TypeScript                        |
| Testing     | Jest + React Native Testing Library |

---

## Core Features

### 1. Onboarding & Auth
- Firebase Auth (email/password + Google Sign-In)
- Language pair selection (native → target)
- Proficiency level: Beginner / Intermediate / Advanced
- Profile screen with language switch option

### 2. Structured Lessons
Each lesson contains a mix of:
- **Vocabulary** — new words with translations, pronunciation hints, example sentences
- **Grammar** — rules explained in native language, with examples
- **Exercises** — multiple choice, fill-in-the-blank, matching, translation
- **Mini quiz** — end-of-lesson assessment

Lesson structure:
```
Course (e.g., Spanish from English)
  └── Unit (e.g., "Greetings & Basics")
       └── Lesson (e.g., "Meeting People")
            ├── Vocabulary section (8-12 words)
            ├── Grammar note
            ├── Practice exercises (5-8)
            └── Quiz (5 questions)
```

Content is stored as **static JSON data files** in the app, organized by:
```
content/
  ├── en-es/          # English → Spanish
  │    ├── units.json
  │    ├── unit-1/
  │    │    ├── lesson-1.json
  │    │    ├── lesson-2.json
  │    │    └── ...
  │    └── ...
  ├── en-it/          # English → Italian
  ├── sr-es/          # Serbian → Spanish
  └── sr-it/          # Serbian → Italian
```

### 3. AI Conversation Practice
- Chat-based interface where users practice with Claude
- Claude acts as a conversation partner in the target language
- Provides corrections, hints, and explanations in the native language
- Conversation topics tied to lesson content (reinforcement)
- Claude API called via Firebase Cloud Functions (keeps API key server-side)

### 4. Progress Tracking
Stored in Firestore per user:
- Lesson completion status
- Quiz scores
- Words learned / mastered
- Streak tracking (daily practice)
- XP / points system for gamification

### 5. Spaced Repetition Review
- Words from completed lessons enter a review queue
- SM-2 algorithm for scheduling reviews
- Daily review sessions with flashcard-style interface
- Track mastery level per word (new → learning → mastered)

---

## App Navigation (Expo Router)

```
(auth)/
  ├── login.tsx
  ├── register.tsx
  └── onboarding.tsx

(tabs)/
  ├── home.tsx          # Dashboard: current progress, continue lesson, streak
  ├── lessons/
  │    ├── index.tsx    # Unit list
  │    ├── [unitId].tsx # Lesson list within unit
  │    └── [lessonId].tsx # Lesson player
  ├── practice.tsx      # AI conversation practice
  ├── review.tsx        # Spaced repetition review
  └── profile.tsx       # Settings, language switch, stats
```

---

## Data Models (Firestore)

### User
```
users/{uid}
  - email
  - displayName
  - nativeLanguage: "en" | "sr"
  - targetLanguage: "es" | "it"
  - level: "beginner" | "intermediate" | "advanced"
  - xp: number
  - streak: number
  - lastActiveDate: timestamp
  - createdAt: timestamp
```

### Progress
```
users/{uid}/progress/{courseId}
  - completedLessons: string[]
  - quizScores: { [lessonId]: number }
  - currentUnit: string
  - currentLesson: string
```

### Vocabulary Progress
```
users/{uid}/vocabulary/{wordId}
  - word: string
  - translation: string
  - easeFactor: number      # SM-2
  - interval: number        # days
  - repetitions: number
  - nextReview: timestamp
  - mastery: "new" | "learning" | "mastered"
```

### Conversation History
```
users/{uid}/conversations/{conversationId}
  - messages: array
  - topic: string
  - lessonId: string
  - createdAt: timestamp
```

---

## AI Integration (Claude API)

Claude is used for:
1. **Conversation practice** — role-play dialogues in target language
2. **Exercise generation** — generate additional practice beyond static content
3. **Explanations** — explain grammar rules or word usage when user asks
4. **Corrections** — correct user's sentences with explanations

System prompt will include:
- User's native and target language
- Current proficiency level
- Current lesson context / vocabulary
- Instructions to respond in target language with native language hints

API calls go through **Firebase Cloud Functions** to keep the API key secure.

---

## Implementation Phases

### Phase 1: Foundation (MVP)
1. Expo project setup with TypeScript
2. Expo Router navigation structure
3. Firebase setup (Auth + Firestore)
4. Authentication flow (register/login/onboarding)
5. Static content structure + 1 unit of Spanish from English content
6. Lesson player (vocabulary display, exercises, quiz)
7. Basic progress tracking
8. Home dashboard

### Phase 2: AI & Review
9. Firebase Cloud Functions setup
10. Claude API integration for conversation practice
11. Conversation practice screen
12. Spaced repetition system (SM-2)
13. Review screen with flashcards
14. XP / gamification system

### Phase 3: Full Content & Polish
15. Content for all 4 language pairs (at least 3 units each)
16. AI-generated supplementary exercises
17. Streak tracking + push notifications
18. Profile + settings screen
19. UI polish, animations, dark mode
20. Testing + bug fixes

### Phase 4: Deployment
21. App icons + splash screen
22. EAS Build configuration
23. App Store / Play Store submission

---

## Content Strategy

For the initial build:
- **Manually create** 2-3 units for English → Spanish (as reference)
- **Use Claude** to help generate content for the other 3 language pairs based on the same structure
- Each unit has 5-7 lessons
- Each lesson introduces 8-12 new words + 1 grammar concept
- Aim for ~200 vocabulary words per language pair in MVP

Topic progression (beginner):
1. Greetings & Introductions
2. Numbers, Colors, Days
3. Family & People
4. Food & Drink
5. Directions & Places
6. Daily Routines
7. Shopping & Money

---

## Key Dependencies

```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "react-native-paper": "^5.x",
  "@react-native-firebase/app": "^21.x",
  "@react-native-firebase/auth": "^21.x",
  "@react-native-firebase/firestore": "^21.x",
  "zustand": "^5.x",
  "@tanstack/react-query": "^5.x",
  "typescript": "^5.x"
}
```

---

## Open Questions / Decisions for Later
- Audio/pronunciation: Add text-to-speech later? (expo-speech is available)
- Offline mode: Cache lessons locally with AsyncStorage?
- Social features: Leaderboards, friend challenges?
- Monetization: Free with ads? Premium subscription?
