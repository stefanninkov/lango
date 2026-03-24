# Lango — Remaining Implementation Plan

## Step 1: Fix Remaining Bugs & Web Polish
- Add confirmation dialog for "Reset All Progress" in settings (currently no confirmation)
- Ensure all touchable elements work on web (audit for any remaining `onTouchEnd` usage)
- Verify lesson player works end-to-end on web after route restructuring

## Step 2: Wire Up Notifications into App Flow
- Trigger streak reminder after lesson completion (call `scheduleStreakReminder()`)
- Trigger review reminder when spaced repetition cards become due
- Add notification handling to navigate to correct screen when tapped
- Test notification scheduling on native (already implemented, just needs wiring)

## Step 3: Add Test Step to CI Pipeline
- Add `npm test` step to `.github/workflows/deploy-web.yml` before the build step
- Ensure existing 9 test files pass in CI
- Add a few more critical tests:
  - Route navigation tests (unit → lesson flow)
  - Auth flow integration test
  - Gamification XP/level calculation tests

## Step 4: UI Polish & Animations
- Add smooth page transitions between lesson phases (vocabulary → grammar → exercises → quiz)
- Add haptic/visual feedback on correct/incorrect answers in exercises
- Add loading skeletons for screens that fetch data
- Improve web-specific styling (cursor: pointer on clickable elements, hover states)
- Add a confirmation dialog before closing a lesson in progress

## Step 5: Firebase Cloud Functions for Claude API
- Create `/functions` directory with Firebase Cloud Functions setup
- Move Claude API call to a Cloud Function (keeps API key server-side)
- Update `claudeChatService.ts` to call the Cloud Function endpoint instead of direct API
- Remove client-side API key storage from settings (or make it optional fallback)
- Add rate limiting to the Cloud Function

## Step 6: AI-Generated Supplementary Exercises
- Add a "Practice More" button after lesson completion
- Use Claude API (via Cloud Function) to generate additional exercises based on lesson vocabulary
- Cache generated exercises locally to avoid redundant API calls
- Support same exercise types: multiple choice, fill-blank, matching

## Step 7: EAS Build Configuration & Store Prep
- Complete `eas.json` with production build settings (iOS bundle ID, Android package)
- Add app store metadata (descriptions, keywords, screenshots)
- Configure code signing for iOS and Android
- Set up EAS Submit for automated store uploads
- Create privacy policy and terms of service pages
