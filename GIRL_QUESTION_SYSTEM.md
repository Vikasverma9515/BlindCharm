# Girl Question System - Interactive Matchmaking Feature

## Overview
The Girl Question System is an engaging matchmaking feature that allows girls to create questions for boys to answer, creating a more interactive and personalized matching experience in the lobby.

## How It Works

### For Girls (Female Users)
1. **Create Questions**: Girls can create up to 5 questions per lobby
   - **Multiple Choice Questions (MCQ)**: Auto-scored (10 points for correct, 0 for incorrect)
   - **Written Answer Questions**: Manually reviewed and scored by the girl (0-10 points)

2. **Review Written Answers**: Girls can review written answers from boys and award points based on creativity, humor, or how well they like the answer

3. **View Leaderboard**: See which boys are performing best and will be matched first

### For Boys (Male Users)
1. **Answer Questions**: Boys can answer available questions to earn points
   - MCQ answers are automatically scored
   - Written answers are reviewed by the girl who created the question

2. **Compete for Top Position**: The boy with the highest score gets matched first when the timer hits

3. **View Leaderboard**: Track their ranking and see how they compare to other boys

## Features

### Question Types
- **Multiple Choice Questions**: 
  - Girls provide 4 options and select the correct answer
  - Boys select one option
  - Automatically scored (10 points for correct answer)

- **Written Answer Questions**:
  - Open-ended questions that boys can answer creatively
  - Girls manually review and award 0-10 points based on their preference
  - Allows for personality and humor to shine through

### Scoring System
- **MCQ Questions**: 10 points for correct answer, 0 for incorrect
- **Written Questions**: 0-10 points awarded by the girl based on her preference
- **Leaderboard**: Boys ranked by total points, then by number of questions answered

### Real-time Updates
- Questions and answers update in real-time using Supabase subscriptions
- Leaderboard updates automatically as answers are reviewed
- Live scoring and ranking

### Matchmaking Integration
- The boy with the highest score gets matched first when the timer hits
- Creates competitive but fun environment
- Encourages thoughtful and creative answers

## User Interface

### Mobile View
- **Tab Navigation**: Switch between Chat and Q&A System
- **Responsive Design**: Optimized for mobile interaction
- **Touch-friendly**: Large buttons and easy-to-use interface

### Desktop View
- **Side-by-side Layout**: Participants list, main content (Chat/Q&A), 
- **Tab System**: Clean navigation between Chat and Q&A System
- **Full-featured**: All functionality available on desktop

### For Girls - Three Tabs:
1. **Create**: Create new questions (MCQ or Written)
2. **Review**: Review and score written answers
3. **Leaderboard**: View current rankings

### For Boys - Two Views:
1. **Answer Questions**: List of available questions to answer
2. **Leaderboard**: Current rankings and scores

## Database Schema

### Tables Created:
- `girl_questions`: Stores questions created by girls
- `question_answers`: Stores answers submitted by boys

### Key Features:
- **Row Level Security (RLS)**: Ensures data privacy and security
- **Automatic Scoring**: MCQ answers are auto-scored via database triggers
- **Question Limits**: Girls limited to 5 questions per lobby
- **Duplicate Prevention**: Boys can't answer the same question twice

## Benefits

### Engagement
- Makes lobby time more interactive and fun
- Gives users something to do while waiting for matches
- Creates conversation starters

### Better Matching
- Boys with higher scores (showing effort and compatibility) get matched first
- Girls can see personality through written answers
- More informed matching decisions

### Gamification
- Point system creates friendly competition
- Leaderboard encourages participation
- Achievement-based matching

## Technical Implementation

### Frontend
- React component with TypeScript
- Framer Motion animations
- Real-time updates via Supabase subscriptions
- Responsive design with Tailwind CSS

### Backend
- Supabase database with PostgreSQL
- Row Level Security policies
- Database triggers for auto-scoring
- Real-time subscriptions

### Security
- User authentication required
- Gender-based access control
- Lobby participation verification
- Data privacy through RLS

## Usage Instructions

1. **Join a Lobby**: Users must be in a lobby to participate
2. **Girls Create Questions**: Use the "Create" tab to add questions
3. **Boys Answer Questions**: Available questions appear in the Q&A tab
4. **Girls Review Answers**: Written answers appear in the "Review" tab
5. **Check Leaderboard**: See current rankings and top performer
6. **Automatic Matching**: Top scorer gets matched when timer hits

This system transforms the lobby from a simple waiting room into an engaging, interactive experience that helps create better matches based on compatibility and effort.