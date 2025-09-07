// // src/components/quest/views/QuestCompletion.tsx

// import React, { useState, useEffect, useRef  } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import QuestLayout from '../layout/QuestLayout';
// import { useQuest } from '../core/useQuest';
// import { useAuth } from '../../../contexts/AuthContext';
// import { supabase } from '../../../integrations/supabase/client';
// import QuestProcessing from './QuestProcessing';
// import analysisGif from '../../../../public/analysis.gif'

// const psychologicalFacts = [
//   "The average person has 12,000 to 60,000 thoughts per day, and many of them are repetitive.",
//   "Your brain uses about 20% of your body's total energy, despite being only 2% of your body weight.",
//   "The brain continues to create new neural connections throughout your life, a property known as neuroplasticity.",
//   "The 'Dunning-Kruger effect' describes how people with limited knowledge in a field overestimate their expertise.",
//   "Smell is the sense most closely linked to memory, which is why certain scents can trigger vivid recollections.",
//   "The 'spotlight effect' is the tendency to overestimate how much others notice about you.",
//   "Decision fatigue describes how the quality of decisions tends to deteriorate after making many decisions.",
//   "Social connection is as important to physical health as exercise and good nutrition.",
//   "Most people can recognize about 5,000 faces, a skill that develops from early childhood.",
//   "Your brain activity is as unique as your fingerprint, creating patterns that are distinctly yours.",
//   "Altruism activates pleasure centers in the brain, which is why helping others feels good.",
//   "Studies show that expressing gratitude increases happiness and reduces depression.",
//   "The 'confirmation bias' leads us to favor information that confirms our existing beliefs.",
//   "The 'halo effect' causes one positive trait to influence our perception of other traits.",
//   "The brain can't actually multitask—it switches rapidly between tasks, reducing efficiency.",
//   "Eye contact activates the same brain regions as falling in love and feeling connected.",
//   "Your emotional state affects your perception—happiness broadens your visual field.",
//   "The 'psychological immune system' helps you rationalize and recover from negative events.",
// ];

// export interface QuestCompletionProps {
//   onRestart?: () => void;
//   onComplete?: () => void;
//   className?: string;
// }

// type SubmissionStatus = 'idle' | 'submitting' | 'submitted' | 'error';

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
  
//   const auth = useAuth();
  
//   const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
//   const [submissionError, setSubmissionError] = useState<string | null>(null);
//   const [factIndex, setFactIndex] = useState(0);
//   const [hasSubmitted, setHasSubmitted] = useState(false);
//   const hasInitialized = useRef(false);

//   useEffect(() => {
//     const factInterval = setInterval(() => {
//       setFactIndex(prevIndex => (prevIndex + 1) % psychologicalFacts.length);
//     }, 8000);

//     return () => clearInterval(factInterval);
//   }, []);
  
//   // Auto-submit when component mounts
//   useEffect(() => {
//   console.log('🔍 useEffect triggered - hasInitialized:', hasInitialized.current, 'hasSubmitted:', hasSubmitted, 'submissionStatus:', submissionStatus);
  
//   // Prevent double execution in React Strict Mode
//   if (hasInitialized.current) {
//     console.log('❌ Already initialized - skipping');
//     return;
//   }
  
//   hasInitialized.current = true;
  
//   if (submissionStatus === 'idle' && !hasSubmitted) {
//     console.log('✅ Conditions met - triggering handleAutoSubmit');
//     handleAutoSubmit();
//   } else {
//     console.log('❌ Conditions not met - skipping submission');
//   }
// }, []);
  
//   const formatSubmissionData = () => {
//     // if (!session) return null;
//     // Create a working session object (either real or fallback)
//     let workingSession: any ;
//     // if (!session) {
//     //   const fallbackSessionId = crypto.getRandomValues(new Uint8Array(16)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
//     //   workingSession = { 
//     //     id: fallbackSessionId, 
//     //     userId: 'anonymous', 
//     //     startedAt: new Date().toISOString(), 
//     //     responses: {},
//     //     status: 'completed'
//     //   };
//     // }

//     const fallbackSessionId = crypto.getRandomValues(new Uint8Array(16)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
//       workingSession = { 
//         id: session?.id || fallbackSessionId, 
//         userId: auth.user?.id || 'anonymous', 
//         startedAt: new Date().toISOString(), 
//         responses: session?.responses || {},
//         status: 'completed'
//       };

//       // console.log('📝 Working session:', workingSession);

//     const testid = crypto.getRandomValues(new Uint8Array(20)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    
//     // const userData = {
//     //   user_id: auth.user?.id || session.userId,
//     //   name: auth.user?.user_metadata?.first_name 
//     //     ? `${auth.user.user_metadata.first_name} ${auth.user.user_metadata.last_name || ''}`
//     //     : 'User',
//     //   email: auth.user?.email || 'user@example.com',
//     //   "mobile no": auth.user?.user_metadata?.phone || "",
//     //   city: auth.user?.user_metadata?.city || "",
//     //   DOB: auth.user?.user_metadata?.dob || undefined,
//     //   "testid": testid
//     // };

//     const userData = auth.user?.id ? {
//         user_id: auth.user.id,
//         name: auth.user.user_metadata?.first_name 
//           ? `${auth.user.user_metadata.first_name} ${auth.user.user_metadata.last_name || ''}`
//           : 'User',
//         email: auth.user.email || 'user@example.com',
//         "mobile no": auth.user.user_metadata?.phone || "",
//         city: auth.user.user_metadata?.city || "",
//         DOB: auth.user.user_metadata?.dob || undefined,
//         "testid": testid
//       } : {
//         user_id: `${workingSession?.userId || 'unknown'}`,
//         name: 'Anonymous User',
//         email: '',
//         "mobile no": '',
//         city: '',
//         DOB: undefined,
//         "testid": testid
//       };
    
//     const startTime = workingSession?.startedAt;
//     const completionTime = new Date().toISOString();
//     const startTimeValue = startTime || new Date().toISOString();
//     const durationMinutes = (new Date().getTime() - new Date(startTimeValue).getTime()) / (1000 * 60);
    
//     let previousTimestamp: string | null = null;
//     const responses = allQuestions?.map((question, index) => {
//       const response = workingSession?.responses?.[question.id];
//       const sectionId = question?.sectionId || '';
//       const sectionName = sections?.find(s => s.id === sectionId)?.title || '';
      
//       if (response) {
//         let timeTaken = null;
//         if (previousTimestamp) {
//           const currentTime = new Date(response.timestamp).getTime();
//           const prevTime = new Date(previousTimestamp).getTime();
//           const diffSeconds = Math.round((currentTime - prevTime) / 1000);
//           timeTaken = `${diffSeconds}s`;
//         }
//         previousTimestamp = response.timestamp;
        
//         return {
//           qno: index + 1,
//           question_id: question.id,
//           question_text: question?.text || '',
//           answer: response.response,
//           section_id: sectionId,
//           section_name: sectionName,
//           metadata: {
//             tags: response.tags || [],
//             time_taken: timeTaken || (question?.type === 'date_input' ? '1s' : undefined)
//           }
//         };
//       } else {
//         return {
//           qno: index + 1,
//           question_id: question.id,
//           question_text: question?.text || '',
//           answer: "I preferred not to response for this question",
//           section_id: sectionId,
//           section_name: sectionName,
//           metadata: {
//             tags: [],
//             time_taken: '1s'
//           }
//         };
//       }
//     }) || [];
    
//     const tagCounts: Record<string, number> = {};
//     responses.forEach(response => {
//       if (response.metadata.tags) {
//         response.metadata.tags.forEach((tag: string) => {
//           tagCounts[tag] = (tagCounts[tag] || 0) + 1;
//         });
//       }
//     });
    
//     const allTags = ['Honest', 'Unsure', 'Sarcastic', 'Avoiding'];
//     allTags.forEach(tag => {
//       if (!tagCounts[tag]) tagCounts[tag] = 0;
//     });
    
//     return {
//       response: responses,
//       user_data: userData,
//       assessment_metadata: {
//         session_id: workingSession?.id || '',
//         start_time: startTime,
//         completion_time: completionTime,
//         duration_minutes: Number(durationMinutes.toFixed(1)),
//         completion_percentage: Math.round((Object.keys(workingSession?.responses || {}).length / (allQuestions?.length || 1)) * 100),
//         device_info: {
//           type: detectDeviceType(),
//           browser: detectBrowser(),
//           operating_system: detectOS()
//         },
//       }
//     };
//   };

//   // Auto-submit function that runs when component loads
//   const handleAutoSubmit = async () => {
//     // Prevent duplicate submissions
//     if (hasSubmitted || submissionStatus === 'submitting' || submissionStatus === 'submitted') {
//       console.log('🛡️ Submission already in progress or completed, skipping...');
//       return;
//     }
//     setHasSubmitted(true); // Mark as submitted immediately
//     try {
//       console.log('🚀 Auto-submitting quest data...');
//       setSubmissionStatus('submitting');
      
//       const submissionData = formatSubmissionData();
//       console.log('📊 Submission data:', submissionData);
      
//       if (!submissionData) {
//         console.error('No submission data available');
//         setSubmissionStatus('error');
//         setSubmissionError('No submission data available');
//         return;
//       }

//       const sessionId = submissionData.assessment_metadata.session_id;
//       const testid = submissionData?.user_data?.testid || '';
      
//       console.log('📤 Submitting to API...');
//       // const response = await axios.post("https://api.fraterny.in/api/agent", submissionData, {
//       //   headers: {
//       //     'Content-Type': 'application/json',  
//       //   },
//       // });

//       // ------------------------------------------------
//       // MOCK: Simulating API submission
//       // console.log('🧪 MOCK SUBMISSION - Data that would be sent:', submissionData);
//       // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
//       // const response = { data: { success: true, mock: 'data' } };

//       // console.log('✅ MOCK: Submission successful:', response.data);

//       // ------------------------------------------------// 

//       // console.log('✅ Submission successful:', response.data);
//       // setSubmissionStatus('submitted');
      
//       // // Store data in localStorage and database
//       // localStorage.setItem('questSessionId', sessionId);
//       // localStorage.setItem('testid', testid);
//       // await storeSessionHistory(sessionId, testid);
      
//       // // Call completion callback
//       // if (onComplete) {
//       //   onComplete();
//       // }
      
//       // // Navigate to processing page immediately
//       // const userId = auth.user?.id || 'anonymous';
//       // const targetUrl = `/quest-result/processing/${sessionId}/${userId}/${testid}`;
//       // console.log('🚀 Navigating to processing:', targetUrl);
//       // navigate(targetUrl);

//       // Call finishQuest from context with submission data
//       const result = await finishQuest(submissionData);

//       console.log('✅ Quest finished successfully:', result);
//       setSubmissionStatus('submitted');
//       // Note: Navigation and storage are now handled in finishQuest()
      
//     } catch (error: any) {
//       console.error('❌ Submission failed:', error.response?.data?.message || error.message);
//       setSubmissionStatus('error');
//       setSubmissionError(error.response?.data?.message || error.message || 'Submission failed');
//       setHasSubmitted(false); // Reset on error to allow retry
//     }
    
//   };
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

//   // Retry function for failed submissions
//   const handleRetry = () => {
//     setHasSubmitted(false); // Reset the submission flag
//     setSubmissionStatus('idle');
//     setSubmissionError(null);
//     handleAutoSubmit();
//   };

//   // Show loading state while submitting
//   if (submissionStatus === 'submitting') {
//     return (
//       // <div className='h-screen bg-[#004A7F] max-w-screen overflow-hidden'>
//       //       <motion.div
//       //         initial={{ opacity: 0 }}
//       //         animate={{ opacity: 1 }}
//       //         className="flex flex-col items-center justify-center text-center h-screen relative z-20"
//       //       >
//       //         <div className='absolute flex flex-col items-center justify-center w-full top-14'>
//       //           <div className='text-7xl font-normal font-["Gilroy-Bold"] tracking-[-0.5rem]'>
//       //             QUEST
//       //           </div>
//       //           <div className='text-lg font-normal font-["Gilroy-Regular"] tracking-[0.1rem] pl-5 mt-[-8px]'>
//       //             BY FRATERNY
//       //           </div>
//       //         </div>
      
//       //         <div className="h-44 flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg m-2 p-6 mb-8 border border-gray-100">
//       //         <AnimatePresence mode="wait">
//       //           <motion.p
//       //             key={factIndex}
//       //             initial={{ opacity: 0, y: 20 }}
//       //             animate={{ opacity: 1, y: 0 }}
//       //             exit={{ opacity: 0, y: -20 }}
//       //             transition={{ duration: 0.5 }}
//       //             className="text-2xl text-navy font-light italic font-['Gilroy-Light']"
//       //           >
//       //             "{psychologicalFacts[factIndex]}"
//       //           </motion.p>
//       //         </AnimatePresence>
//       //         </div>
              
//       //         <p className="text-white text-3xl font-['Gilroy-Bold'] tracking-tighter">
//       //           Please wait while we process your responses...
//       //         </p>
//       //       </motion.div>
      
//       //       <motion.div
//       //         initial={{ opacity: 0, scale: 0.8 }}
//       //         animate={{ opacity: 1, scale: 1 }}
//       //         transition={{ duration: 0.8 }}
//       //         className='absolute z-10 w-screen h-[554px] bg-radial from-10% from-[#48B9D8] via-80% to-40% via-[#41D9FF] to-[#0C45F0] flex top-5 rounded-full blur-[80px]'
//       //         style={{
//       //           background: 'radial-gradient(50% 50% at 50% 50%, #0C45F0 0%, #41D9FF 50.96%, #48B9D8 100%)',
//       //           backdropFilter: 'blur(180px)',
//       //         }}
//       //       />
//       // </div> 
//       <QuestProcessing className={className} gifSrc={analysisGif} />
//     );
//   }

//   // Show error state if submission failed
//   if (submissionStatus === 'error') {
//     return (
//       <QuestLayout showHeader={false} showNavigation={false} className={className}>
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="flex flex-col items-center justify-center px-4 py-12 max-w-3xl mx-auto text-center"
//         >
//           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
//             <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </div>
          
//           <h2 className="text-2xl font-playfair text-navy mb-4">
//             Submission Failed
//           </h2>
          
//           <p className="text-gray-600 mb-6 max-w-md">
//             {submissionError || 'There was an error submitting your assessment. Please try again.'}
//           </p>
          
//           <motion.button
//             onClick={handleRetry}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.98 }}
//             className="px-6 py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors"
//           >
//             Try Again
//           </motion.button>
//         </motion.div>
//       </QuestLayout>
//     );
//   }

//   // If somehow we reach here without submitting, show a fallback
//   if (submissionStatus === 'idle') {
//     return (
//       <QuestLayout showHeader={false} showNavigation={false} className={className}>
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="flex flex-col items-center justify-center px-4 py-12 max-w-3xl mx-auto text-center"
//         >
//           <h2 className="text-2xl font-playfair text-navy mb-4">
//             Preparing Submission...
//           </h2>
//           <p className="text-gray-600">
//             Getting ready to submit your assessment.
//           </p>
//         </motion.div>
//       </QuestLayout>
//     );
//   }

//   // This should not be reached if navigation works correctly
//   return null;
// }

// export default QuestCompletion;
















// src/components/quest/views/QuestCompletion.tsx

import React, { useState, useEffect, useRef  } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import QuestLayout from '../layout/QuestLayout';
import { useQuest } from '../core/useQuest';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../integrations/supabase/client';
import QuestProcessing from './QuestProcessing';
import analysisGif from '../../../../public/analysis1.gif'

const psychologicalFacts = [
  "The average person has 12,000 to 60,000 thoughts per day, and many of them are repetitive.",
  "Your brain uses about 20% of your body's total energy, despite being only 2% of your body weight.",
  "The brain continues to create new neural connections throughout your life, a property known as neuroplasticity.",
  "The 'Dunning-Kruger effect' describes how people with limited knowledge in a field overestimate their expertise.",
  "Smell is the sense most closely linked to memory, which is why certain scents can trigger vivid recollections.",
  "The 'spotlight effect' is the tendency to overestimate how much others notice about you.",
  "Decision fatigue describes how the quality of decisions tends to deteriorate after making many decisions.",
  "Social connection is as important to physical health as exercise and good nutrition.",
  "Most people can recognize about 5,000 faces, a skill that develops from early childhood.",
  "Your brain activity is as unique as your fingerprint, creating patterns that are distinctly yours.",
  "Altruism activates pleasure centers in the brain, which is why helping others feels good.",
  "Studies show that expressing gratitude increases happiness and reduces depression.",
  "The 'confirmation bias' leads us to favor information that confirms our existing beliefs.",
  "The 'halo effect' causes one positive trait to influence our perception of other traits.",
  "The brain can't actually multitask—it switches rapidly between tasks, reducing efficiency.",
  "Eye contact activates the same brain regions as falling in love and feeling connected.",
  "Your emotional state affects your perception—happiness broadens your visual field.",
  "The 'psychological immune system' helps you rationalize and recover from negative events.",
];

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
  
  const auth = useAuth();
  
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [factIndex, setFactIndex] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex(prevIndex => (prevIndex + 1) % psychologicalFacts.length);
    }, 8000);

    return () => clearInterval(factInterval);
  }, []);
  
  // Auto-submit when component mounts
  useEffect(() => {
  console.log('🔍 useEffect triggered - hasInitialized:', hasInitialized.current, 'hasSubmitted:', hasSubmitted, 'submissionStatus:', submissionStatus);
  
  // Prevent double execution in React Strict Mode
  if (hasInitialized.current) {
    console.log('❌ Already initialized - skipping');
    return;
  }
  
  hasInitialized.current = true;
  
  if (submissionStatus === 'idle' && !hasSubmitted) {
    console.log('✅ Conditions met - triggering handleAutoSubmit');
    handleAutoSubmit();
  } else {
    console.log('❌ Conditions not met - skipping submission');
  }
}, []);
  
  const formatSubmissionData = () => {
    // if (!session) return null;
    // Create a working session object (either real or fallback)
    let workingSession: any ;
    // if (!session) {
    //   const fallbackSessionId = crypto.getRandomValues(new Uint8Array(16)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    //   workingSession = { 
    //     id: fallbackSessionId, 
    //     userId: 'anonymous', 
    //     startedAt: new Date().toISOString(), 
    //     responses: {},
    //     status: 'completed'
    //   };
    // }

    const fallbackSessionId = crypto.getRandomValues(new Uint8Array(16)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
      workingSession = { 
        id: session?.id || fallbackSessionId, 
        userId: auth.user?.id || 'anonymous', 
        startedAt: new Date().toISOString(), 
        responses: session?.responses || {},
        status: 'completed'
      };

      // console.log('📝 Working session:', workingSession);

    const testid = crypto.getRandomValues(new Uint8Array(20)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    
    // const userData = {
    //   user_id: auth.user?.id || session.userId,
    //   name: auth.user?.user_metadata?.first_name 
    //     ? `${auth.user.user_metadata.first_name} ${auth.user.user_metadata.last_name || ''}`
    //     : 'User',
    //   email: auth.user?.email || 'user@example.com',
    //   "mobile no": auth.user?.user_metadata?.phone || "",
    //   city: auth.user?.user_metadata?.city || "",
    //   DOB: auth.user?.user_metadata?.dob || undefined,
    //   "testid": testid
    // };

    const userData = auth.user?.id ? {
        user_id: auth.user.id,
        name: auth.user.user_metadata?.first_name 
          ? `${auth.user.user_metadata.first_name} ${auth.user.user_metadata.last_name || ''}`
          : 'User',
        email: auth.user.email || 'user@example.com',
        "mobile no": auth.user.user_metadata?.phone || "",
        city: auth.user.user_metadata?.city || "",
        DOB: auth.user.user_metadata?.dob || undefined,
        "testid": testid
      } : {
        user_id: `${workingSession?.userId || 'unknown'}`,
        name: 'Anonymous User',
        email: '',
        "mobile no": '',
        city: '',
        DOB: undefined,
        "testid": testid
      };
    
    const startTime = workingSession?.startedAt;
    const completionTime = new Date().toISOString();
    const startTimeValue = startTime || new Date().toISOString();
    const durationMinutes = (new Date().getTime() - new Date(startTimeValue).getTime()) / (1000 * 60);
    
    let previousTimestamp: string | null = null;
    const responses = allQuestions?.map((question, index) => {
      const response = workingSession?.responses?.[question.id];
      const sectionId = question?.sectionId || '';
      const sectionName = sections?.find(s => s.id === sectionId)?.title || '';
      
      if (response) {
  let timeTaken = null;
  
  // Use stored total view time if available (new architecture)
  if (response.totalViewTimeSeconds && response.totalViewTimeSeconds > 0) {
    timeTaken = `${response.totalViewTimeSeconds}s`;
  } else {
    // Fallback to old calculation if no view time stored
    if (previousTimestamp) {
      const currentTime = new Date(response.timestamp).getTime();
      const prevTime = new Date(previousTimestamp).getTime();
      const diffSeconds = Math.round((currentTime - prevTime) / 1000);
      timeTaken = `${diffSeconds}s`;
    } else {
      timeTaken = '1s';
    }
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
      time_taken: timeTaken
    }
  };
        } else {
                return {
                  qno: index + 1,
                  question_id: question.id,
                  question_text: question?.text || '',
                  answer: "I preferred not to response for this question",
                  section_id: sectionId,
                  section_name: sectionName,
                  metadata: {
                    tags: [],
                    time_taken: '1s'
                  }
                };
              }
    }) || [];
    
    const tagCounts: Record<string, number> = {};
    responses.forEach(response => {
      if (response.metadata.tags) {
        response.metadata.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    const allTags = ['Honest', 'Unsure', 'Sarcastic', 'Avoiding'];
    allTags.forEach(tag => {
      if (!tagCounts[tag]) tagCounts[tag] = 0;
    });
    
    return {
      response: responses,
      user_data: userData,
      assessment_metadata: {
        session_id: workingSession?.id || '',
        start_time: startTime,
        completion_time: completionTime,
        duration_minutes: Number(durationMinutes.toFixed(1)),
        completion_percentage: Math.round((Object.keys(workingSession?.responses || {}).length / (allQuestions?.length || 1)) * 100),
        device_info: {
          type: detectDeviceType(),
          browser: detectBrowser(),
          operating_system: detectOS()
        },
      }
    };
  };

  // Auto-submit function that runs when component loads
  // const handleAutoSubmit = async () => {
  //   // Prevent duplicate submissions
  //   if (hasSubmitted || submissionStatus === 'submitting' || submissionStatus === 'submitted') {
  //     console.log('🛡️ Submission already in progress or completed, skipping...');
  //     return;
  //   }
  //   setHasSubmitted(true); // Mark as submitted immediately
  //   try {
  //     console.log('🚀 Auto-submitting quest data...');
  //     setSubmissionStatus('submitting');
      
  //     const submissionData = formatSubmissionData();
  //     console.log('📊 Submission data:', submissionData);
      
  //     if (!submissionData) {
  //       console.error('No submission data available');
  //       setSubmissionStatus('error');
  //       setSubmissionError('No submission data available');
  //       return;
  //     }

  //     const sessionId = submissionData.assessment_metadata.session_id;
  //     const testid = submissionData?.user_data?.testid || '';
      
  //     console.log('📤 Submitting to API...');

  //     // Call finishQuest from context with submission data
  //     const result = await finishQuest(submissionData);

  //     console.log('✅ Quest finished successfully:', result);
  //     setSubmissionStatus('submitted');
  //     setIsNavigating(true); // ADD THIS LINE
  //     setSubmissionError(null); // ADD THIS LINE
  //     // Note: Navigation and storage are now handled in finishQuest()
      
  //   } catch (error: any) {
  //     console.error('❌ Submission failed:', error.response?.data?.message || error.message);
  //     setSubmissionStatus('error');
  //     setSubmissionError(error.response?.data?.message || error.message || 'Submission failed');
  //     setHasSubmitted(false); // Reset on error to allow retry
  //   }
    
  // };

  // Auto-submit function that runs when component loads
const handleAutoSubmit = async () => {
  console.log('🔍 [DEBUG] handleAutoSubmit called - hasSubmitted:', hasSubmitted, 'submissionStatus:', submissionStatus);
  
  // Prevent duplicate submissions
  if (hasSubmitted || submissionStatus === 'submitting' || submissionStatus === 'submitted') {
    console.log('🛡️ [DEBUG] Submission already in progress or completed, skipping...');
    return;
  }
  
  console.log('🔄 [DEBUG] Setting hasSubmitted to true');
  setHasSubmitted(true); // Mark as submitted immediately
  
  try {
    console.log('🚀 [DEBUG] Starting auto-submission process...');
    console.log('📊 [DEBUG] Setting submissionStatus to "submitting"');
    setSubmissionStatus('submitting');
    
    console.log('🔨 [DEBUG] Formatting submission data...');
    const submissionData = formatSubmissionData();
    console.log('📊 [DEBUG] Submission data created:', submissionData ? 'SUCCESS' : 'FAILED');
    
    if (!submissionData) {
      console.error('❌ [DEBUG] No submission data available');
      setSubmissionStatus('error');
      setSubmissionError('No submission data available');
      return;
    }

    const sessionId = submissionData.assessment_metadata.session_id;
    const testid = submissionData?.user_data?.testid || '';
    console.log('🆔 [DEBUG] Session ID:', sessionId, 'Test ID:', testid);
    
    console.log('📤 [DEBUG] About to call finishQuest...');
    
    // Call finishQuest from context with submission data
    const result = await finishQuest(submissionData);
    
    console.log('✅ [DEBUG] finishQuest completed successfully:', result ? 'SUCCESS' : 'NO_RESULT');
    console.log('🔄 [DEBUG] Setting submissionStatus to "submitted"');
    setSubmissionStatus('submitted');
    
    console.log('🧭 [DEBUG] Setting isNavigating to true');
    setIsNavigating(true);
    
    console.log('🧹 [DEBUG] Clearing submission error');
    setSubmissionError(null);
    
    console.log('✅ [DEBUG] Quest submission process completed successfully');
    
  } catch (error: any) {
    console.error('❌ [DEBUG] Error caught in handleAutoSubmit:', error);
    console.error('❌ [DEBUG] Error message:', error.message);
    console.error('❌ [DEBUG] Error response:', error.response?.data);
    
    console.log('🔄 [DEBUG] Setting isNavigating to false due to error');
    setIsNavigating(false);
    
    console.log('🔄 [DEBUG] Setting submissionStatus to "error"');
    setSubmissionStatus('error');
    
    const errorMessage = error.response?.data?.message || error.message || 'Submission failed';
    console.log('📝 [DEBUG] Setting error message:', errorMessage);
    setSubmissionError(errorMessage);
    
    console.log('🔄 [DEBUG] Resetting hasSubmitted to false for retry');
    setHasSubmitted(false); // Reset on error to allow retry
  }
};
  
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

  // Retry function for failed submissions
  const handleRetry = () => {
    setHasSubmitted(false); // Reset the submission flag
    setSubmissionStatus('idle');
    setSubmissionError(null);
    handleAutoSubmit();
  };

  console.log('🎨 [DEBUG] Render state - submissionStatus:', submissionStatus, 'isNavigating:', isNavigating, 'submissionError:', submissionError);

  if (isNavigating) {
    console.log('🧭 [DEBUG] Showing navigation screen');
  return (
    <div className='h-screen flex items-center justify-center'>
      <div className="text-center px-4">
        <h2 className="text-2xl font-['Gilroy-Bold'] text-navy mb-4">
          Redirecting...
        </h2>
        <p className="text-gray-600 mb-6 font-['Gilroy-semiBold']">
          Taking you to your analysis results
        </p>
      </div>
    </div>
  );
}

if (submissionStatus === 'submitted') {
  console.log('✅ [DEBUG] Showing submitted screen (preventing error flash)');
  return (
    <div className='h-screen flex items-center justify-center'>
      <div className="text-center px-4">
        <h2 className="text-2xl font-['Gilroy-Bold'] text-navy mb-4">
          Submission Complete
        </h2>
        <p className="text-gray-600 mb-6 font-['Gilroy-semiBold']">
          Processing your responses...
        </p>
      </div>
    </div>
  );
}

  // Show loading state while submitting
  if (submissionStatus === 'submitting') {
    return (
      <QuestProcessing className={className} gifSrc={analysisGif} />
    );
  }

  // Show error state if submission failed
  if (submissionStatus === 'error') {
    console.log('❌ [DEBUG] Showing error screen');
    return (
      <div className='h-screen flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center px-4 py-12 max-w-3xl mx-auto text-center"
        > 
          <h2 className="text-2xl font-['Gilroy-Bold'] text-navy mb-4">
            OOPS...!
          </h2>
          
          <p className="text-gray-600 mb-6 max-w-md font-['Gilroy-semiBold']">
            {'Due to weak internet connection, your response was not submitted.'}
          </p>
          
          <motion.button
            onClick={handleRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 text-xl font-normal font-['Gilroy-Bold'] tracking-[-1px] bg-gradient-to-br from-sky-800 to-sky-400 text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Send Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // If somehow we reach here without submitting, show a fallback
  if (submissionStatus === 'idle') {
    return (
      <QuestLayout showHeader={false} showNavigation={false} className={className}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center px-4 py-12 max-w-3xl mx-auto text-center"
        >
          <h2 className="text-2xl font-playfair text-navy mb-4">
            Preparing Submission...
          </h2>
          <p className="text-gray-600">
            Getting ready to submit your assessment.
          </p>
        </motion.div>
      </QuestLayout>
    );
  }

  // This should not be reached if navigation works correctly
  return null;
}

export default QuestCompletion;
