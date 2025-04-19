import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SubtitleTranscription } from '@/types/subtitle';
import { getTokenStyles, TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions-container';
import { defaultSubtitleStyles } from '@/app/settings/subtitle/_subtitle-styles/constants';

type TranscriptionItemProps = {
  transcription: SubtitleTranscription;
  text: string;
}

export function TranscriptionItem({ transcription, text }: TranscriptionItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: transcription });
  
  const tokenStyles = getTokenStyles(true, defaultSubtitleStyles);
  
  const style = {
    ...tokenStyles.default,
    ...(isHovered ? tokenStyles.active : {}),
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className='text-lg md:text-xl'
      {...attributes}
      {...listeners}
    >
      {text}
    </div>
  );
}