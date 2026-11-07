import { useLang } from '@/lib/i18n';
import { DialogWrapper, AnimatedTextBlockWrapper } from "@/components/DialogWrapper";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import React from "react";

export const ConversationError: React.FC<{ onClick: () => void; message?: string }> = ({ onClick, message }) => {
  const { tr } = useLang();
  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <div className="flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="text-red-500 size-10" />
          <h2 className="text-2xl font-semibold text-white">{tr("Something went wrong", "Kuna hitilafu imetokea")}</h2>
          <p className="text-gray-400 text-center max-w-md">
            {message || tr("We couldn't start your video conversation. Please check your camera and microphone permissions, then try again.", "Hatukuweza kuanzisha mazungumzo yako ya video. Tafadhali angalia ruhusa za kamera na kipaza sauti, kisha ujaribu tena.")}
          </p>
          <Button onClick={onClick} className="mt-4">{tr("Try Again", "Jaribu Tena")}</Button>
        </div>
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};
