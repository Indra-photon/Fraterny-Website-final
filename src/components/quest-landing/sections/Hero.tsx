import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../common';
import { colors, spacing, responsiveClasses } from '../styles';
import { ChevronDown } from 'lucide-react';
import img from '../../../../public/Vector.svg';

interface HeroProps {
  onAnalyzeClick?: () => void;
  onScreenTransition?: () => void;
  className?: string;
}

// Simple animation variants like Code 1
const animationVariants = {
  invisible: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6
    }
  }
};

const Hero: React.FC<HeroProps> = ({ 
  onAnalyzeClick, 
  onScreenTransition,
  className = ''
}) => {
  const handleAnalyzeClick = () => {
    if (onAnalyzeClick) {
      onAnalyzeClick();
    }
  };

  return (

    <section className='w-screen border-2-red-500 h-full relative'>

      <motion.div 
        layoutId='bg'
        transition={{ duration: 1.2 }}
        className='absolute z-0 w-[554px] h-[554px] rounded-full'
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, #0C45F0 0%, #41D9FF 51%, #48B9D8 100%)',
          left: '-70px',
          top: '47%',
          filter: 'blur(30px)',
          boxShadow: '60px 60px 60px rgba(0, 0, 0, 0.1)',
        }} 
        />



      <div className='h-screen w-screen min-h-screen flex flex-col gap-20 relative top-[8%] pl-5'>

        <div className=' flex flex-col'>
          <motion.div 
            variants={animationVariants} 
            initial="invisible" 
            animate="visible"
            className='justify-start text-neutral-950 text-5xl font-normal font-["Gilroy-Regular"]'
          >
            hi there,
          </motion.div>

          <div className='flex gap-2'>
            <motion.div 
            variants={animationVariants} 
            initial="invisible" 
            animate="visible"
            className=""
            >
              <div className='justify-start text-neutral-500 text-7xl font-normal font-["Gilroy-Bold"]'>
                I'm
              </div>
            </motion.div>
            <motion.div
              layoutId='logo'
              transition={{ duration: 1.2 }}
              className="flex items-center"
            >
              {/* <img src={img} alt="Logo" className="mt-3" /> */}
              <div>
              <div className='text-7xl font-normal font-["Gilroy-Bold"] tracking-[-0.5rem]'>
                QUEST
              </div>
              <div className='text-xl font-normal font-["Gilroy-Regular"] tracking-[0.1rem] pl-5 mt-[-8px]'>
                BY FRATERNY
              </div>
              </div>
            </motion.div>
          </div>

        </div>

        <div className=' flex flex-col gap-0'>
          <motion.div 
            variants={animationVariants} 
            initial="invisible" 
            animate="visible"
            className='justify-start text-neutral-950 text-4xl font-normal font-["Gilroy-Regular"]'
          >
            i can
          </motion.div>
          <motion.div
            variants={animationVariants}
            initial="invisible"
            animate="visible"
            className=''
          >
            <span className='justify-start text-neutral-950 text-4xl font-normal font-["Gilroy-Bold"]'>
              Hack Your Brain
            </span>
          </motion.div>

          <motion.div 
          variants={animationVariants} 
          initial="invisible" 
          animate="visible"
        >
          <div className="justify-start text-neutral-950 text-4xl font-normal font-['Gilroy-Regular']">
            in 15 minutes.
          </div>
        </motion.div>

        </div>

        <div className=''>
          <div className="w-40 h-14 mix-blend-luminosity bg-gradient-to-br from-white/20 to-white/20 rounded-[30px] border-2 border-white flex items-center justify-center" >
              <div className="justify-center text-white text-2xl font-['Gilroy-Bold']">Analyse Me</div>

          </div>

        </div>
      </div>

    </section>
   
  );
};

export default Hero;