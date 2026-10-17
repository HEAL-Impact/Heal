"use client"
import { createConversation } from "@/api/createConversation";
import {
  DialogWrapper,
  AnimatedTextBlockWrapper,
  StaticTextBlockWrapper,
} from "@/components/DialogWrapper";
import { screenAtom } from "@/store/screens";
import { conversationAtom } from "@/store/conversation";
import React, { useCallback, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { AlertTriangle, Mic, Video } from "lucide-react";
import { useDaily, useDailyEvent, useDevices } from "@daily-co/daily-react";
import { ConversationError } from "./ConversationError";
import { Button } from "@/components/ui/button";
import  QuantumLoader  from "@/components/QuantumLoader";

const useCreateConversationMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setScreenState] = useAtom(screenAtom);
  const [, setConversation] = useAtom(conversationAtom);

  const createConversationRequest = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Creating conversation...");
      const conversation = await createConversation();
      console.log("Conversation created:", conversation);
      
      setConversation(conversation);
      setScreenState({ currentScreen: "conversation" });
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setError(error instanceof Error ? error.message : "Failed to create conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createConversationRequest,
  };
};

export function Instructions() {
  const daily = useDaily();
  const { currentMic } = useDevices();
  const { createConversationRequest, isLoading: isCreatingConversation, error: conversationError } = useCreateConversationMutation();
  const [getUserMediaError, setGetUserMediaError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [error, setError] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  
  const audio = useMemo(() => {
    if (typeof window !== 'undefined') {
      const audioObj = new Audio('/sounds/zoom.mp3');
      audioObj.volume = 0.7;
      return audioObj;
    }
    return null;
  }, []);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  useDailyEvent(
    "camera-error",
    useCallback(() => {
      console.log("Camera error detected");
      setGetUserMediaError(true);
    }, []),
  );

  const requestPermissions = async () => {
    try {
      console.log("Requesting media permissions...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      
      console.log("Media permissions granted");
      setPermissionsGranted(true);
      setGetUserMediaError(false);
      
      // Stop the stream since we just needed permissions
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error("Failed to get media permissions:", error);
      setGetUserMediaError(true);
      return false;
    }
  };

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setError(false);
      
      // Check if Tavus API key is available
      if (!process.env.NEXT_PUBLIC_TAVUS_API_KEY) {
        setError(true);
        setGetUserMediaError(true);
        console.error("Tavus API key not found in environment variables");
        return;
      }
      
      // First, request permissions if not already granted
      if (!permissionsGranted) {
        const hasPermissions = await requestPermissions();
        if (!hasPermissions) {
          setIsLoading(false);
          return;
        }
      }

      // Play sound effect
      setIsPlayingSound(true);
      if (audio) {
        audio.currentTime = 0;
        await audio.play().catch(console.warn);
      }
      
      // Wait for sound to play
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsPlayingSound(false);
      setIsLoadingConversation(true);

      // Initialize Daily camera
      console.log("daily", daily)
      try {
        console.log("Starting Daily camera...");
        await daily?.startCamera({
          startVideoOff: false,
          startAudioOff: false,
          audioSource: "default",
        });
        console.log("Daily camera started successfully");
      } catch (dailyError) {
        console.warn("Daily camera start failed:", dailyError);
        // Continue anyway, as this might not be critical
      }
      
      // Create conversation
      await createConversationRequest();
      
    } catch (error) {
      console.error("Error in handleClick:", error);
      setError(true);
    } finally {
      setIsLoading(false);
      setIsLoadingConversation(false);
    }
  };

  // Show error if conversation creation failed
  if (conversationError) {
    return <ConversationError onClick={handleClick} message={conversationError} />;
  }

  if (isPlayingSound || isLoadingConversation || isCreatingConversation) {
    return (
      <DialogWrapper>
        <video
          src={"/video/gloria.mp4"}
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 h-full w-full object-cover"
        />
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <AnimatedTextBlockWrapper>
          <div className="flex flex-col items-center justify-center gap-4">
            <QuantumLoader />
            <p className="text-white text-lg">
              {isPlayingSound ? "Preparing..." : 
               isCreatingConversation ? "Creating conversation..." : 
               "Loading..."}
            </p>
          </div>
        </AnimatedTextBlockWrapper>
      </DialogWrapper>
    );
  }

  if (error) {
    return <ConversationError onClick={handleClick} />;
  }

  return (
    <DialogWrapper>
      <video
        src={"/video/gloria.mp4"}
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 h-full w-full object-cover"
      />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <AnimatedTextBlockWrapper>
        <h1 className="mb-4 pt-1 text-center text-3xl sm:text-4xl lg:text-5xl font-semibold">
          <span className="text-white">Need Support?</span>{" "}
          <span style={{ color: '#9EEAFF' }}>I am Here.</span>
        </h1>
        <p className="max-w-[650px] text-center text-base sm:text-lg text-gray-400 mb-12">
          Have a face-to-face conversation with an AI mental health companion. I am here to listen, support, and help you through whatever you are experiencing.
        </p>
        
        {getUserMediaError && (
          <div className="mb-6 flex items-center gap-2 text-wrap rounded-lg border bg-red-500/90 p-4 text-white backdrop-blur-sm max-w-md text-center">
            <AlertTriangle className="size-5 flex-shrink-0" />
            <p className="text-sm">
              {!process.env.NEXT_PUBLIC_TAVUS_API_KEY 
                ? "Tavus API key not configured. Please check your environment variables."
                : "Camera and microphone access required. Please allow permissions and try again."
              }
            </p>
          </div>
        )}
        
        <Button
          onClick={handleClick}
          className="relative z-20 flex items-center justify-center gap-2 rounded-3xl border border-[rgba(255,255,255,0.3)] px-8 py-2 text-sm text-white transition-all duration-200 hover:text-primary mb-12 disabled:opacity-50"
          disabled={isLoading || !process.env.NEXT_PUBLIC_TAVUS_API_KEY}
          style={{ height: '48px', transition: 'all 0.2s ease-in-out', backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
          <Video className="size-5" />
          {!process.env.NEXT_PUBLIC_TAVUS_API_KEY 
            ? "API Key Required"
            : permissionsGranted 
              ? "Start Video Chat" 
              : "Allow Camera & Mic"
          }
        </Button>
        
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:gap-8 text-gray-400 justify-center">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-colors ${
            permissionsGranted ? 'bg-green-500/30 text-green-200' : 'bg-gray-700/50 text-gray-400'
          }`}>
            <Mic className="size-5" />
            {permissionsGranted ? "Mic access granted" : "Mic access required"}
          </div>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-colors ${
            permissionsGranted ? 'bg-green-500/30 text-green-200' : 'bg-gray-700/50 text-gray-400'
          }`}>
            <Video className="size-5" />
            {permissionsGranted ? "Camera access granted" : "Camera access required"}
          </div>
        </div>
        
        <span className="absolute bottom-6 px-4 text-sm text-gray-500 sm:bottom-8 sm:px-8 text-center">
          By starting a conversation, I accept the{' '}
          <a href="#" className="text-primary hover:underline">Terms of Use</a> and acknowledge the{' '}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
        </span>
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};

export const PositiveFeedback: React.FC = () => {
  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <StaticTextBlockWrapper
          imgSrc="/images/positive.png"
          title="Great Conversation!"
          titleClassName="sm:max-w-full bg-[linear-gradient(91deg,_#43BF8F_16.63%,_#FFF_86.96%)]"
          description="Thanks for the engaging discussion. Feel free to come back anytime for another chat!"
        />
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};
