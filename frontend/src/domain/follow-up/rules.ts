import { FollowUpStatus } from "./followupStatus";

export const showPendingFollowUpIcon = (followUpStatus: FollowUpStatus) =>
  followUpStatus === "PENDING";

export const showCompletedFollowUpIcon = (followUpStatus: FollowUpStatus) =>
  followUpStatus === "COMPLETED";

export const showMissedFollowUpIcon = (followUpStatus: FollowUpStatus) =>
  followUpStatus === "MISSED";