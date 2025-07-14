// // src/components/quest/views/QuestCompletion.tsx

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import QuestLayout from '../layout/QuestLayout';
// import CompletionEffects from '../effects/CompletionEffects';
// import CompletionCelebration from '../progress/CompletionCelebration';
// import QuestSummary from './QuestSummary'; // Assuming this component exists
// import { useQuest } from '../core/useQuest';
// import { useAuth } from '../../../contexts/AuthContext'; // Adjust path as needed
// import { supabase } from '../../../integrations/supabase/client'; // Adjust path as needed
// import axios from 'axios'

// export interface QuestCompletionProps {
//   onRestart?: () => void;
//   onComplete?: () => void;
//   className?: string;
// }

// export function QuestCompletion({
//   onRestart,
//   onComplete,
//   className = ''
// }: QuestCompletionProps) {
//   const navigate = useNavigate();
//   const { 
//     session, 
//     finishQuest, 
//     resetQuest,
//     changeSection,
//     currentSectionId,
//     isSubmitting,
//     allQuestions,
//     sections
//   } = useQuest();
  
//   // Add auth context to get user data
//   const auth = useAuth();
  
//   const [showSummary, setShowSummary] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [result, setResult] = useState<any>(null);
//   const [showThankYou, setShowThankYou] = useState(false);
  
//   // Function to store session history in database
//   const storeSessionHistory = async (sessionId: string) => {
//     // Check if user is authenticated
//     if (!auth.user?.id) {
//       console.warn('Cannot store session history: No user ID available');
//       return;
//     }
    
//     try {
//       // Perform insert operation
//       const { data, error } = await supabase
//         .from('user_session_history')
//         .insert({
//           user_id: auth.user.id,
//           session_id: sessionId,
//           created_at: new Date().toISOString()
//         });
      
//       // Handle errors
//       if (error) {
//         console.error('Failed to store session history:', error);
//         // Note: We don't throw here to avoid blocking the main flow
//       } else {
//         console.log('Session history stored successfully');
//       }
//     } catch (err) {
//       console.error('Error storing session history:', err);
//       // Note: We don't re-throw to avoid blocking the main flow
//     }
//   };
  
//   // Handle going back to the assessment
//   const handleBack = () => {
//     setShowSummary(false);
//   };
  
//   // Format session data for submission
//   const formatSubmissionData = () => {
//     if (!session) return null;
    
//     // Get user information from auth context
//     const userData = {
//       user_id: auth.user?.id || session.userId,
//       name: auth.user?.user_metadata?.first_name 
//         ? `${auth.user.user_metadata.first_name} ${auth.user.user_metadata.last_name || ''}`
//         : 'User',
//       email: auth.user?.email || 'user@example.com',
//       // Add these new fields
//       "mobile no": auth.user?.user_metadata?.phone || "",
//       city: auth.user?.user_metadata?.city || "",
//       DOB: auth.user?.user_metadata?.dob || undefined // Optional field
//     };
    
//     // Calculate completion time and duration
//     const startTime = session.startedAt;
//     const completionTime = new Date().toISOString();
//     const durationMinutes = (new Date().getTime() - new Date(startTime).getTime()) / (1000 * 60);
    
//     // Format responses array with time_taken calculations
//     let previousTimestamp: string | null = null;
//     const responses = Object.entries(session.responses || {}).map(([questionId, response], index) => {
//       // Find question details
//       const question = allQuestions?.find(q => q.id === questionId);
//       const sectionId = question?.sectionId || '';
//       const sectionName = sections?.find(s => s.id === sectionId)?.title || '';
      
//       // Calculate time taken (if previous timestamp exists)
//       let timeTaken = null;
//       if (previousTimestamp) {
//         const currentTime = new Date(response.timestamp).getTime();
//         const prevTime = new Date(previousTimestamp).getTime();
//         const diffSeconds = Math.round((currentTime - prevTime) / 1000);
//         timeTaken = `${diffSeconds}s`;
//       }
//       previousTimestamp = response.timestamp;
      
//       return {
//         qno: index + 1,
//         question_id: questionId,
//         question_text: question?.text || '',
//         answer: response.response,
//         section_id: sectionId,
//         section_name: sectionName,
//         // difficulty: question?.difficulty || 'medium',
//         metadata: {
//           tags: response.tags || [],
//           // timestamp: response.timestamp,
//           ...(timeTaken && { time_taken: timeTaken })
//         }
//       };
//     });
    
//     // Calculate tag distribution for simplified analytics
//     const tagCounts: Record<string, number> = {};
//     responses.forEach(response => {
//       if (response.metadata.tags) {
//         response.metadata.tags.forEach((tag: string) => {
//           tagCounts[tag] = (tagCounts[tag] || 0) + 1;
//         });
//       }
//     });
    
//     // Ensure all possible tags have counts
//     const allTags = ['Honest', 'Unsure', 'Sarcastic', 'Avoiding'];
//     allTags.forEach(tag => {
//       if (!tagCounts[tag]) tagCounts[tag] = 0;
//     });
    
//     // Create the full submission data object with simplified structure
//     return {
//       response: responses,
//       user_data: userData,
//       assessment_metadata: {
//         session_id: session.id,
//         start_time: startTime,
//         completion_time: completionTime,
//         duration_minutes: Number(durationMinutes.toFixed(1)),
//         completion_percentage: Math.round((responses.length / (allQuestions?.length || 1)) * 100),
//         device_info: {
//           type: detectDeviceType(),
//           browser: detectBrowser(),
//           operating_system: detectOS()
//         }
//       },
//       analytics: {
//         response_patterns: {
//           tag_distribution: tagCounts
//         }
//       }
//     };
//   };
  
//   // Handle final submission
//   const handleSubmit = async () => {
//     try {
//       // Format the submission data (which contains the session.id)
//       const submissionData = formatSubmissionData();
//       console.log(submissionData);
      
//       if (!submissionData) {
//         console.error('No submission data available');
//         return null;
//       }
      
//       // Extract the sessionId directly from submissionData
//       const sessionId = submissionData.assessment_metadata.session_id;
//       // console.log('Using sessionId from submissionData:', sessionId);
      
//       // Call the finishQuest method from context
//       const result = await finishQuest();
      
//       // Set the result and mark as submitted
//       setResult(result);
//       setSubmitted(true);
      
//       // Store the sessionId in localStorage
//       localStorage.setItem('questSessionId', sessionId);
//       // console.log('Stored sessionId in localStorage:', sessionId);
      
//       // Store session history in database
//       await storeSessionHistory(sessionId);
      
//       // Call the onComplete callback if provided
//       if (onComplete) {
//         onComplete();
//       }
      
//       // Show the Thank You message
//       setShowThankYou(true);
      
//       // After a delay, navigate to the processing page with the sessionId
//       setTimeout(() => {
//         navigate(`/quest-result/processing/${sessionId}`);
//       }, 4000); // Show Thank You for 4 seconds
      
//       return result;
//     } catch (error) {
//       console.error('Error submitting quest:', error);
//       throw error;
//     }
//   };

//   // const handleSubmit = async () => {
//   //   try {
//   //     // setSubmissionStatus('submitting');
      
//   //     // Format the submission data (existing code)
//   //     const submissionData = formatSubmissionData();
      
//   //     if (!submissionData) {
//   //       console.log('No submission data available');
//   //       // setSubmissionStatus('error');
//   //       // setSubmissionError('No submission data available');
//   //       return null;
//   //     }
      
//   //     // Submit to backend API
//   //     const response = await axios.post('YOUR_API_ENDPOINT_HERE', submissionData, {
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //         'Authorization': `Bearer ${auth.session?.access_token || auth.user?.access_token}`
//   //       },
//   //       timeout: 30000 // 30 second timeout
//   //     });
      
//   //     // setSubmissionStatus('submitted');
      
//   //     // Extract the sessionId from submissionData
//   //     const sessionId = submissionData.assessment_metadata.session_id;
      
//   //     // Set the result from API response
//   //     setResult(response.data);
//   //     setSubmitted(true);
      
//   //     // Store the sessionId in localStorage
//   //     localStorage.setItem('questSessionId', sessionId);
      
//   //     // Store session history in database (existing code)
//   //     await storeSessionHistory(sessionId);
      
//   //     // Call the onComplete callback if provided
//   //     if (onComplete) {
//   //       onComplete();
//   //     }
      
//   //     // Show the Thank You message
//   //     setShowThankYou(true);
      
//   //     // After a delay, navigate to the processing page with the sessionId
//   //     setTimeout(() => {
//   //       navigate(`/quest-result/processing/${sessionId}`);
//   //     }, 4000); // Show Thank You for 4 seconds
      
//   //     return response.data;
      
//   //   } catch (error) {
//   //     console.error('Error submitting quest:', error);
//   //     // setSubmissionStatus('error');
//   //     // setSubmissionError(error.response?.data?.message || error.message || 'Submission failed');
//   //     throw error;
//   //   }
//   // };
  
//   // Helper functions for device detection
  
  
//   const detectDeviceType = (): string => {
//     const userAgent = navigator.userAgent;
//     if (/mobile|android|iphone|ipad|ipod/i.test(userAgent.toLowerCase())) {
//       return /ipad/i.test(userAgent.toLowerCase()) ? 'tablet' : 'mobile';
//     }
//     return 'desktop';
//   };
  
//   const detectBrowser = (): string => {
//     const userAgent = navigator.userAgent;
//     if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
//     if (userAgent.indexOf('Safari') > -1) return 'Safari';
//     if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
//     if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) return 'Internet Explorer';
//     if (userAgent.indexOf('Edge') > -1) return 'Edge';
//     return 'Unknown';
//   };
  
//   const detectOS = (): string => {
//     const userAgent = navigator.userAgent;
//     if (userAgent.indexOf('Windows') > -1) return 'Windows';
//     if (userAgent.indexOf('Mac') > -1) return 'Mac';
//     if (userAgent.indexOf('Linux') > -1) return 'Linux';
//     if (userAgent.indexOf('Android') > -1) return 'Android';
//     if (userAgent.indexOf('iOS') > -1) return 'iOS';
//     return 'Unknown';
//   };
  
//   // Show celebratory content before summary
//   if (!showSummary && !submitted) {
//     return (
//       <QuestLayout showHeader={false} showNavigation={false} className={className}>
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.8 }}
//           className="text-center p-4"
//         >
//           {/* Celebration effects */}
//           <CompletionEffects />
          
//           {/* Celebration animation */}
//           <CompletionCelebration />
          
//           {/* Congratulation message */}
//           <motion.h2
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5, duration: 0.8 }}
//             className="text-3xl font-playfair text-navy mt-8 mb-4"
//           >
//             Congratulations!
//           </motion.h2>
          
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.8, duration: 0.8 }}
//             className="text-gray-600 mb-8 max-w-md mx-auto"
//           >
//             You've completed the assessment. Your responses have been recorded.
//           </motion.p>
          
//           {/* Action buttons */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 1.2, duration: 0.8 }}
//             className="flex flex-col sm:flex-row justify-center gap-4 mt-6"
//           >
//             <motion.button
//               onClick={() => setShowSummary(true)}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.98 }}
//               className="px-6 py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors"
//             >
//               View Summary
//             </motion.button>
//           </motion.div>
//         </motion.div>
//       </QuestLayout>
//     );
//   }
  
//   // Show summary before submission
//   if (showSummary && !submitted) {
//     return (
//       <QuestLayout showHeader={false} showNavigation={false} className={className}>
//         <QuestSummary 
//           onSubmit={handleSubmit}
//           onBack={handleBack}
//         />
//       </QuestLayout>
//     );
//   }
  
//   // Show Thank You message after submission
//   if (showThankYou) {
//     return (
//       <QuestLayout showHeader={false} showNavigation={false} className={className}>
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.8 }}
//           className="text-center p-4"
//         >
//           <motion.h2
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3, duration: 0.8 }}
//             className="text-3xl font-playfair text-navy mb-4"
//           >
//             Thank You!
//           </motion.h2>
          
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.6, duration: 0.8 }}
//             className="text-gray-600 mb-8 max-w-md mx-auto"
//           >
//             Your assessment has been successfully submitted.
//             We're analyzing your responses to provide you with personalized insights.
//           </motion.p>
          
//           {/* Success message */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.9, duration: 0.8 }}
//             className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200 mb-6 inline-block"
//           >
//             <svg 
//               xmlns="http://www.w3.org/2000/svg" 
//               className="h-6 w-6 inline-block mr-2" 
//               fill="none" 
//               viewBox="0 0 24 24" 
//               stroke="currentColor"
//             >
//               <path 
//                 strokeLinecap="round" 
//                 strokeLinejoin="round" 
//                 strokeWidth={2} 
//                 d="M5 13l4 4L19 7" 
//               />
//             </svg>
//             Successfully submitted! Redirecting to analysis...
//           </motion.div>
//         </motion.div>
//       </QuestLayout>
//     );
//   }
  
//   // This shouldn't be reached normally, but handle just in case
//   return null;
// }

// export default QuestCompletion;

// ------------------------------------------------------------- //

// src/components/quest/views/QuestCompletion.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import QuestLayout from '../layout/QuestLayout';
import CompletionEffects from '../effects/CompletionEffects';
import CompletionCelebration from '../progress/CompletionCelebration';
import QuestSummary from './QuestSummary'; // Assuming this component exists
import { useQuest } from '../core/useQuest';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path as needed
import { supabase } from '../../../integrations/supabase/client'; // Adjust path as needed

export interface QuestCompletionProps {
  onRestart?: () => void;
  onComplete?: () => void;
  className?: string;
}

type SubmissionStatus = 'idle' | 'submitting' | 'submitted' | 'error';

export function QuestCompletion({
  onRestart,
  onComplete,
  className = ''
}: QuestCompletionProps) {
  const navigate = useNavigate();
  const { 
    session, 
    finishQuest, 
    resetQuest,
    changeSection,
    currentSectionId,
    isSubmitting,
    allQuestions,
    sections
  } = useQuest();
  
  // Add auth context to get user data
  const auth = useAuth();
  
  const [showSummary, setShowSummary] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  
  // New state variables for backend integration
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  // Function to store session history in database
  const storeSessionHistory = async (sessionId: string, testid: string) => {
    // Check if user is authenticated
    if (!auth.user?.id) {
      console.warn('You are not authenticated. Please Sign in first');
      return;
    }
    
    try {
      // Perform insert operation
      const { data, error } = await supabase
        .from('user_session_history')
        .insert({
          user_id: auth.user.id,
          session_id: sessionId,
          testid: testid || null,
          created_at: new Date().toISOString()
        });
      
      // Handle errors
      if (error) {
        console.error('Failed to store session history:', error);
        // Note: We don't throw here to avoid blocking the main flow
      } else {
        console.log('Session history stored successfully');
      }
    } catch (err) {
      console.error('Error storing session history:', err);
      // Note: We don't re-throw to avoid blocking the main flow
    }
  };
  
  // Handle going back to the assessment
  const handleBack = () => {
    setShowSummary(false);
    setSubmissionStatus('idle');
    setSubmissionError(null);
  };

  // const formatSubmissionData = () => {
  //   if (!session) return null;
  //   const testid = crypto.getRandomValues(new Uint8Array(20)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    
  //   // Get user information from auth context
  //   const userData = {
  //     user_id: auth.user?.id || session.userId,
  //     name: auth.user?.user_metadata?.first_name 
  //       ? `${auth.user.user_metadata.first_name} ${auth.user.user_metadata.last_name || ''}`
  //       : 'User',
  //     email: auth.user?.email || 'user@example.com',
  //     "mobile no": auth.user?.user_metadata?.phone || "",
  //     city: auth.user?.user_metadata?.city || "",
  //     DOB: auth.user?.user_metadata?.dob || undefined ,// Optional field
  //     "testid" : testid
  //   };
    
  //   // Calculate completion time and duration
  //   const startTime = session.startedAt;
  //   const completionTime = new Date().toISOString();
  //   const durationMinutes = (new Date().getTime() - new Date(startTime).getTime()) / (1000 * 60);
    
  //   // Format responses array with time_taken calculations
  //   let previousTimestamp: string | null = null;
  //   const responses = Object.entries(session.responses || {}).map(([questionId, response], index) => {
  //     // Find question details
  //     const question = allQuestions?.find(q => q.id === questionId);
  //     const sectionId = question?.sectionId || '';
  //     const sectionName = sections?.find(s => s.id === sectionId)?.title || '';
      
  //     // Calculate time taken (if previous timestamp exists)
  //     let timeTaken = null;
  //     if (previousTimestamp) {
  //       const currentTime = new Date(response.timestamp).getTime();
  //       const prevTime = new Date(previousTimestamp).getTime();
  //       const diffSeconds = Math.round((currentTime - prevTime) / 1000);
  //       timeTaken = `${diffSeconds}s`;
  //     }
  //     previousTimestamp = response.timestamp;
      
  //     return {
  //       qno: index + 1,
  //       question_id: questionId,
  //       question_text: question?.text || '',
  //       answer: response.response,
  //       section_id: sectionId,
  //       section_name: sectionName,
  //       // difficulty: question?.difficulty || 'medium',
  //       metadata: {
  //         tags: response.tags || [],
  //         // timestamp: response.timestamp,
  //         ...(timeTaken && { time_taken: timeTaken })
  //       }
  //     };
  //   });
    
  //   // Calculate tag distribution for simplified analytics
  //   const tagCounts: Record<string, number> = {};
  //   responses.forEach(response => {
  //     if (response.metadata.tags) {
  //       response.metadata.tags.forEach((tag: string) => {
  //         tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  //       });
  //     }
  //   });
    
  //   // Ensure all possible tags have counts
  //   const allTags = ['Honest', 'Unsure', 'Sarcastic', 'Avoiding'];
  //   allTags.forEach(tag => {
  //     if (!tagCounts[tag]) tagCounts[tag] = 0;
  //   });
    
  //   // Create the full submission data object with simplified structure
  //   return {
  //     response: responses,
  //     user_data: userData,
  //     assessment_metadata: {
  //       session_id: session.id,
  //       start_time: startTime,
  //       completion_time: completionTime,
  //       duration_minutes: Number(durationMinutes.toFixed(1)),
  //       completion_percentage: Math.round((responses.length / (allQuestions?.length || 1)) * 100),
  //       device_info: {
  //         type: detectDeviceType(),
  //         browser: detectBrowser(),
  //         operating_system: detectOS()
  //       }
  //     },
  //     analytics: {
  //       response_patterns: {
  //         tag_distribution: tagCounts
  //       }
  //     }
  //   };
  // };
  
  // Handle final submission with backend integration
  
  const formatSubmissionData = () => {
  if (!session) return null;
  const testid = crypto.getRandomValues(new Uint8Array(20)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  
  // Get user information from auth context
  const userData = {
    user_id: auth.user?.id || session.userId,
    name: auth.user?.user_metadata?.first_name 
      ? `${auth.user.user_metadata.first_name} ${auth.user.user_metadata.last_name || ''}`
      : 'User',
    email: auth.user?.email || 'user@example.com',
    "mobile no": auth.user?.user_metadata?.phone || "",
    city: auth.user?.user_metadata?.city || "",
    DOB: auth.user?.user_metadata?.dob || undefined,
    "testid": testid
  };
  
  // Calculate completion time and duration
  const startTime = session.startedAt;
  const completionTime = new Date().toISOString();
  const durationMinutes = (new Date().getTime() - new Date(startTime).getTime()) / (1000 * 60);
  
  // Format responses array - NOW INCLUDES ALL QUESTIONS
  let previousTimestamp: string | null = null;
  const responses = allQuestions?.map((question, index) => {
    const response = session.responses?.[question.id];
    const sectionId = question?.sectionId || '';
    const sectionName = sections?.find(s => s.id === sectionId)?.title || '';
    
    // Handle answered questions
    if (response) {
      // Calculate time taken (if previous timestamp exists)
      let timeTaken = null;
      if (previousTimestamp) {
        const currentTime = new Date(response.timestamp).getTime();
        const prevTime = new Date(previousTimestamp).getTime();
        const diffSeconds = Math.round((currentTime - prevTime) / 1000);
        timeTaken = `${diffSeconds}s`;
      }
      previousTimestamp = response.timestamp;
      
      return {
        qno: index + 1,
        question_id: question.id,
        question_text: question?.text || '',
        answer: response.response,
        section_id: sectionId,
        section_name: sectionName,
        metadata: {
          tags: response.tags || [],
          ...(timeTaken && { time_taken: timeTaken })
        }
      };
    } 
    // Handle skipped questions
    else {
      return {
        qno: index + 1,
        question_id: question.id,
        question_text: question?.text || '',
        answer: "I preferred not to response for this question",
        section_id: sectionId,
        section_name: sectionName,
        metadata: {
          tags: [],
          time_taken: "not answered"
        }
      };
    }
  }) || [];
  
  // Calculate tag distribution for simplified analytics (UNCHANGED)
  const tagCounts: Record<string, number> = {};
  responses.forEach(response => {
    if (response.metadata.tags) {
      response.metadata.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  
  // Ensure all possible tags have counts
  const allTags = ['Honest', 'Unsure', 'Sarcastic', 'Avoiding'];
  allTags.forEach(tag => {
    if (!tagCounts[tag]) tagCounts[tag] = 0;
  });
  
  // Create the full submission data object with simplified structure
  return {
    response: responses,
    user_data: userData,
    assessment_metadata: {
      session_id: session.id,
      start_time: startTime,
      completion_time: completionTime,
      duration_minutes: Number(durationMinutes.toFixed(1)),
      completion_percentage: Math.round((Object.keys(session.responses || {}).length / (allQuestions?.length || 1)) * 100),
      device_info: {
        type: detectDeviceType(),
        browser: detectBrowser(),
        operating_system: detectOS()
      }
    },
    analytics: {
      response_patterns: {
        tag_distribution: tagCounts
      }
    }
  };
  };



  const handleSubmit = async () => {
    try {
      setSubmissionStatus('submitting');
      
      // Format the submission data (existing code)
      const submissionData = formatSubmissionData();
      console.log(submissionData);
      
      
      if (!submissionData) {
        console.error('No submission data available');
        setSubmissionStatus('error');
        setSubmissionError('No submission data available');
        return null;
      }
      // console.log(auth.session?.access_token);
        const sessionId = submissionData.assessment_metadata.session_id;
        const testid = submissionData?.user_data?.testid || ''
      
      // Submit to backend API
      const response = await axios.post("https://api.fraterny.in/api/agent", submissionData, {
        headers: {
          'Content-Type': 'application/json',  
        },
        // timeout: 30000 // 30 second timeout
      });

      setSubmissionStatus('submitted');
      setResult(response.data);
      setSubmitted(true);
      
      // Store the sessionId in localStorage
      localStorage.setItem('questSessionId', sessionId);
      localStorage.setItem('testid', testid)
      
      // Store session history in database (existing code)
      await storeSessionHistory(sessionId, testid);
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
      
      // // Show the Thank You message
      setShowThankYou(true);
      
      // After a delay, navigate to the processing page with the sessionId
      setTimeout(() => {
        const targetUrl = `/quest-result/processing/${sessionId}/${auth.user?.id}/${testid}`;
        console.log('🚀 NAVIGATING TO:', targetUrl);
        console.log('📊 sessionId:', sessionId);
        console.log('👤 userId:', auth.user?.id);
        console.log('🔑 testid:', testid);
        navigate(targetUrl);
      }, 4000); // Show Thank You for 4 seconds
      
      return response.data;
      
    } catch (error: any) {
      console.error('Error submitting quest:', error.response?.data?.message || error.message);
      setSubmissionStatus('error');
      setSubmissionError(error.response?.data?.message || error.message || 'Submission failed');
      throw error;
    }
  };
  
  // Helper functions for device detection
  const detectDeviceType = (): string => {
    const userAgent = navigator.userAgent;
    if (/mobile|android|iphone|ipad|ipod/i.test(userAgent.toLowerCase())) {
      return /ipad/i.test(userAgent.toLowerCase()) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  };
  
  const detectBrowser = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) return 'Internet Explorer';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    return 'Unknown';
  };
  
  const detectOS = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Windows') > -1) return 'Windows';
    if (userAgent.indexOf('Mac') > -1) return 'Mac';
    if (userAgent.indexOf('Linux') > -1) return 'Linux';
    if (userAgent.indexOf('Android') > -1) return 'Android';
    if (userAgent.indexOf('iOS') > -1) return 'iOS';
    return 'Unknown';
  };
  
  // Show celebratory content before summary
  if (!showSummary && !submitted) {
    return (
      <QuestLayout showHeader={false} showNavigation={false} className={className}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center p-4"
        >
          {/* Celebration effects */}
          <CompletionEffects />
          
          {/* Celebration animation */}
          <CompletionCelebration />
          
          {/* Congratulation message */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-3xl font-playfair text-navy mt-8 mb-4"
          >
            Congratulations!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-gray-600 mb-8 max-w-md mx-auto"
          >
            You've completed the assessment. Your responses have been recorded.
          </motion.p>
          
          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mt-6"
          >
            <motion.button
              onClick={() => setShowSummary(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors"
            >
              View Summary
            </motion.button>
          </motion.div>
        </motion.div>
      </QuestLayout>
    );
  }
  
  // Show summary before submission
  if (showSummary && !submitted) {
    return (
      <QuestLayout showHeader={false} showNavigation={false} className={className}>
        {/* Error display */}
        {submissionStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200 mb-6 mx-4"
          >
            <p className="font-medium">Submission Error:</p>
            <p className="text-sm">{submissionError}</p>
            <button 
              onClick={() => {
                setSubmissionStatus('idle');
                setSubmissionError(null);
              }}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try Again
            </button>
          </motion.div>
        )}
        
        <QuestSummary 
          onSubmit={handleSubmit}
          onBack={handleBack}
        />
      </QuestLayout>
    );
  }
  
  // Show Thank You message after submission
  if (showThankYou) {
    return (
      <QuestLayout showHeader={false} showNavigation={false} className={className}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center p-4"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-3xl font-playfair text-navy mb-4"
          >
            Thank You!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-gray-600 mb-8 max-w-md mx-auto"
          >
            Your assessment has been successfully submitted.
            We're analyzing your responses to provide you with personalized insights.
          </motion.p>
          
          {/* Success message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200 mb-6 inline-block"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 inline-block mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
            Successfully submitted! Redirecting to analysis...
          </motion.div>
        </motion.div>
      </QuestLayout>
    );
  }
  
  // This shouldn't be reached normally, but handle just in case
  return null;
}

export default QuestCompletion;