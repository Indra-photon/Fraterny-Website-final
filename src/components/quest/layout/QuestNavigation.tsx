import React, {useState} from 'react';
import { motion } from 'framer-motion';
import { useQuest } from '../core/useQuest';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getWordValidationStatus } from '../utils/questValidation';
import { HonestyTag } from '../core/types';
import { toast } from 'sonner';

interface QuestNavigationProps {
  showPrevious?: boolean;
  showNext?: boolean;
  showSkip?: boolean;
  showFinish?: boolean;
  onFinish?: () => void;
  className?: string;
}

/**
 * Navigation controls for the quest system
 * Provides buttons for navigating between questions and sections
 */
export function QuestNavigation({
  showPrevious = true,
  showNext = true,
  showSkip = true,
  showFinish = true,
  onFinish,
  className = ''
}: QuestNavigationProps) {
  const { 
    session, 
    currentQuestion,
    questions,
    allQuestions,
    currentSection,
    nextQuestion,
    previousQuestion,
    submitResponse,
    changeSection,
    sections,           // ADD this
  currentSectionId,
  trackQuestionView,
  stopQuestionTracking
  } = useQuest();
  
  // Determine if this is the last question in the section
  // const isLastQuestion = session && 
  //   questions.length > 0 && 
  //   session.currentQuestionIndex === questions.length - 1;

  const [showConfirmation, setShowConfirmation] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

  const isLastQuestionInSection = session && 
  questions.length > 0 && 
  session.currentQuestionIndex === questions.length - 1;

  const isLastQuestionInEntireAssessment = () => {
  if (!session || !currentSection) return false;
  
  // Check if current section is the last section
  const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);
  const isLastSection = currentSectionIndex === sections.length - 1;
  
  // Check if current question is last in this section
  const isLastQuestionInThisSection = session.currentQuestionIndex === questions.length - 1;
  
  return isLastSection && isLastQuestionInThisSection;
};

const isLastQuestion = isLastQuestionInEntireAssessment();

  const isFirstQuestionInEntireAssessment = () => {
  if (!session) return true;
  
  // Get current section index
  const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);
  
  // If we're in the first section AND on the first question of that section
  const isFirstSection = currentSectionIndex === 0;
  const isFirstQuestionInThisSection = session.currentQuestionIndex === 0;
  
  return isFirstSection && isFirstQuestionInThisSection;
};

const isFirstQuestion = isFirstQuestionInEntireAssessment();

const checkForUnfinishedQuestions = () => {
  
  // console.log(`Questions:`, allQuestions);
  // console.log(`Session responses:`, session?.responses);
  // console.log(`Current section:`, currentSection);
  // console.log(`Sections:`, sections);
  const unfinishedQuestions = allQuestions?.filter(question => {
    const response = session?.responses?.[question.id];
    return !response; // No response = unfinished
  }) || [];
  
  if (unfinishedQuestions.length > 0) {
    const firstUnfinishedQuestion = unfinishedQuestions[0];
    const sectionId = firstUnfinishedQuestion?.sectionId;
    const sectionName = sections?.find(s => s.id === sectionId)?.title || 'Unknown Section';
    
    return {
      hasUnfinished: true,
      sectionName: sectionName,
      count: unfinishedQuestions.length
    };
  }
  
  return { hasUnfinished: false };
};

const handleNext = () => {
  if (currentQuestion) {
    
    const getSelectedTagsFromQuestionCard = (): HonestyTag[] => {
      try {
        const saved = localStorage.getItem(`quest_tags_${currentQuestion.id}`);
        if (saved) {
          const tags = JSON.parse(saved);
          // console.log('🏷️ Navigation found saved tags in localStorage:', { questionId: currentQuestion.id, tags });
          return tags;
        }
      } catch (error) {
        console.error('Failed to load tags from localStorage:', error);
      }
      
      // Fallback: Try to read from DOM if localStorage approach doesn't work
      const tagButtons = document.querySelectorAll('[data-tag-selected="true"]');
      const selectedTags: HonestyTag[] = [];
      
      tagButtons.forEach(button => {
        const tagValue = button.getAttribute('data-tag-value') as HonestyTag;
        if (tagValue) {
          selectedTags.push(tagValue);
        }
      });
      
      // console.log('🏷️ Navigation found tags from DOM:', { questionId: currentQuestion.id, selectedTags });
      return selectedTags;
    };

    if (currentQuestion.type === 'text_input') {
      const currentTextarea = document.querySelector('textarea');
      if (currentTextarea && currentTextarea.value) {
        // Get the selected tags
        const selectedTags = getSelectedTagsFromQuestionCard();
        
        // console.log('💾 Navigation saving text response with tags:', {
        //   questionId: currentQuestion.id,
        //   response: currentTextarea.value,
        //   tags: selectedTags
        // });
        
        // Submit response with tags
        submitResponse(currentQuestion.id, currentTextarea.value, selectedTags);
      }
    } 
    else if (currentQuestion.type === 'multiple_choice') {
      // Handle multiple choice questions
      const selectedRadio = document.querySelector(`input[name="question-${currentQuestion.id}"]:checked`) as HTMLInputElement;
      if (selectedRadio) {
        const selectedTags = getSelectedTagsFromQuestionCard();
        
        console.log('💾 Navigation saving multiple choice response with tags:', {
          questionId: currentQuestion.id,
          response: selectedRadio.value,
          tags: selectedTags
        });
        
        submitResponse(currentQuestion.id, selectedRadio.value, selectedTags);
      }
    }
    else if (currentQuestion.type === 'ranking') {
      // Handle ranking questions - SIMPLE APPROACH
      // Ranking order is already saved on drag, we just need to save explanation
      const rankingContainer = document.querySelector('.ranking-response');
      if (rankingContainer) {
        const explanationTextarea = rankingContainer.querySelector('textarea');
        const explanation = explanationTextarea ? explanationTextarea.value : '';
        
        // Get existing response (which has the ranking order from drag events)
        const existingResponse = session?.responses?.[currentQuestion.id]?.response;
        
        if (existingResponse) {
          try {
            // Parse existing response and update explanation
            const existingData = JSON.parse(existingResponse);
            existingData.explanation = explanation;
            
            // Get selected tags
            const selectedTags = getSelectedTagsFromQuestionCard();
            
            console.log('💾 Navigation saving ranking response with tags:', {
              questionId: currentQuestion.id,
              data: existingData,
              tags: selectedTags
            });
            
            // Save updated response with new explanation and tags
            submitResponse(currentQuestion.id, JSON.stringify(existingData), selectedTags);
          } catch (e) {
            // Fallback: create new response if parsing fails
            const fallbackData = JSON.stringify({
              rankings: (currentQuestion.options || []).map((text, index) => ({
                id: `option-${index}`,
                text: text
              })),
              explanation: explanation
            });
            
            const selectedTags = getSelectedTagsFromQuestionCard();
            submitResponse(currentQuestion.id, fallbackData, selectedTags);
          }
        } else if (explanation) {
          // No existing response but has explanation - save basic structure
          const basicData = JSON.stringify({
            rankings: (currentQuestion.options || []).map((text, index) => ({
              id: `option-${index}`,
              text: text
            })),
            explanation: explanation
          });
          
          const selectedTags = getSelectedTagsFromQuestionCard();
          submitResponse(currentQuestion.id, basicData, selectedTags);
        }
      }
    }
    else if (currentQuestion.type === 'date_input') {
      // Try to find MUI DatePicker input first
    const currentDateInput = document.querySelector('input[placeholder*="date of birth"]') as HTMLInputElement ||
                            document.querySelector('.MuiInputBase-input') as HTMLInputElement ||
                            document.querySelector('input[type="date"]') as HTMLInputElement;
      console.log('💾 Date input value:', currentDateInput?.value);
      console.log('💾 Date input value:', currentDateInput?.value);
      // Add this new one:
      console.log('🔍 All inputs on page:', document.querySelectorAll('input'));
      if (currentDateInput && currentDateInput.value) {
        const selectedTags = getSelectedTagsFromQuestionCard();
        console.log('💾 Navigation saving date response with tags:', {
          questionId: currentQuestion.id,
          response: currentDateInput.value,
          tags: selectedTags
        });
        submitResponse(currentQuestion.id, currentDateInput.value, selectedTags);
      }
    }
    else {
      // For any other question type, still try to save tags if they exist
      const selectedTags = getSelectedTagsFromQuestionCard();
      if (selectedTags.length > 0) {
        console.log('💾 Navigation saving tags for other question type:', {
          questionId: currentQuestion.id,
          type: currentQuestion.type,
          tags: selectedTags
        });
        
        // Save with empty response but include tags
        submitResponse(currentQuestion.id, '', selectedTags);
      }
    }
  }

  // Check validation for text questions before proceeding
  if (currentQuestion?.type === 'text_input' && session?.responses?.[currentQuestion.id]) {
    const response = session.responses[currentQuestion.id].response;
    const wordValidation = getWordValidationStatus(response, 100, 90);
    
    if (!wordValidation.isValid) {
      return;
    }
  }
  
  // without checking of all questions answered
  if (isLastQuestionInSection) {
    // Always move to next section, ignore validation
    const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);
    const nextSectionIndex = currentSectionIndex + 1;
    
    if (nextSectionIndex < sections.length) {
      // Move to next section directly
      const nextSection = sections[nextSectionIndex];
      changeSection(nextSection.id);
    } else if (showFinish) {
      if (onFinish) {
        // onFinish();
        // setShowConfirmation(true);
      } else if (showFinish) {
        if (onFinish) {
          const unfinishedCheck = checkForUnfinishedQuestions();
          console.log('🔍 Unfinished questions check:', unfinishedCheck);
             
          if (unfinishedCheck.hasUnfinished) {
            toast.error(`Please complete all questions in the section "${unfinishedCheck.sectionName}" before finishing. Unfinished questions: ${unfinishedCheck.count}`
              ,{
                position: 'top-center',
              }
            );
            return; // Don't proceed
          }
          
          setShowConfirmation(true);
        }
      } 
      else {
        // finishQuest();
        console.warn('No onFinish callback provided - cannot finish quest without submission data');
      }
    }
  } else {
    nextQuestion();
  }

  // check if user has answered all questions in the section

    // Check if user has answered all questions before proceeding
if (isLastQuestionInSection) {
  const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);
  const nextSectionIndex = currentSectionIndex + 1;
  
  if (nextSectionIndex < sections.length) {
    // Move to next section directly
    const nextSection = sections[nextSectionIndex];
    changeSection(nextSection.id);
  } else if (showFinish) {
    // Last section, check for unfinished questions first
    if (onFinish) {
      const unfinishedCheck = checkForUnfinishedQuestions();
      console.log('🔍 Unfinished questions check:', unfinishedCheck);
            
      if (unfinishedCheck.hasUnfinished) {
        toast.error(`Please complete all questions before finishing the assessment.
Unfinished questions: ${unfinishedCheck.count}`,
          {
            position: 'top-center',
          }
        );
        return; // Don't proceed - THIS PREVENTS THE CONFIRMATION DIALOG
      }
      
      setShowConfirmation(true); // Only show if all questions are answered
    } else {
      console.warn('No onFinish callback provided - cannot finish quest without submission data');
      }
    }
  } else {
    nextQuestion();
}
};

const handleConfirmSubmission = async () => {
  setIsSubmitting(true);
  try {
    if (onFinish) {  // ← Add null check
       onFinish();
    }
    setShowConfirmation(false);
  } catch (error) {
    console.error('Submission failed:', error);
  } finally {
    setIsSubmitting(false);
  }
};



const handleCancelSubmission = () => {
  setShowConfirmation(false);
};
  
  // Button variants
  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    tap: { scale: 0.95 }
  };
  
  return (
    <>
      <nav className={`${className}`}>
        <div className="flex gap-1">
          {/* Previous button - ✨ UPDATED: Always enabled except on first question */}
          {/* {showPrevious && (
            <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileTap="tap"
            onClick={previousQuestion}
            disabled={isFirstQuestion}
            className={` ${
              isFirstQuestion
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-navy text-navy hover:bg-navy hover:text-white'
            }`}
          >
            Previous
          </motion.button>
        )} */}

        {showPrevious && (
          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileTap="tap"
            onClick={previousQuestion}
            disabled={isFirstQuestion}
            className={` ${
              isFirstQuestion
                ? 'hidden'
                : 'w-[70px] h-14 bg-white rounded-full border-2 border-neutral-400 justify-center items-center flex'
            }`}
          >
              <ChevronLeft className={`w-5 h-5 ${isFirstQuestion ? 'hidden' : 'block'}`} />
          </motion.button>
        )}

        {/* ✨ NEW - Skip button in center */}
        {/* <div className="flex gap-2">
          {showSkip && !isLastQuestion && (
            <motion.button
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileTap="tap"
              onClick={handleSkip}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 underline hover:no-underline transition-colors"
            >
              Skip for now
            </motion.button>
          )}
        </div> */}
        
        {/* Next/Finish button - ✨ UPDATED: Always enabled */}
        {/* {showNext && (
          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileTap="tap"
            onClick={handleNext}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
              isLastQuestion && showFinish
                ? 'bg-gold hover:bg-gold/90'
                : 'bg-terracotta hover:bg-terracotta/90'
            }`}
          >
            {isLastQuestion && showFinish ? 'Finish' : 'Next'}
          </motion.button>
        )} */}
        {showNext && (
          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileTap="tap"
            onClick={handleNext}
            className={`px-4 py-2 text-white text-sm font-medium transition-colors ${
              isLastQuestion && showFinish
                ? 'w-4/5 h-14 bg-gradient-to-br from-sky-800 to-sky-400 rounded-[36px] border-2 border-blue-950'
                : 'w-full h-14 bg-gradient-to-br from-sky-800 to-sky-400 rounded-[36px] border-2 border-blue-950'
            }`}
          >
            <div className='flex gap-1 justify-center items-center'>
              <div className="w-auto justify-center text-white text-2xl font-normal font-['Gilroy-Bold'] tracking-[-2px]">
              {isLastQuestion && showFinish ? 'Finish' : 'Next'}
              </div>
              <div className='h-full flex items-center justify-center pt-1'>
                <ChevronRight className='w-[1.5] h-[3]'/>
              </div>
            </div>
          </motion.button>
        )}
      </div>
    </nav>

    {showConfirmation && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
        >
          {/* <h3 className="text-2xl font-['Gilroy-semiBold'] text-navy mb-2">
            Submit Assessment
          </h3> */}
          <div className="text-gray-600 text-xl leading-6 font-['Gilroy-Regular'] mb-4">
            Satisfied with your answers? Press the confirm button to submit your response.
          </div>

          <div className="flex justify-start space-x-3">
            <button
              onClick={handleCancelSubmission}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xl font-normal font-['Gilroy-semiBold'] tracking-[-2px]"
              disabled={isSubmitting}
            >
              Go Back
            </button>
            
            <button
              onClick={handleConfirmSubmission}
              className="px-4 py-2 text-xl font-normal font-['Gilroy-Bold'] tracking-[-1px] bg-gradient-to-br from-sky-800 to-sky-400 text-white rounded-lg hover:opacity-90 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Confirm'}
            </button>
          </div>
        </motion.div>
      </div>
    )}
    </>
  );
  };

export default QuestNavigation;