import React from 'react';
import { motion } from 'framer-motion';
import { QuestionCard } from './QuestionCard';
import { DifficultyQuestionCardProps } from './types';

/**
 * Medium difficulty question card
 * Styled with navy accents for medium difficulty questions
 */
export function MediumQuestionCard(props: DifficultyQuestionCardProps) {
  return (
    <QuestionCard
      {...props}
      className={`${props.className || ''}`}
    />
  );
}

export default MediumQuestionCard;