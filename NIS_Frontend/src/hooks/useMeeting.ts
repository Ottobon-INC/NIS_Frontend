import { useQuery, useMutation } from '@tanstack/react-query';
import { meetingsApi } from '../services/api/meetings.api';

export const useMeeting = (meetingId: string) => {
  return useQuery({
    queryKey: ['meetingBrief', meetingId],
    queryFn: () => meetingsApi.getBrief(meetingId),
    enabled: !!meetingId
  });
};

export const useMeetingCapture = (meetingId: string) => {
  return useMutation({
    mutationFn: (data: { transcript?: string, audioUrl?: string }) => meetingsApi.capture(meetingId, data)
  });
};
