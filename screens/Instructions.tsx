"use client"
import { useLang } from '@/lib/i18n';
import { createConversation } from "@/api/createConversation";
import {
  DialogWrapper,
  AnimatedTextBlockWrapper,
  StaticTextBlockWrapper,
} from "@/components/DialogWrapper";
import { screenAtom } from "@/store/screens";
import { conversationAtom } from "@/store/conversation";
import React, { useCallback, useMemo, useState } from "react";
import { getDefaultStore, useAtom } from "jotai";
import { settingsAtom } from "@/store/settings";
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
  const { tr } = useLang();
  const daily = useDaily();
  const { currentMic } = useDevices();
  const { createConversationRequest, isLoading: isCreatingConversation, error: conversationError } = useCreateConversationMutation();
  const [getUserMediaError, setGetUserMediaError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [error, setError] = useState(false);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);
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
      
      // Video needs a Tavus API key and a PAL (Nia's video agent). Say exactly what is missing.
      const settings = getDefaultStore().get(settingsAtom);
      if (!process.env.NEXT_PUBLIC_TAVUS_API_KEY) {
        setSetupMessage(tr(
          "Video with Nia isn’t set up yet: the Tavus API key (NEXT_PUBLIC_TAVUS_API_KEY) is missing. You can still chat with Nia by text.",
          "Video na Nia bado haijawekwa: ufunguo wa Tavus (NEXT_PUBLIC_TAVUS_API_KEY) haupo. Bado unaweza kuongea na Nia kwa maandishi."
        ));
        return;
      }
      if (!process.env.NEXT_PUBLIC_TAVUS_PAL_ID?.trim() && !settings.persona?.trim()) {
        setSetupMessage(tr(
          "Video with Nia isn’t set up yet: Nia’s Tavus PAL ID (NEXT_PUBLIC_TAVUS_PAL_ID) is missing. You can still chat with Nia by text.",
          "Video na Nia bado haijawekwa: kitambulisho cha PAL cha Nia kwenye Tavus (NEXT_PUBLIC_TAVUS_PAL_ID) hakipo. Bado unaweza kuongea na Nia kwa maandishi."
        ));
        return;
      }
      setSetupMessage(null);
      
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

  if (setupMessage) {
    return <ConversationError onClick={handleClick} message={setupMessage} />;
  }

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
              {isPlayingSound ? tr("Preparing...", "Inaandaa...") : 
               isCreatingConversation ? tr("Creating conversation...", "Inaanzisha mazungumzo...") : 
               tr("Loading...", "Inapakia...")}
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
          <span className="text-white">{tr("Need Support?", "Unahitaji Msaada?")}</span>{" "}
          <span style={{ color: '#ECE5DA' }}>{tr("I am Here.", "Niko Hapa.")}</span>
        </h1>
        <p className="max-w-[650px] text-center text-base sm:text-lg text-gray-400 mb-12">
          {tr("Have a face-to-face conversation with an AI mental health companion. I am here to listen, support, and help you through whatever you are experiencing.", "Fanya mazungumzo ana kwa ana na msaidizi wa AI wa afya ya akili. Niko hapa kusikiliza, kusaidia, na kukusaidia kupitia chochote unachopitia.")}
        </p>
        
        {getUserMediaError && (
          <div className="mb-6 flex items-center gap-2 text-wrap rounded-lg border bg-red-500/90 p-4 text-white backdrop-blur-sm max-w-md text-center">
            <AlertTriangle className="size-5 flex-shrink-0" />
            <p className="text-sm">
              {!process.env.NEXT_PUBLIC_TAVUS_API_KEY 
                ? tr("Tavus API key not configured. Please check your environment variables.", "Ufunguo wa API wa Tavus haujawekwa. Tafadhali angalia mipangilio ya mazingira.")
                : tr("Camera and microphone access required. Please allow permissions and try again.", "Ruhusa ya kamera na kipaza sauti inahitajika. Tafadhali ruhusu kisha ujaribu tena.")
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
            ? tr("API Key Required", "Ufunguo wa API Unahitajika")
            : permissionsGranted 
              ? tr("Start Video Chat", "Anza Mazungumzo ya Video") 
              : tr("Allow Camera & Mic", "Ruhusu Kamera na Kipaza Sauti")
          }
        </Button>
        
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:gap-8 text-gray-400 justify-center">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-colors ${
            permissionsGranted ? 'bg-[#2C4A4E]/30 text-[#ECE5DA]' : 'bg-gray-700/50 text-gray-400'
          }`}>
            <Mic className="size-5" />
            {permissionsGranted ? tr("Mic access granted", "Ruhusa ya kipaza sauti imetolewa") : tr("Mic access required", "Ruhusa ya kipaza sauti inahitajika")}
          </div>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-colors ${
            permissionsGranted ? 'bg-[#2C4A4E]/30 text-[#ECE5DA]' : 'bg-gray-700/50 text-gray-400'
          }`}>
            <Video className="size-5" />
            {permissionsGranted ? tr("Camera access granted", "Ruhusa ya kamera imetolewa") : tr("Camera access required", "Ruhusa ya kamera inahitajika")}
          </div>
        </div>
        
        <span className="absolute bottom-6 px-4 text-sm text-gray-500 sm:bottom-8 sm:px-8 text-center">
          {tr('By starting a conversation, I accept the', 'Kwa kuanza mazungumzo, ninakubali')}{' '}
          <a href="#" className="text-primary hover:underline">{tr("Terms of Use", "Masharti ya Matumizi")}</a> {tr('and acknowledge the', 'na ninatambua')}{' '}
          <a href="#" className="text-primary hover:underline">{tr("Privacy Policy", "Sera ya Faragha")}</a>.
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
