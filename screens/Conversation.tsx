import { DialogWrapper } from "@/components/DialogWrapper";
import {
  DailyAudio,
  useDailyEvent,
  useDaily,
  useLocalSessionId,
  useParticipantIds,
  useVideoTrack,
  useAudioTrack,
} from "@daily-co/daily-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Video from "@/components/Video";
import { conversationAtom } from "@/store/conversation";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { Button } from "@/components/ui/button";
import { endConversation } from "@/api/endConversation";
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PhoneIcon,
} from "lucide-react";
import {
  clearSessionTime,
  getSessionTime,
  setSessionStartTime,
  updateSessionEndTime,
} from "@/utils";
import { Timer } from "@/components/Timer";
import { TIME_LIMIT } from "@/config";
import { cn } from "@/utils";
import  QuantumLoader  from "@/components/QuantumLoader";

const timeToGoPhrases = [
  "I'll need to wrap up our conversation soon—let's make these last moments count.",
  "I'll be ending our session soon, but I've got a little more time for you!",
  "Our time is almost up, but I'd love to hear one more thing before we finish!",
];

const outroPhrases = [
  "It's time for me to go now. Take care, and remember I'm here whenever you need support!",
  "I need to end our session now. You did great today - see you next time!",
  "I must say goodbye for now. Stay well, and remember you're not alone in this journey!",
];

export const Conversation: React.FC = () => {
  const [conversation, setConversation] = useAtom(conversationAtom);
  const [, setScreenState] = useAtom(screenAtom);

  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = localVideo && !localVideo.isOff;
  const isMicEnabled = localAudio && !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });
  const [start, setStart] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const joinAttempt = useRef<{ daily: NonNullable<typeof daily>; url: string } | null>(null);
  const timerConversation = useRef<string | null>(null);
  const isLeaving = useRef(false);

  // A ref locks the join synchronously, including React Strict Mode effect replay.
  // Join the conversation when conversation URL is available
  useEffect(() => {
    const url = conversation?.conversation_url;
    if (!url || !daily) return;
    const previousAttempt = joinAttempt.current;
    if (previousAttempt && previousAttempt.daily === daily && previousAttempt.url === url) return;
    joinAttempt.current = { daily, url };
    if (daily.meetingState() === "joined-meeting") return;
    setIsJoining(true);
    setJoinError(null);

    daily
      .join({
        url,
        startVideoOff: false,
        startAudioOff: true,
      })
      .then(() => {
        console.log("Successfully joined conversation");
        daily.setLocalVideo(true);
        daily.setLocalAudio(false);
        setIsJoining(false);
      })
      .catch((error: Error) => {
        console.error("Failed to join conversation:", error);
        setJoinError(error.message || "Failed to join conversation");
        setIsJoining(false);
      });
  }, [conversation?.conversation_url, daily]);

  // Handle remote participant joining
  useEffect(() => {
    if (remoteParticipantIds.length && !start) {
      console.log("Remote participant joined, starting conversation");
      setStart(true);
    }
  }, [remoteParticipantIds.length, start]);

  useEffect(() => {
    if (!start || !daily) return;
    const timeout = setTimeout(() => daily.setLocalAudio(true), 2000);
    return () => clearTimeout(timeout);
  }, [start, daily]);

  const leaveConversation = useCallback(async () => {
    if (isLeaving.current) return;
    isLeaving.current = true;
    try {
      await daily?.leave();
    } catch (error) {
      console.error("Error leaving Daily room:", error);
    }
    try {
      if (conversation?.conversation_id) {
        await endConversation(conversation.conversation_id);
      }
    } catch (error) {
      console.error("Error ending Tavus conversation:", error);
    } finally {
      setConversation(null);
      clearSessionTime();
      setScreenState({ currentScreen: "introLoading" });
    }
  }, [daily, conversation?.conversation_id, setConversation, setScreenState]);

  useDailyEvent("error", useCallback((event) => {
    if (isLeaving.current) return;
    setIsJoining(false);
    setJoinError(event?.errorMsg || "The video session ended. Start a new conversation to reconnect.");
  }, []));

  useDailyEvent("left-meeting", useCallback(() => {
    if (isLeaving.current) return;
    setIsJoining(false);
    setJoinError("This video session has ended. Start a new conversation to reconnect.");
  }, []));

  // Timer and session management
  useEffect(() => {
    if (!remoteParticipantIds.length || !start) return;

    console.log("Starting session timer");
    if (timerConversation.current !== conversation?.conversation_id) {
      timerConversation.current = conversation?.conversation_id || null;
      clearSessionTime();
      setSessionStartTime();
    }

    const interval = setInterval(() => {
      updateSessionEndTime();
      const time = getSessionTime();

      if (time === TIME_LIMIT - 60) {
        daily?.sendAppMessage({
          message_type: "conversation",
          event_type: "conversation.echo",
          conversation_id: conversation?.conversation_id,
          properties: {
            modality: "text",
            text: timeToGoPhrases[Math.floor(Math.random() * timeToGoPhrases.length)],
          },
        });
      }

      if (time === TIME_LIMIT - 10) {
        daily?.sendAppMessage({
          message_type: "conversation",
          event_type: "conversation.echo",
          conversation_id: conversation?.conversation_id,
          properties: {
            modality: "text",
            text: outroPhrases[Math.floor(Math.random() * outroPhrases.length)],
          },
        });
      }

      if (time >= TIME_LIMIT) {
        console.log("Time limit reached, ending conversation");
        leaveConversation();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [remoteParticipantIds.length, start, daily, conversation?.conversation_id, leaveConversation]);

  const toggleVideo = useCallback(() => {
    if (daily) {
      daily.setLocalVideo(!isCameraEnabled);
    }
  }, [daily, isCameraEnabled]);

  const toggleAudio = useCallback(() => {
    if (daily) {
      daily.setLocalAudio(!isMicEnabled);
    }
  }, [daily, isMicEnabled]);

  // Show loading until Daily is ready
  if (!daily) {
    return (
      <DialogWrapper>
        <div className="absolute inset-0 flex h-full items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-4">
            <QuantumLoader />
            <p className="text-white text-lg">Initializing video call...</p>
          </div>
        </div>
      </DialogWrapper>
    );
  }

  // Show loading state while joining
  if (isJoining || (!remoteParticipantIds.length && !joinError)) {
    return (
      <DialogWrapper>
        <div className="absolute inset-0 flex h-full items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-4">
            <QuantumLoader />
            <p className="text-white text-lg">
              {isJoining ? "Joining conversation..." : "Waiting for AI to connect..."}
            </p>
          </div>
        </div>
      </DialogWrapper>
    );
  }

  // Show error state
  if (joinError) {
    return (
      <DialogWrapper>
        <div className="absolute inset-0 flex h-full items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="text-red-500 text-6xl">⚠️</div>
            <h2 className="text-white text-xl font-semibold">Connection Failed</h2>
            <p className="text-gray-300">{joinError}</p>
            <Button onClick={leaveConversation} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </DialogWrapper>
    );
  }

  return (
    <DialogWrapper>
      <div className="absolute inset-0 size-full">
        {remoteParticipantIds?.length > 0 ? (
          <>
            <div className="absolute inset-0 w-full h-full">
              <Video
                id={remoteParticipantIds[0]}
                className="w-full h-full min-h-full min-w-full max-w-none max-h-none object-cover"
                tileClassName="w-full h-full min-h-full min-w-full max-w-none max-h-none object-cover"
              />
              {/* Timer overlay, always visible in top-left */}
              <div className="pointer-events-none absolute left-4 top-4 z-20">
                <Timer />
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-4">
              <QuantumLoader />
              <p className="text-white text-lg">Connecting to AI...</p>
            </div>
          </div>
        )}

        {localSessionId && (
          <Video
            id={localSessionId}
            tileClassName="!object-cover"
            className={cn(
              "absolute bottom-20 right-4 aspect-video h-29 w-52 overflow-hidden rounded-lg border-2 border-[#22C5FE] shadow-[0_0_20px_rgba(34,197,254,0.3)] "
            )}
          />
        )}

        <div className="absolute bottom-8 right-1/2 z-10 flex translate-x-1/2 justify-center gap-4">
          <Button
            size="icon"
            className="border border-[#22C5FE] shadow-[0_0_20px_rgba(34,197,254,0.2)] h-12 w-12"
            variant="secondary"
            onClick={toggleAudio}
          >
            {!isMicEnabled ? (
              <MicOffIcon className="size-6" />
            ) : (
              <MicIcon className="size-6" />
            )}
          </Button>
          <Button
            size="icon"
            className="border border-[#22C5FE] shadow-[0_0_20px_rgba(34,197,254,0.2)] h-12 w-12"
            variant="secondary"
            onClick={toggleVideo}
          >
            {!isCameraEnabled ? (
              <VideoOffIcon className="size-6" />
            ) : (
              <VideoIcon className="size-6" />
            )}
          </Button>
          <Button
            size="icon"
            className="bg-[rgba(251,36,71,0.80)] backdrop-blur hover:bg-[rgba(251,36,71,0.60)] border border-[rgba(251,36,71,0.9)] shadow-[0_0_20px_rgba(251,36,71,0.3)] h-12 w-12"
            variant="secondary"
            onClick={leaveConversation}
          >
            <PhoneIcon className="size-6 rotate-[135deg]" />
          </Button>
        </div>
        <DailyAudio />
      </div>
    </DialogWrapper>
  );
};
